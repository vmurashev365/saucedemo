# Cart and checkout review

The manual test cases and story map define the expected behavior. The live observations record what SauceDemo did on November 19, 2026 in headless Chromium. The two confirmed discrepancies are tagged `@known-spec-discrepancy` and run separately from the regression suite. `npm run test:discrepancies`, which CI runs on every push and weekly, passes only while both still fail at the documented step with the documented diagnostic. If SauceDemo changes, the check fails and names the case to review.

- [Manual test cases](Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf)
- [User story mapping](User%20Story%20Mapping%20-%20SauceDemo.pdf)
- [Browser observations](checkout-evidence/observations.json)

## Requirements and results

| Rule and source | Previous Gherkin | Expected result and implementation | Live browser result |
| --- | --- | --- | --- |
| TC-027 / US-3.2.1, test pp. 14–15 and story p. 6 | Single-item price comparison was optional. The multi-item step checked the price format and a positive quantity. | `CustomWorld.selectProduct` compares the catalog price with the fixture before adding each product. `CartPage.expectSelectedItems` checks exact product names, prices and quantities. The manual case also lists descriptions and Remove controls. | The single- and multi-item cart scenarios passed. The two-item checkout showed Backpack $29.99 × 1 and Bike Light $9.99 × 1. |
| TC-031 / US-3.2.4, test pp. 16–17 and story p. 6 | `View empty cart` expected Checkout to be visible. `Attempt checkout with empty cart` expected the information page to open. | TC-031 allows an empty state or an explicit message and an absent or zero badge. The automation checks zero rows, verifies that Continue Shopping is visible and enabled, and clicks through to Products. The Checkout gate checks separately that Checkout is absent or disabled. US-3.2.4 specifies an empty-cart message and a zero counter. | Zero rows, Continue Shopping opened Products, and both the badge and dedicated empty-cart message were absent. Checkout was enabled and opened `/checkout-step-one.html`. The separate Checkout gate failed. [Empty cart](checkout-evidence/empty-cart-before-checkout.png) · [After clicking Checkout](checkout-evidence/empty-cart-after-checkout.png) |
| TC-043 / US-4.2.1, test pp. 22–23 and story p. 9 | The multi-item scenario checked the row count and one product name. Expected totals came from the overview's own data. | Build and validate the cart before checkout. Verify the exact rows on the overview and availability of Finish and Cancel. Check subtotal, tax and total independently against the stored selection. | Two exact rows, both controls and all three amounts passed. Completing the order reached the confirmation page. |
| TC-045 / US-4.1.3, test pp. 23–24 and story p. 8 | Asserted a return to the cart and then checked cart contents. | Add Backpack $29.99 × 1 and Bike Light $9.99 × 1 using the shared two-item setup. Assert `/cart.html` immediately after Cancel, then verify the same items, prices and quantities. | Cancel returned to `/cart.html`. The automated scenario passed with both exact rows. |
| TC-046 / US-4.2.2, test p. 25 and story p. 9 | Asserted a return to the inventory page and then reopened the cart to check contents. | Use the same two-item setup as TC-045. Assert `/cart.html` immediately after Cancel and verify identical rows when the destination assertion passes. | Cancel returned to `/inventory.html`. The destination step failed and Cucumber skipped retention. In a separate browser check, reopening the cart showed both selected items unchanged. [Before Cancel](checkout-evidence/cancel-overview-before.png) · [After Cancel](checkout-evidence/cancel-overview-after.png) |
| TC-047 / US-4.2.3, test p. 25 and story p. 9 | Used three products and based the expected amounts on prices read from the checkout overview. | Use Backpack $29.99 × 1 and Bike Light $9.99 × 1. Expected subtotal is 3,998 cents, tax at 8% rounds to 320 cents, total is 4,318 cents. Each checkout field has its own step and Page Object assertion. | Item total $39.98, Tax $3.20 and Total $43.18. All three assertions passed. |

## Local assertion controls

These cases run the checked-in Gherkin and Page Objects against a loopback HTML fixture. `npm run test:checkout:local` runs seven scenarios with correct behavior. `npm run test:checkout:controls` checks the deliberate failures and the invalid-input messages for missing reference data and blank or zero quantities. Both commands exit 0 when their results match the expectations below.

| Control | Checked step and result | Child exit | Report folder |
| --- | --- | ---: | --- |
| Correct data and navigation | Cart and overview rows, subtotal, tax, total, completion, both cancellations, the empty cart after Back Home, Continue Shopping and the Checkout gate passed. | 0 | `correct` |
| Direct cart price change | `the cart should contain exactly the selected items, prices, and quantities` reported `Cart price for Sauce Labs Backpack: expected $29.99, actual $0.01.` The browser was on the cart page. | 1 | `cart-price` |
| Hidden reference price before the wrong visible price | The cart and overview item assertions reported `expected $29.99, actual $0.01` for the Backpack on their respective pages. | 1 each | `cart-hidden-reference-price`, `overview-hidden-reference-price` |
| All matching prices or quantities hidden | The cart and overview item assertions identified the affected price or quantity and reported `expected one visible field, actual only hidden fields.` | 1 each | `cart-hidden-prices`, `cart-hidden-quantities`, `overview-hidden-prices`, `overview-hidden-quantities` |
| Missing, blank or duplicate field | The cart item assertion reported `actual no matching field` for the name, `actual blank` for the quantity or `actual 2 visible fields` for the price. | 1 each | `cart-missing-name`, `cart-blank-quantity`, `cart-duplicate-price` |
| Displayed tax changed | `the tax should equal 8% of the subtotal` reported `Tax: expected $3.20, actual $9.99.` The $39.98 subtotal passed. The browser still displayed Total $43.18, and Cucumber skipped its assertion. | 1 | `tax` |
| Cancel drops Bike Light | Both immediate destinations passed. `my items should still be in the cart` reported `Cart items: expected ["Sauce Labs Backpack","Sauce Labs Bike Light"], actual ["Sauce Labs Backpack"].` | 1 for both scenarios | `cancel-loses-bike-light` |
| Order retains Backpack with hidden badge | `the shopping cart should be empty` opened the cart and reported `Expected: 0` and `Received: 1` for `.cart_item`. | 1 | `order-retains-backpack` |
| Visible but disabled Continue Shopping | The visibility step passed. `Continue Shopping should be enabled in the cart` reported `Expected: enabled` and `Received: disabled`. The guarded smoke command preserved the same browser failure and nonzero status. | 1 each | `continue-shopping-disabled`, `smoke-failing-scenario` |

All report folders are generated under `reports/business/local/`. Open `cucumber-report.html` for the run, or `checks.json` for the exact failing step, diagnostic, child exit code and evidence paths. Each deliberate browser failure has a screenshot and Playwright trace.

## Smoke gate

`npm run test:smoke` uses the current Cucumber invocation to verify that at least one scenario was collected. It preserves Cucumber's exit code on failures and writes the usual HTML and JSON to `reports/`. To verify the zero-scenario path, remove just the four `@smoke` tags in a temporary checkout. Dry discovery still finds 39 scenarios. Smoke exits 1 with `Smoke check failed: Cucumber collected no @smoke scenarios.` The assertion controls also run the smoke command against a failing scenario. [Smoke runner](../tests/run-smoke.js)

## Archived failure investigation

All six failures in the archived JSON reached Cucumber's former 5-second step limit. The archived attachment URLs show where the browser was when each failure was captured. [Archived JSON](baseline-2025-08/cucumber-report.json)

| Scenario | Archived failure and diagnosis | Current live status |
| --- | --- | --- |
| View empty cart | Standard-user login timed out. The attachment was already on `/inventory.html`. The exact delayed operation is unclear. The current login waits for the inventory URL, title and container with a configured timeout. | Passed. The separate checkout gate scenario exposed the TC-031 discrepancy. |
| Complete checkout with multiple items | Form fill timed out on `/inventory.html`. The former background entered checkout first. Adding a second item sent the browser back to inventory before form fill. | Passed. Both products were selected and verified in the cart before starting checkout. |
| Cancel checkout from step one | Cart verification timed out after navigation to `/cart.html`. The historical locator expected `data-test="cart-contents"`. The browser uses `cart-contents-container`. | Passed on `/cart.html` with both selected rows intact. |
| Cancel checkout from overview page | The retention step timed out after the old step reopened `/cart.html` from inventory. It used the same obsolete cart selector. | The documented destination failed with expected `/cart.html` and actual `/inventory.html`. Retention was verified independently after reopening the cart. |
| Verify order summary calculations | The add-items step timed out on `/checkout-step-one.html` while trying to use inventory controls. | Passed with $39.98 subtotal, $3.20 tax and $43.18 total. |
| Login with different valid user types, performance example | The login step for `performance_glitch_user` included a fixed 10-second sleep under a 5-second Cucumber timeout. The attachment showed `/inventory.html`. | Passed using observable inventory checks. |

On November 19, 2026, the live regression (`npm test`) passed all 37 scenarios in headless Chromium, and `npm run test:discrepancies` reproduced both documented discrepancies. The discrepancy command writes its Cucumber report, screenshots and traces under `reports/known-discrepancies/`. `npm run test:all` runs all 39 scenarios together and exits 1 while the discrepancies remain.
