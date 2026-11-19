# SauceDemo QA portfolio

Manual QA documentation and browser automation for the [SauceDemo storefront](https://www.saucedemo.com/). The sample covers authentication, product inventory, the shopping cart, and checkout.

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
npx playwright install
npm run test:smoke
```

The dry run checks that Cucumber can load the support code and match all scenario steps. A successful full dry run lists 39 skipped scenarios because it skips browser actions. The smoke command launches a browser and checks four scenarios against SauceDemo. On Linux CI, use `npx playwright install --with-deps` to install browser binaries and system dependencies.

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

The live suite checks the documented behavior. Two scenarios currently tagged `@known-spec-discrepancy` fail against SauceDemo. Checkout is enabled with an empty cart, and Cancel on the overview returns to Products. To run the remaining live scenarios, use `npm test -- --tags "not @known-spec-discrepancy"`.

Run the checkout controls against an isolated loopback fixture with Chromium installed.

```sh
npm run test:checkout:local
npm run test:checkout:controls
```

The first command exercises the normal cart, overview, and completion steps. The second checks invalid input messages and runs two deliberately failing browser cases. It verifies the exact Cucumber step, error message, and child exit code for each. The wrapper exits successfully when both failures match. Reports are written under `reports/business/local/`.

### Reports

Each Cucumber invocation prints a console summary and writes `reports/cucumber-report.html` and `reports/cucumber-report.json`. Open the HTML file in a browser. Browser failures with an open page include a screenshot in the HTML and under `screenshots/`. Debug runs also write videos under `videos/` and the latest HAR at `har/trace.har`.

The former `npm run report` command is replaced by automatic HTML generation. Run `npm test` for browser results or `npm run bdd:dry` for a step-discovery report. Each run overwrites the preceding reports. `npm run clean` removes the generated `reports/`, `screenshots/`, and `videos/` directories.
