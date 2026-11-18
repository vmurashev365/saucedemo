# Original SauceDemo automation results

These files preserve the evidence tracked at review commit `aeb760cd33f66494b743bc598fdd5ea78e7a8a2a`. The archived HTML and JSON capture different August 2025 runs.

- [Original HTML report](cucumber-report.html), generated on August 1, 2025 at 23:46:25 UTC+03:00. It shows 39 scenarios, with 34 passed and 5 failed.
- [Original JSON report](cucumber-report.json), committed on August 3, 2025. It records 39 scenarios, with 33 passed and 6 failed. The 223 Gherkin steps include 200 passed, 6 failed, and 17 skipped. All 78 per-scenario hooks passed.
- [Original failure screenshots](screenshots/) with timestamps from August 1 and 2, 2025.

## JSON run by feature

| Feature | Passed | Failed | Total |
| --- | ---: | ---: | ---: |
| Authentication | 9 | 1 | 10 |
| Inventory | 11 | 0 | 11 |
| Shopping cart | 7 | 1 | 8 |
| Checkout | 6 | 4 | 10 |
| **Total** | **33** | **6** | **39** |

The six failures below reached Cucumber's 5,000 ms step timeout. Five also appear in the earlier HTML report. The empty cart scenario passed in that run.

| Scenario | Step that timed out in the JSON run |
| --- | --- |
| View empty cart | Log in as the standard user |
| Complete checkout with multiple items | Fill in valid checkout information |
| Cancel checkout from step one | Verify redirection to the cart |
| Cancel checkout from overview page | Verify items remain in the cart |
| Verify order summary calculations | Add multiple items with different prices |
| Login with different valid user types | Log in as `performance_glitch_user` |
