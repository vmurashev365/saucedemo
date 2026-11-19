import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { assertSelectedItems } from '../../src/utils/CheckoutAssertions';
import { DataHelper } from '../../src/utils/DataHelper';
import { checkoutFixture } from './checkout-fixture';

const cartStep = 'the cart should contain exactly the selected items, prices, and quantities';
const overviewStep = 'the overview should contain exactly the selected items, prices, and quantities';
const subtotalStep = 'the subtotal should equal the sum of all item prices';
const taxStep = 'the tax should equal 8% of the subtotal';
const totalStep = 'the total should equal subtotal plus tax';

const summary = 'Verify order summary calculations';
const cancelScenarios = ['Cancel checkout from step one', 'Cancel checkout from overview page'];
const afterOrder = 'Return to products after successful checkout';
const emptyCart = 'View empty cart';
const emptyCheckout = 'Attempt checkout with empty cart';
const cartDestination = 'I should be redirected to the cart page';
const retainedItems = 'my items should still be in the cart';
const inventoryDestination = 'I should be taken back to the inventory page';
const shoppingVisible = 'I should see "Continue Shopping" button';
const shoppingEnabled = 'Continue Shopping should be enabled in the cart';
const checkoutGate = 'checkout should be unavailable with an empty cart';
const emptyAfterOrder = 'the shopping cart should be empty';

type FixtureOptions = Parameters<typeof checkoutFixture>[0];

interface StepCheck {
  scenario: string;
  step: string;
  status?: 'passed' | 'skipped';
}

interface ExpectedFailure {
  scenario: string;
  step: string;
  message: string;
  details?: string[];
  landingPath?: string;
}

interface BrowserCase {
  id: string;
  options: FixtureOptions;
  scenarios: string[];
  checks: StepCheck[];
  failures: ExpectedFailure[];
  guardedSmoke?: boolean;
}

const correct: BrowserCase = {
  id: 'correct',
  options: {},
  scenarios: ['Complete checkout with multiple items', summary, ...cancelScenarios, afterOrder, emptyCart, emptyCheckout],
  checks: [
    ...[cartStep, overviewStep, subtotalStep, taxStep, totalStep].map(step => ({ scenario: summary, step })),
    ...cancelScenarios.flatMap(scenario => [cartDestination, retainedItems].map(step => ({ scenario, step }))),
    { scenario: 'Complete checkout with multiple items', step: 'I should see the order completion confirmation' },
    { scenario: afterOrder, step: emptyAfterOrder },
    { scenario: emptyCart, step: shoppingEnabled },
    { scenario: emptyCart, step: inventoryDestination },
    { scenario: emptyCheckout, step: checkoutGate }
  ],
  failures: []
};

const disabledContinueShopping: BrowserCase = {
  id: 'continue-shopping-disabled',
  options: { disableContinueShopping: true },
  scenarios: [emptyCart],
  checks: [{ scenario: emptyCart, step: shoppingVisible }],
  failures: [{
    scenario: emptyCart, step: shoppingEnabled, message: 'Error: expect(locator).toBeEnabled() failed',
    details: ['[data-test="continue-shopping"]', 'Expected: enabled', 'Received: disabled'], landingPath: '/cart.html'
  }]
};

function rowControl(surface: 'cart' | 'overview', change: NonNullable<FixtureOptions['row']>['change'],
  message: string): BrowserCase {
  const onCart = surface === 'cart';
  return {
    id: change === 'wrong-price' ? 'cart-price' : `${surface}-${change}`,
    options: { row: { surface, change } },
    scenarios: [summary],
    checks: [{ scenario: summary, step: onCart ? 'I am on the cart page' : cartStep }],
    failures: [{ scenario: summary, step: onCart ? cartStep : overviewStep, message: `Error: ${message}`,
      landingPath: onCart ? '/cart.html' : '/checkout-step-two.html' }]
  };
}

const backpack = 'Sauce Labs Backpack';
const priceMismatch = `price for ${backpack}: expected $29.99, actual $0.01.`;
const controls: BrowserCase[] = [
  rowControl('cart', 'wrong-price', `Cart ${priceMismatch}`),
  ...(['cart', 'overview'] as const).flatMap(surface => {
    const label = surface === 'cart' ? 'Cart' : 'Checkout overview';
    const row = `${label} row 1 (${backpack})`;
    return [
      rowControl(surface, 'hidden-reference-price', `${label} ${priceMismatch}`),
      rowControl(surface, 'hidden-prices', `${row} price: expected one visible field, actual only hidden fields.`),
      rowControl(surface, 'hidden-quantities', `${row} quantity: expected one visible field, actual only hidden fields.`)
    ];
  }),
  rowControl('cart', 'missing-name', 'Cart row 1 name: expected one visible field, actual no matching field.'),
  rowControl('cart', 'blank-quantity', `Cart row 1 (${backpack}) quantity: expected nonblank text, actual blank.`),
  rowControl('cart', 'duplicate-price', `Cart row 1 (${backpack}) price: expected one visible field, actual 2 visible fields.`),
  {
    id: 'tax', options: { tax: '$9.99' }, scenarios: [summary],
    checks: [
      ...[cartStep, overviewStep, subtotalStep].map(step => ({ scenario: summary, step })),
      { scenario: summary, step: totalStep, status: 'skipped' }
    ],
    failures: [{ scenario: summary, step: taxStep, message: 'Error: Tax: expected $3.20, actual $9.99.',
      landingPath: '/checkout-step-two.html' }]
  },
  {
    id: 'cancel-loses-bike-light', options: { loseBikeLightOnCancel: true }, scenarios: cancelScenarios,
    checks: cancelScenarios.flatMap(scenario => [cartStep, cartDestination].map(step => ({ scenario, step }))),
    failures: cancelScenarios.map(scenario => ({ scenario, step: retainedItems, landingPath: '/cart.html',
      message: `Error: Cart items: expected ["${backpack}","Sauce Labs Bike Light"], actual ["${backpack}"].` }))
  },
  {
    id: 'order-retains-backpack', options: { retainCartAfterOrder: true }, scenarios: [afterOrder],
    checks: [cartStep, 'I have completed a successful checkout', 'I click "Back Home"', inventoryDestination]
      .map(step => ({ scenario: afterOrder, step })),
    failures: [{ scenario: afterOrder, step: emptyAfterOrder,
      message: 'Error: expect(locator).toHaveCount(expected) failed', landingPath: '/cart.html',
      details: ['.cart_item', 'Expected: 0', 'Received: 1'] }]
  },
  disabledContinueShopping,
  { ...disabledContinueShopping, id: 'smoke-failing-scenario', guardedSmoke: true }
];

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

async function runCase(testCase: BrowserCase): Promise<void> {
  const requests: string[] = [];
  const server = checkoutFixture(testCase.options, requests);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}/`;
    const reportDir = `reports/business/local/${testCase.id}`;
    await mkdir(reportDir, { recursive: true });

    const entry = testCase.guardedSmoke ? 'tests/run-smoke.js'
      : join(dirname(require.resolve('@cucumber/cucumber/package.json')), 'bin', 'cucumber.js');
    const names = `^(${testCase.scenarios.join('|')})$`;
    const child = spawn(process.execPath, [entry, '--name', names], {
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
    const failures = scenarios.flatMap(scenario => scenario.steps.filter(step => step.result.status === 'failed')
      .map(step => {
        const diagnostic = stripVTControlCharacters(step.result.error_message ?? '');
        return { scenario: scenario.name, step: step.name, message: diagnostic.split(/\r?\n/, 1)[0].trimEnd(), diagnostic };
      }));
    const checkedSteps = testCase.checks.map(({ scenario, step }) => ({ scenario, step,
      actual: scenarios.find(item => item.name === scenario)?.steps.find(item => item.name === step)?.result.status
    }));
    const evidence = scenarios.map(scenario => {
      const attachments = scenario.steps.flatMap(step => step.embeddings ?? []);
      const metadata = attachments.find(item => item.mime_type === 'application/json');
      const files: { url: string; screenshot: string; trace: string } | undefined = metadata
        && JSON.parse(Buffer.from(metadata.data, 'base64').toString('utf8'));
      return { scenario: scenario.name, files, images: attachments.filter(item => item.mime_type === 'image/png') };
    });
    await writeFile(join(reportDir, 'checks.json'), JSON.stringify({
      variant: testCase.id, baseUrl, code, signal, scenarios: scenarios.map(scenario => scenario.name), failures,
      checkedSteps, visitedPaths: requests, html: 'cucumber-report.html',
      evidence: evidence.filter(item => item.files).map(({ scenario, files }) => ({ scenario, ...files }))
    }, null, 2) + '\n');

    assert.equal(code, testCase.failures.length ? 1 : 0);
    assert.deepEqual(scenarios.map(scenario => scenario.name).sort(), [...testCase.scenarios].sort());
    assert.equal(failures.length, testCase.failures.length);
    for (const [index, { scenario, step, status }] of testCase.checks.entries()) {
      assert.equal(checkedSteps[index].actual, status ?? 'passed', `${scenario}: ${step}`);
    }
    for (const { scenario, files, images } of evidence) {
      const expected = testCase.failures.find(failure => failure.scenario === scenario);
      assert.equal(images.length, expected ? 1 : 0, scenario);
      if (!expected) continue;
      const actual = failures.find(failure => failure.scenario === scenario);
      assert.equal(actual?.step, expected.step, scenario);
      assert.equal(actual?.message, expected.message, scenario);
      for (const detail of expected.details ?? []) {
        assert.ok(actual?.diagnostic.includes(detail), `${scenario}: ${detail}`);
      }
      assert(files?.screenshot && files.trace, `Expected failure screenshot and trace for ${scenario}`);
      assert.equal(new URL(files.url).pathname, expected.landingPath, scenario);
      assert.deepEqual(await readFile(join(reportDir, files.screenshot)), Buffer.from(images[0].data, 'base64'));
      assert.equal((await readFile(join(reportDir, files.trace))).subarray(0, 4).toString('hex'), '504b0304');
    }
    const html = await readFile(join(reportDir, 'cucumber-report.html'), 'utf8');
    assert.match(html, /<html\b/i);
    if (testCase.id === 'cart-price') assert.ok(!requests.includes('/checkout-step-one.html'));
    console.log(`Verified local ${testCase.id}. Child exit code ${code}.`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

async function main(): Promise<void> {
  switch (process.argv[2]) {
    case 'correct':
      await runCase(correct);
      break;
    case 'negative': {
      const messages = checkInvalidInputs();
      await mkdir('reports/business/local', { recursive: true });
      await writeFile('reports/business/local/invalid-inputs.json', JSON.stringify(messages, null, 2) + '\n');
      for (const testCase of controls) await runCase(testCase);
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
