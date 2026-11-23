# Mini Store Checkout

A front-end checkout page (no backend, no database) with an automated Playwright test suite. Built for my SDET internship project.

- **Live demo:** https://naveensri4518.github.io/ministore-checkout/
- **Demo video:** [ADD_YOUR_YOUTUBE_LINK_HERE](https://youtu.be/KEaVOWoOknM)

## Features

- Two products: Notebook ($19.99) and Pen Set ($4.50)
- Add to cart, increase/decrease quantity, type a quantity, remove items
- Exact totals: prices are stored in integer cents to avoid rounding errors
- Quantity limited to 1-99; invalid input (blank, 0, negative, too large) is corrected
- Validation: empty cart, missing name and whitespace-only name are blocked with a clear message, and the cart and typed input are kept
- Order confirmation with name, total and a reference like `ORD-XXXXXX`
- Duplicate-order protection: a double-click or second submit does not create a second order

## Tech stack

HTML, CSS, JavaScript, Playwright, GitHub Pages

## Project structure

```
index.html              Page markup
style.css               Styles
app.js                  Cart, validation and order logic
tests/checkout.spec.js  Playwright tests (TC01-TC07)
playwright.config.js    Playwright configuration
```

## Run locally

The app needs no build step. Open `index.html` in a browser.

## Run the tests

```
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## Test coverage

| ID   | Scenario                                                  |
|------|-----------------------------------------------------------|
| TC01 | Successful checkout shows confirmation and reference      |
| TC02 | Missing name blocks checkout and the cart is preserved    |
| TC03 | Quantity change updates the exact total                   |
| TC04 | Empty cart blocks checkout                                |
| TC05 | Whitespace-only name is treated as blank                  |
| TC06 | Double-click on Place Order gives one confirmation        |
| TC07 | Second submit does not change the order reference         |

Tests use `data-testid` selectors, and retries are off so flaky tests stay visible. All 7 tests pass.

## Test plan

Scope: the checkout page only (cart, quantity, name validation, order confirmation). There is no backend, database, payment or external service, so none of those are tested.

Risks, in priority order:

1. **Wrong total:** a pricing or rounding error charges the customer the wrong amount. Covered by TC01, TC03.
2. **Invalid order accepted:** an order goes through with an empty cart or a blank name. Covered by TC02, TC04, TC05.
3. **Duplicate order:** a rapid double-click or second submit creates two confirmations or changes the reference. Covered by TC06, TC07.
4. **Bad quantity input:** blank, 0, negative or very large values break the total. Handled by clamping to 1-99.

Approach: manual exploratory checks of the two highest-risk behaviours first, then automated Playwright tests for repeatable regression coverage. Assertions check what the customer sees (text, totals, visibility). There are no fixed waits.

## Manual test results

| # | Steps | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| M1 | Open the page with an empty cart, enter a name, click Place Order | Order blocked. Message: "Your cart is empty. Add at least one item before placing an order." Name stays in the field. | Same as expected | Pass |
| M2 | Add Notebook, enter a name, double-click Place Order quickly | One confirmation, one order reference | Same as expected | Pass |

No defects found, so none are reported.

## Automated test results

`npx playwright test`: 7 passed, 0 failed (Chromium). The HTML report is generated with `npx playwright show-report`.

## Author

Naveen Sri
