// Prices are stored in integer cents to avoid floating-point errors.
const PRODUCTS = {
  notebook: { name: 'Notebook', priceCents: 1999 },
  penset: { name: 'Pen Set', priceCents: 450 },
};
const MAX_QTY = 99;

const cart = {};          // { productId: quantity }
let orderPlaced = false;  // guards against duplicate confirmations

const $ = (id) => document.getElementById(id);
const cartList = $('cart-list');
const cartEmpty = $('cart-empty');
const orderTotal = $('order-total');
const form = $('checkout-form');
const nameInput = $('name-input');
const nameError = $('name-error');
const cartError = $('cart-error');
const placeBtn = $('place-order');

const formatMoney = (cents) => '$' + (cents / 100).toFixed(2);
const cartIds = () => Object.keys(cart);
const totalCents = () =>
  cartIds().reduce((sum, id) => sum + PRODUCTS[id].priceCents * cart[id], 0);

function renderTotals() {
  cartIds().forEach((id) => {
    const el = document.querySelector(`[data-line-total="${id}"]`);
    if (el) el.textContent = formatMoney(PRODUCTS[id].priceCents * cart[id]);
  });
  orderTotal.textContent = formatMoney(totalCents());
}

function renderCart() {
  cartEmpty.hidden = cartIds().length > 0;
  cartList.innerHTML = cartIds()
    .map((id) => {
      const p = PRODUCTS[id];
      return `
        <li class="cart-row" data-testid="cart-row-${id}">
          <span class="item-name">${p.name}</span>
          <span>${formatMoney(p.priceCents)}</span>
          <button type="button" data-action="decrease" data-id="${id}" data-testid="decrease-${id}" aria-label="Decrease quantity of ${p.name}">-</button>
          <input type="number" min="1" max="${MAX_QTY}" value="${cart[id]}" data-action="qty" data-id="${id}" data-testid="qty-${id}" aria-label="Quantity of ${p.name}" />
          <button type="button" data-action="increase" data-id="${id}" data-testid="increase-${id}" aria-label="Increase quantity of ${p.name}">+</button>
          <span class="line-total" data-line-total="${id}" data-testid="line-total-${id}"></span>
          <button type="button" data-action="remove" data-id="${id}" data-testid="remove-${id}">Remove</button>
        </li>`;
    })
    .join('');
  renderTotals();
}

function clearErrors() {
  nameError.hidden = true;
  cartError.hidden = true;
  nameInput.removeAttribute('aria-invalid');
}

function clampQty(n) {
  return Math.min(MAX_QTY, Math.max(1, n));
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || orderPlaced) return;
  const { action, id } = btn.dataset;

  if (action === 'add') {
    cart[id] = clampQty((cart[id] || 0) + 1);
    cartError.hidden = true;
  } else if (action === 'increase') {
    cart[id] = clampQty(cart[id] + 1);
  } else if (action === 'decrease') {
    cart[id] = clampQty(cart[id] - 1);
  } else if (action === 'remove') {
    delete cart[id];
  }
  renderCart();
});

// Live update while typing (keeps focus because rows are not re-rendered).
cartList.addEventListener('input', (e) => {
  if (e.target.dataset.action !== 'qty') return;
  const n = parseInt(e.target.value, 10);
  if (Number.isInteger(n) && n >= 1 && n <= MAX_QTY) {
    cart[e.target.dataset.id] = n;
    renderTotals();
  }
});

// On blur/commit, normalise invalid values (empty, 0, negative, too large).
cartList.addEventListener('change', (e) => {
  if (e.target.dataset.action !== 'qty') return;
  const n = parseInt(e.target.value, 10);
  cart[e.target.dataset.id] = Number.isInteger(n) ? clampQty(n) : 1;
  renderCart();
});

nameInput.addEventListener('input', () => {
  nameError.hidden = true;
  nameInput.removeAttribute('aria-invalid');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (orderPlaced) return; // second click / Enter press does nothing

  clearErrors();
  const name = nameInput.value.trim();
  let valid = true;

  if (cartIds().length === 0) {
    cartError.textContent = 'Your cart is empty. Add at least one item before placing an order.';
    cartError.hidden = false;
    valid = false;
  }
  if (!name) {
    nameError.textContent = 'Please enter your full name.';
    nameError.hidden = false;
    nameInput.setAttribute('aria-invalid', 'true');
    valid = false;
  }
  if (!valid) return; // the typed name stays in the input

  orderPlaced = true;
  placeBtn.disabled = true;

  const ref = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  $('confirm-name').textContent = name;
  $('confirm-total').textContent = formatMoney(totalCents());
  $('order-reference').textContent = ref;
  $('checkout-view').hidden = true;
  $('confirmation').hidden = false;
});

$('new-order').addEventListener('click', () => {
  cartIds().forEach((id) => delete cart[id]);
  orderPlaced = false;
  placeBtn.disabled = false;
  nameInput.value = '';
  clearErrors();
  renderCart();
  $('confirmation').hidden = true;
  $('checkout-view').hidden = false;
});

renderCart();