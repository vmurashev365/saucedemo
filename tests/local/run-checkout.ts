import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { assertSelectedItems } from '../../src/utils/CheckoutAssertions';
import { DataHelper } from '../../src/utils/DataHelper';
import { checkoutFixture, FixtureCase } from './checkout-fixture';

const cartStep = 'the cart should contain exactly the selected items, prices, and quantities';
const overviewStep = 'the overview should contain exactly the selected items, prices, and quantities';
const subtotalStep = 'the subtotal should equal the sum of all item prices';
const taxStep = 'the tax should equal 8% of the subtotal';
const totalStep = 'the total should equal subtotal plus tax';

const expectations = {
  correct: { code: 0, failures: [] },
  'cart-price': {
    code: 1,
    failures: [{ step: cartStep, message: 'Error: Cart price for Sauce Labs Backpack: expected $29.99, actual $0.01.' }]
  },
  tax: {
    code: 1,
    failures: [{ step: taxStep, message: 'Error: Tax: expected $3.20, actual $9.99.' }]
  }
};

interface ReportStep {
  name?: string;
  result: { status: string; error_message?: string };
  embeddings?: { mime_type: string; data: string }[];
}

function checkInvalidInputs() {
  const name = 'Sauce Labs Backpack';
  const selected = [{ name, catalogPriceCents: 2999, expectedQuantity: 1 }];
  const failures = [
    'Reference price for Unlisted product: expected a USD price in testData.json, actual missing.',
    `Cart quantity for ${name}: expected 1, actual blank.`,
    `Cart quantity for ${name}: expected 1, actual 0.`
  ];
  assert.throws(() => DataHelper.getReferencePrice('Unlisted product'), { message: failures[0] });
  for (const [index, quantityText] of [' ', '0'].entries()) {
    assert.throws(() => assertSelectedItems('Cart', selected, [{ name, price: '$29.99', quantityText }]), {
      message: failures[index + 1]
    });
  }
  return failures;
}

async function runCase(variant: FixtureCase): Promise<void> {
  const requests = new Set<string>();
  const server = checkoutFixture(variant, requests);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}/`;
    const reportDir = `reports/business/local/${variant}`;
    await mkdir(reportDir, { recursive: true });

    const cucumber = join(dirname(require.resolve('@cucumber/cucumber/package.json')), 'bin', 'cucumber.js');
    const tags = variant === 'correct' ? '@TC-043 or @TC-047' : '@TC-047';
    const child = spawn(process.execPath, [cucumber, '--profile', 'file', 'tests/features/checkout.feature', '--tags', tags], {
      env: { ...process.env, BASE_URL: baseUrl, REPORT_DIR: reportDir, HEADED: 'false', BROWSER: 'chromium',
        DEBUG: 'false', TIMEOUT: '6000', TAGS: 'not @skip' }
    });
    let output = '';
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding('utf8').on('data', (line: string) => { output += line; });
    }
    const [code, signal] = await once(child, 'close');
    await writeFile(join(reportDir, 'console.log'), output);
    process.stdout.write(output);
    assert.equal(signal, null);
    const report: { elements: { name: string; steps: ReportStep[] }[] }[] =
      JSON.parse(await readFile(join(reportDir, 'cucumber-report.json'), 'utf8'));
    const scenarios = report.flatMap(feature => feature.elements);
    const steps = scenarios.flatMap(scenario => scenario.steps);
    const failures = steps.filter(step => step.result.status === 'failed').map(step => ({
      step: step.name,
      message: step.result.error_message?.split(/\r?\n/, 1)[0]
    }));
    const requiredPasses = variant === 'cart-price' ? ['I am on the cart page']
      : variant === 'tax' ? [cartStep, overviewStep, subtotalStep]
      : [cartStep, overviewStep, subtotalStep, taxStep, totalStep, 'I should see the order completion confirmation'];
    const checkedSteps = Object.fromEntries(requiredPasses.map(name => [name,
      steps.filter(step => step.name === name).map(step => step.result.status)]));
    const totalsAfterTax = steps.filter(step => step.name === totalStep).map(step => step.result.status);
    const attachments = steps.flatMap(step => step.embeddings ?? []);
    const images = attachments.filter(item => item.mime_type === 'image/png');
    const metadata = attachments.find(item => item.mime_type === 'application/json');
    const evidence: { screenshot?: string; trace?: string } | undefined = metadata
      && JSON.parse(Buffer.from(metadata.data, 'base64').toString('utf8'));
    await writeFile(join(reportDir, 'checks.json'), JSON.stringify({
      variant, baseUrl, code, signal, scenarios: scenarios.map(scenario => scenario.name), failures,
      checkedSteps, totalsAfterTax, visitedPaths: [...requests], evidence
    }, null, 2) + '\n');

    assert.equal(code, expectations[variant].code);
    assert.deepEqual(failures, expectations[variant].failures);
    assert.equal(images.length, code === 1 ? 1 : 0);
    if (code === 1) {
      assert(evidence?.screenshot && evidence.trace, 'Expected failure screenshot and trace paths');
      assert.deepEqual(await readFile(join(reportDir, evidence.screenshot)), Buffer.from(images[0].data, 'base64'));
      assert.equal((await readFile(join(reportDir, evidence.trace))).subarray(0, 4).toString('hex'), '504b0304');
    }
    assert.equal(scenarios.length, variant === 'correct' ? 2 : 1);
    for (const [name, statuses] of Object.entries(checkedSteps)) {
      assert.ok(statuses.length && statuses.every(status => status === 'passed'), name);
    }
    const requiredPaths = ['/', '/inventory.html', '/cart.html'];
    if (variant !== 'cart-price') requiredPaths.push('/checkout-step-one.html', '/checkout-step-two.html');
    if (variant === 'correct') requiredPaths.push('/checkout-complete.html');
    assert.deepEqual([...requests], requiredPaths);
    if (variant === 'correct') assert.ok(steps.every(step => step.result.status === 'passed'));
    if (variant === 'tax') assert.deepEqual(totalsAfterTax, ['skipped']);
    console.log(`Verified local ${variant} case. Cucumber exit code ${code}.`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

async function main(): Promise<void> {
  switch (process.argv[2]) {
    case 'correct':
      await runCase('correct');
      break;
    case 'negative': {
      const messages = checkInvalidInputs();
      await mkdir('reports/business/local', { recursive: true });
      await writeFile('reports/business/local/invalid-inputs.json', JSON.stringify(messages, null, 2) + '\n');
      await runCase('cart-price');
      await runCase('tax');
      break;
    }
    default:
      throw new Error('Choose correct or negative.');
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
