# Checkout cancellation QA note

**Environment.** SauceDemo at `https://www.saucedemo.com`, Windows, headless Chromium, Playwright 1.65.1. The November 19, 2026 browser probe clicked the controls, recorded the resulting URL and title, and read the cart rows from the page. The manual cases and story map specify the expectation. The feature and assertion show what the automated check enforces. [Browser observations](checkout-evidence/observations.json) · [Manual cases, pages 23–25](Test%20Cases%20-%20SauceDemo%20E-commerce%20Platform.pdf#page=23) · [User stories, pages 8–9](User%20Story%20Mapping%20-%20SauceDemo.pdf#page=8) · [Feature](../tests/features/checkout.feature#L100-L111) · [Destination assertion](../src/pages/CartPage.ts#L22-L26)

**Preconditions for each case.** Start a fresh session and sign in as `standard_user`. Add one Sauce Labs Backpack and one Sauce Labs Bike Light. Open the cart and select Checkout.

| Case | Reproduction | Expected | Observed |
| --- | --- | --- | --- |
| TC-045 / US-4.1.3 | On **Checkout: Your Information**, select **Cancel**. | Return directly to `/cart.html` with both lines unchanged. | The probe landed on `/cart.html` and read Backpack $29.99 × 1 and Bike Light $9.99 × 1. [Cart after Cancel](checkout-evidence/cancel-information-after.png) |
| TC-046 / US-4.2.2 | On **Checkout: Your Information**, enter John, Doe and 12345. Select **Continue**, then **Cancel** on **Checkout: Overview**. Record the landing page before opening the cart again. | Return directly to `/cart.html` with both lines unchanged. | The probe landed on `/inventory.html` (Products). It opened the cart separately and found the same two lines and quantities. The live Cucumber scenario fails its immediate destination assertion and skips the following retention step. [Overview before Cancel](checkout-evidence/cancel-overview-before.png) · [Landing page after Cancel](checkout-evidence/cancel-overview-after.png) |

Both scenarios use the same two-item background. The local control returns directly to `/cart.html` from both pages and removes the Bike Light on Cancel. The destination steps pass and both retention steps fail with the missing item in the diagnostic. [Local control and report directory](checkout-review.md#local-assertion-controls)
