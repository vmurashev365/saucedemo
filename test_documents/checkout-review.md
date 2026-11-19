# Cart and checkout review

The manual test cases and story map define the expected behavior. The live observations record what SauceDemo did on November 19, 2026 in headless Chromium. The two confirmed discrepancies remain visible in the default live suite under `@known-spec-discrepancy`.

- [Manual test cases](Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf)
- [User story mapping](User%20Story%20Mapping%20-%20SauceDemo.pdf)
- [Browser observations](checkout-evidence/observations.json)

## Requirements and results

| Rule and source | Previous Gherkin | Expected result and implementation | Live browser result |
| --- | --- | --- | --- |
| TC-027 / US-3.2.1, test pp. 14–15 and story p. 6 | Single-item price comparison was optional. The multi-item step checked the price format and a positive quantity. | `CustomWorld.selectProduct` compares the catalog price with the fixture before adding each product. `CartPage.expectSelectedItems` checks exact product names, prices and quantities. The manual case also lists descriptions and Remove controls. | The single- and multi-item cart scenarios passed. The two-item checkout showed Backpack $29.99 × 1 and Bike Light $9.99 × 1. |
| TC-031 / US-3.2.4, test pp. 16–17 and story p. 6 | `View empty cart` expected Checkout to be visible. `Attempt checkout with empty cart` expected the information page to open. | Zero rows, Continue Shopping available and an absent or zero badge. The story calls for an empty-cart message and a zero counter. TC-031 allows an empty state or an explicit message and requires Checkout to be absent or disabled. The automation uses the manual case's empty-state and control criteria. | Zero rows, Continue Shopping enabled, badge absent, and no dedicated empty-cart message. Checkout was enabled and opened `/checkout-step-one.html`. The empty-state check passed and the checkout-control check failed. [Empty cart](checkout-evidence/empty-cart-before-checkout.png) · [After clicking Checkout](checkout-evidence/empty-cart-after-checkout.png) |
| TC-043 / US-4.2.1, test pp. 22–23 and story p. 9 | The multi-item scenario checked the row count and one product name. Expected totals came from the overview's own data. | Build and validate the cart before checkout. Verify the exact rows on the overview and availability of Finish and Cancel. Check subtotal, tax and total independently against the stored selection. | Two exact rows, both controls and all three amounts passed. Completing the order reached the confirmation page. |
| TC-045 / US-4.1.3, test pp. 23–24 and story p. 8 | Asserted a return to the cart and then checked cart contents. | Assert `/cart.html` immediately after Cancel and verify the same items, prices and quantities. Both documents specify the return to the cart. | Cancel returned to `/cart.html`. Both selected items remained in the browser observation. The automated scenario passed. |
| TC-046 / US-4.2.2, test p. 25 and story p. 9 | Asserted a return to the inventory page and then reopened the cart to check contents. | Assert `/cart.html` immediately after Cancel. The manual case and story agree on this destination. Verify identical rows if the destination assertion passes. | Cancel returned to `/inventory.html`. The destination step failed. Reopening the cart independently showed both selected items unchanged. [Before Cancel](checkout-evidence/cancel-overview-before.png) · [After Cancel](checkout-evidence/cancel-overview-after.png) |
| TC-047 / US-4.2.3, test p. 25 and story p. 9 | Used three products and based the expected amounts on prices read from the checkout overview. | Use Backpack $29.99 × 1 and Bike Light $9.99 × 1. Expected subtotal is 3,998 cents, tax at 8% rounds to 320 cents, total is 4,318 cents. Each checkout field has its own step and Page Object assertion. | Item total $39.98, Tax $3.20 and Total $43.18. All three assertions passed. |

## Local assertion controls

These cases use the real Gherkin steps and Page Objects against a loopback HTML fixture. The correct case exercises all six Page Objects with `BASE_URL` set to the local origin.

| Case | Checked step and message | Cucumber exit |
| --- | --- | ---: |
| Correct data | Cart and overview rows, subtotal, tax, total and order completion passed where exercised. Two scenarios passed. | 0 |
| Cart price changed | `the cart should contain exactly the selected items, prices, and quantities` failed with `Cart price for Sauce Labs Backpack: expected $29.99, actual $0.01.` Checkout was never reached. | 1 |
| Displayed tax changed | `the tax should equal 8% of the subtotal` failed with `Tax: expected $3.20, actual $9.99.` The subtotal passed. The fixture still displayed Total $43.18. Cucumber skipped the subsequent total step. | 1 |

`npm run test:checkout:local` runs the correct case. `npm run test:checkout:controls` checks missing reference data, blank and zero quantities, and both controlled browser failures. Each wrapper exited 0. The per-case JSON checks, HTML and JSON reports, console logs, and failure screenshots are generated under `reports/business/local/`.

## Archived failure investigation

All six failures in the archived JSON reached Cucumber's former 5-second step limit. The archived attachment URLs show where the browser was when each failure was captured. [Archived JSON](baseline-2025-08/cucumber-report.json)

| Scenario | Archived failure and diagnosis | Current live status |
| --- | --- | --- |
| View empty cart | Standard-user login timed out. The attachment was already on `/inventory.html`. The exact delayed operation is unclear. The current login waits for the inventory URL, title and container with a configured timeout. | Passed. The separate checkout gate scenario exposed the TC-031 discrepancy. |
| Complete checkout with multiple items | Form fill timed out on `/inventory.html`. The former background entered checkout first. Adding a second item sent the browser back to inventory before form fill. | Passed. Both products were selected and verified in the cart before starting checkout. |
| Cancel checkout from step one | Cart verification timed out after navigation to `/cart.html`. The historical locator expected `data-test="cart-contents"`. The browser uses `cart-contents-container`. | Passed on `/cart.html` with the selected row intact. |
| Cancel checkout from overview page | The retention step timed out after the old step reopened `/cart.html` from inventory. It used the same obsolete cart selector. | The documented destination failed with expected `/cart.html` and actual `/inventory.html`. Retention was verified independently after reopening the cart. |
| Verify order summary calculations | The add-items step timed out on `/checkout-step-one.html` while trying to use inventory controls. | Passed with $39.98 subtotal, $3.20 tax and $43.18 total. |
| Login with different valid user types, performance example | The login step for `performance_glitch_user` included a fixed 10-second sleep under a 5-second Cucumber timeout. The attachment showed `/inventory.html`. | Passed using observable inventory checks. |

The full live Chromium run finished with 37 passed and the two documented discrepancies. Its exit code was 1. The live Cucumber report is generated under `reports/business/live/`.
