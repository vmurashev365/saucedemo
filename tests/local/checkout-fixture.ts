import { createServer } from 'node:http';

export type FixtureCase = 'correct' | 'cart-price' | 'tax';

const products = [
  { id: 'backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  { id: 'bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' }
];

const navigation = (id: string, text: string, path: string) =>
  `<button data-test="${id}" type="button" onclick="location.href='${path}'">${text}</button>`;

const login = `
  <div class="login_wrapper">
    <div class="login_logo">Local checkout fixture</div>
    <form onsubmit="location.href='/inventory.html'; return false">
      <input data-test="username" aria-label="Username">
      <input data-test="password" aria-label="Password" type="password">
      <button data-test="login-button">Log in</button>
    </form>
  </div>`;

const inventory = `
  <h1 class="title">Products</h1>
  <div data-test="inventory-container">
    ${products.map(({ id, name, price }) => `
      <article class="inventory_item">
        <h2 class="inventory_item_name">${name}</h2>
        <span class="inventory_item_price">${price}</span>
        <button id="add-to-cart-${id}" data-add="${id}">Add to cart</button>
      </article>`).join('')}
  </div>
  <a data-test="shopping-cart-link" href="/cart.html">Cart</a>`;

function rows(surface: 'cart' | 'overview', variant: FixtureCase): string {
  return products.map(({ id, name, price }) => `
    <article class="cart_item" data-row="${id}">
      <h2 class="inventory_item_name">${name}</h2>
      <span class="inventory_item_price">${surface === 'cart' && id === 'backpack' && variant === 'cart-price' ? '$0.01' : price}</span>
      <span class="cart_quantity">1</span>
    </article>`).join('');
}

const information = `
  <h1 class="title">Checkout: Your Information</h1>
  <form class="checkout_info" onsubmit="location.href='/checkout-step-two.html'; return false">
    <input data-test="firstName" aria-label="First name" required>
    <input data-test="lastName" aria-label="Last name" required>
    <input data-test="postalCode" aria-label="Postal code" required>
    <button data-test="continue">Continue</button>
  </form>`;

const completion = `
  <h1 class="title">Checkout: Complete!</h1>
  <h2 data-test="complete-header">Thank you for your order!</h2>
  <p data-test="complete-text">Your order has been dispatched.</p>`;

const selectionScript = `
  const selection = new Set(JSON.parse(sessionStorage.getItem('selection') || '[]'));
  for (const button of document.querySelectorAll('[data-add]')) {
    button.onclick = () => {
      selection.add(button.dataset.add);
      sessionStorage.setItem('selection', JSON.stringify([...selection]));
      button.textContent = 'Added';
      button.disabled = true;
    };
  }
  for (const row of document.querySelectorAll('[data-row]')) {
    if (!selection.has(row.dataset.row)) row.remove();
  }
`;

export function checkoutFixture(variant: FixtureCase, requests: Set<string>) {
  const pages: Record<string, string> = {
    '/': login,
    '/inventory.html': inventory,
    '/cart.html': `
      <h1 class="title">Your Cart</h1>
      <div data-test="cart-contents-container">${rows('cart', variant)}</div>
      ${navigation('checkout', 'Checkout', '/checkout-step-one.html')}`,
    '/checkout-step-one.html': information,
    '/checkout-step-two.html': `
      <h1 class="title">Checkout: Overview</h1>
      ${rows('overview', variant)}
      <p data-test="subtotal-label">Item total: $39.98</p>
      <p data-test="tax-label">Tax: ${variant === 'tax' ? '$9.99' : '$3.20'}</p>
      <p data-test="total-label">Total: $43.18</p>
      ${navigation('finish', 'Finish', '/checkout-complete.html')}
      ${navigation('cancel', 'Cancel', '/cart.html')}`,
    '/checkout-complete.html': completion
  };

  return createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    if (!Object.hasOwn(pages, path)) {
      response.writeHead(404).end();
      return;
    }
    requests.add(path);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8">
      <title>Local checkout fixture</title><main>${pages[path]}</main><script>${selectionScript}</script></html>`);
  });
}
