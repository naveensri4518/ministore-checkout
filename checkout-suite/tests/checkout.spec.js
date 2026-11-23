// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_URL = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

// Clean state: Playwright gives every test a brand-new browser context,
// and the app stores nothing (no localStorage), so each test starts empty.
test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('$0.00');
});

// ---------- The 3 required checks ----------

test('TC01: successful checkout shows a confirmation with a reference', async ({ page }) => {
  await page.getByTestId('add-notebook').click();
  await expect(page.getByTestId('order-total')).toHaveText('$19.99');

  await page.getByTestId('name-input').fill('Priya Sharma');
  await page.getByTestId('place-order').click();

  await expect(page.getByTestId('confirmation')).toBeVisible();
  await expect(page.getByTestId('confirm-name')).toHaveText('Priya Sharma');
  await expect(page.getByTestId('confirm-total')).toHaveText('$19.99');
  await expect(page.getByTestId('order-reference')).toHaveText(/^ORD-[A-Z0-9]{6}$/);
  await expect(page.getByTestId('checkout-view')).toBeHidden();
});

test('TC02: missing name blocks checkout and shows a message', async ({ page }) => {
  await page.getByTestId('add-notebook').click();
  await expect(page.getByTestId('order-total')).toHaveText('$19.99');

  await page.getByTestId('place-order').click();

  await expect(page.getByTestId('name-error')).toHaveText('Please enter your full name.');
  await expect(page.getByTestId('confirmation')).toBeHidden();
  // Cart is preserved after the failed attempt
  await expect(page.getByTestId('qty-notebook')).toHaveValue('1');
});

test('TC03: quantity change updates the exact total', async ({ page }) => {
  await page.getByTestId('add-notebook').click();
  await page.getByTestId('qty-notebook').fill('3');

  await expect(page.getByTestId('line-total-notebook')).toHaveText('$59.97');
  await expect(page.getByTestId('order-total')).toHaveText('$59.97');

  await page.getByTestId('add-penset').click();
  await expect(page.getByTestId('order-total')).toHaveText('$64.47'); // 59.97 + 4.50
});

// ---------- Extra checks for the riskiest behaviours ----------

test('TC04: empty cart blocks checkout', async ({ page }) => {
  await page.getByTestId('name-input').fill('Priya Sharma');
  await page.getByTestId('place-order').click();

  await expect(page.getByTestId('cart-error')).toHaveText(
    'Your cart is empty. Add at least one item before placing an order.'
  );
  await expect(page.getByTestId('confirmation')).toBeHidden();
  // Customer input is preserved
  await expect(page.getByTestId('name-input')).toHaveValue('Priya Sharma');
});

test('TC05: whitespace-only name is treated as blank', async ({ page }) => {
  await page.getByTestId('add-penset').click();
  await page.getByTestId('name-input').fill('   ');
  await page.getByTestId('place-order').click();

  await expect(page.getByTestId('name-error')).toBeVisible();
  await expect(page.getByTestId('confirmation')).toBeHidden();
});

test('TC06: double-click on Place Order gives only one confirmation', async ({ page }) => {
  await page.getByTestId('add-notebook').click();
  await page.getByTestId('name-input').fill('Priya Sharma');

  await page.getByTestId('place-order').dblclick();

  await expect(page.getByTestId('confirmation')).toHaveCount(1);
  await expect(page.getByTestId('confirmation')).toBeVisible();
  await expect(page.getByTestId('order-reference')).toHaveCount(1);
});

test('TC07: a second submit after success does not change the order reference', async ({ page }) => {
  await page.getByTestId('add-notebook').click();
  await page.getByTestId('name-input').fill('Priya Sharma');
  await page.getByTestId('place-order').click();

  const reference = page.getByTestId('order-reference');
  await expect(reference).toHaveText(/^ORD-[A-Z0-9]{6}$/);
  const firstRef = await reference.innerText();   // always a string

  // Simulate a second submit (e.g. Enter key or a very fast second click)
  await page.locator('#checkout-form').evaluate((form) => /** @type {HTMLFormElement} */ (form).requestSubmit());

  await expect(reference).toHaveText(firstRef);
});