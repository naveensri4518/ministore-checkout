# Mini Store Checkout

A front-end checkout page (no backend, no database) with an automated Playwright test suite. Built for my SDET internship project.

- **Live demo:** https://naveensri4518.github.io/ministore-checkout/
- **Demo video:** ADD_YOUR_YOUTUBE_LINK_HERE

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

## Author

Naveen Sri
