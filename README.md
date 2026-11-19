# SauceDemo QA portfolio

Manual QA and browser automation for the [SauceDemo storefront](https://www.saucedemo.com/). Follow two checkout cases from the written requirement to the browser result.

| Case | Manual case | Automation | Observed result |
| --- | --- | --- | --- |
| TC-045 · Cancel from information | [PDF, pp. 23–24](test_documents/Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf#page=23) | [Scenario](tests/features/checkout.feature#L100-L104) · [Cart assertion](src/pages/CartPage.ts#L50-L54) | Returned directly to the cart with both items. [Browser screenshot](test_documents/checkout-evidence/cancel-information-after.png) |
| TC-046 · Cancel from overview | [PDF, p. 25](test_documents/Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf#page=25) | [Scenario](tests/features/checkout.feature#L106-L111) · [Cart assertion](src/pages/CartPage.ts#L50-L54) | Returned to Products. The manual case expects the cart. [Browser screenshot](test_documents/checkout-evidence/cancel-overview-after.png) |

[Short QA note with reproduction steps and evidence](test_documents/checkout-cancel-qa-note.md)

## Sample reports

| Run | Repository screenshot | Download |
| --- | --- | --- |
| Live Chromium smoke · 4 of 4 passed | [Screenshot of the Cucumber report](test_documents/portfolio/smoke-report.png) | [HTML report in ZIP](test_documents/portfolio/smoke-report.zip?raw=1) |
| Controlled tax failure · local fixture | [Screenshot of the failed tax assertion](test_documents/portfolio/controlled-tax-report.png) | [HTML report and Playwright trace in ZIP](test_documents/portfolio/controlled-tax-report.zip?raw=1) |

Extract either ZIP and open `cucumber-report.html` locally. The screenshots are static previews. The controlled fixture deliberately changes the displayed tax from $3.20 to $9.99. It runs separately from live regression.

## Manual QA

| Artifact | What it covers |
| --- | --- |
| [User story mapping](test_documents/User%20Story%20Mapping%20-%20SauceDemo.pdf) | Customer journeys across the storefront |
| [Test strategy](test_documents/Test%20Strategy%20Document%20-%20SauceDemo.pdf) | Test scope, approach, and priorities |
| [Manual test cases](test_documents/Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf) | Test steps and expected results |
| [Original automation results](test_documents/baseline-2025-08/README.md) | August 2025 run results, failure details, and original evidence |
| [Cart and checkout review](test_documents/checkout-review.md) | Manual rules, observed discrepancies, and local assertion controls |

## Automation

Cucumber 13.3.0 runs the Gherkin features. Playwright 1.65.1 drives the browser and provides assertions. TypeScript 7.0.2 checks the test code, and tsx loads it at runtime. Page objects live in [src/pages](src/pages), with Cucumber step definitions and hooks under [tests](tests).

| Feature | Scenarios after expanding Examples | Coverage |
| --- | ---: | --- |
| [Authentication](tests/features/login.feature) | 10 | Valid accounts, locked-out users, invalid credentials, and required fields |
| [Inventory](tests/features/inventory.feature) | 11 | Product details, sorting, and cart badge updates |
| [Cart](tests/features/cart.feature) | 8 | Contents, quantities, item removal, and navigation |
| [Checkout](tests/features/checkout.feature) | 10 | Order completion, totals, form validation, and cancellation |
| **Total** | **39** | |

### Install and verify

Use Node.js 24.x, npm, and Git. Run these commands from the repository root.

```sh
npm ci
npm run typecheck
npm run bdd:dry
npx playwright install chromium
npm run test:smoke:headless
npm run test:full:headless
```

The dry run checks discovery of 39 scenarios without browser actions. The smoke command runs four live scenarios and fails if its Cucumber invocation collects zero `@smoke` scenarios. The full command runs all 39, including the two documented SauceDemo discrepancies that currently cause exit code 1. The workflow runs guarded smoke on pull requests, runs the full suite on manual dispatch, and uploads available reports on failure. [Cart and checkout review](test_documents/checkout-review.md) · [GitHub Actions workflow](.github/workflows/qa.yml)

### Run modes

The default is headed Chromium. Use `HEADED=false` for headless execution.

| Command | Mode |
| --- | --- |
| `npm test` | Full suite using the configured browser |
| `npm run test:chrome` | Playwright Chromium |
| `npm run test:firefox` | Playwright Firefox |
| `npm run test:safari` | Playwright WebKit, the engine used by Safari |
| `npm run test:headed` or `npm run test:visible` | Explicitly headed |
| `npm run test:debug` | Headed with page console output, video, and HAR |
| `npm run test:smoke` or `npm run test:smoke:visible` | Smoke scenarios, optionally forced headed |
| `npm run test:login` or `npm run test:login:visible` | Authentication scenarios, optionally forced headed |
| `npm run test:positive`, `npm run test:negative` | Positive or negative scenarios |
| `npm run test:inventory`, `npm run test:cart`, `npm run test:checkout` | Individual feature areas |

Pass extra Cucumber options after `--`. The standard tag expression is `not @skip`. `TAGS` supplies an alternative base expression, and a CLI tag filter is combined with it.

```sh
npm test -- --tags "@smoke and @positive"
npx cucumber-js --tags "@e2e"
npx cucumber-js --profile file tests/features/login.feature
```

Use `--profile file` for a feature path or line selection. Cucumber 13 combines CLI paths with the configured glob under the default profile. [Cucumber path configuration](https://github.com/cucumber/cucumber-js/blob/v13.3.0/docs/deprecations.md#paths-in-configuration-and-cli)

For a headless run in PowerShell:

```powershell
$env:HEADED = 'false'
npm test
Remove-Item Env:HEADED
```

For Bash or a POSIX shell:

```sh
HEADED=false npm test
```

| Environment variable | Default | Effect |
| --- | --- | --- |
| `BROWSER` | `chromium` | Selects `chromium`, `firefox`, or `webkit` |
| `HEADED` | `true` | Set to `false` to run headless |
| `DEBUG` | `false` | Set to `true` to record diagnostics |
| `BASE_URL` | `https://www.saucedemo.com` | Selects the SauceDemo deployment |
| `VIEWPORT` | `1920x1080` | Sets the headless viewport |
| `TIMEOUT` | `30000` | Sets the Playwright action, navigation, and Page Object assertion timeout in milliseconds. Cucumber gives each step and hook one additional second to surface Playwright errors |
| `TAGS` | `not @skip` | Sets the base Cucumber tag expression |
| `REPORT_DIR` | `reports` | Selects the output directory for the HTML and JSON reports |

### Checkout verification

The live suite checks the documented behavior. TC-031 verifies that Continue Shopping opens Products and checks empty-cart Checkout availability in a second scenario. SauceDemo enables Checkout with an empty cart and sends Cancel on the checkout overview to Products. Both scenarios are tagged `@known-spec-discrepancy`. To run the remaining live scenarios, use `npm test -- --tags "not @known-spec-discrepancy"`.

Run the checkout controls against an isolated loopback fixture with Chromium installed.

```sh
npm run test:checkout:local
npm run test:checkout:controls
```

The first command runs seven scenarios with correct fixture behavior, including both two-item cancellations, cart clearing after Back Home, and both empty-cart behaviors. The second runs deliberate browser failures for row visibility and price, tax, cancellation retention, post-order cart contents, and a disabled Continue Shopping button. It also exercises the smoke command on the failing TC-031 scenario. The controls command exits 0 when the failing steps, diagnostics, and child exit codes match. Each run writes its Cucumber HTML, JSON, and `checks.json` under `reports/business/local/`. [Control details and report directories](test_documents/checkout-review.md#local-assertion-controls)

### Reports

Each Cucumber invocation prints a console summary and writes HTML and JSON reports. The headless commands use `reports/smoke/` and `reports/full/`. On failure, a single screenshot is saved under the run's `screenshots/` and its exact bytes are embedded in the report. Playwright traces group actions by Gherkin step and are saved under the run's `traces/`. Open a ZIP with `npx playwright show-trace <path-to-trace.zip>`. Debug runs also write videos under `videos/` and the latest HAR at `har/trace.har`.

The former `npm run report` command is replaced by automatic HTML generation. Run `npm test` for browser results or `npm run bdd:dry` for a step-discovery report. Each run overwrites the preceding reports. `npm run clean` removes the generated `reports/`, `screenshots/`, and `videos/` directories.
