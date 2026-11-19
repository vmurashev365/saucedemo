import { createServer } from 'node:http';

interface FixtureOptions {
  row?: {
    surface: 'cart' | 'overview';
    change: 'wrong-price' | 'hidden-reference-price' | 'hidden-prices' | 'hidden-quantities'
      | 'missing-name' | 'blank-quantity' | 'duplicate-price';
  };
  tax?: string;
  loseBikeLightOnCancel?: boolean;
  retainCartAfterOrder?: boolean;
  disableContinueShopping?: boolean;
}

const products = [
  { id: 'backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  { id: 'bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' }
];

const navigation = (id: string, text: string, path: string, disabled = false) =>
  `<button data-test="${id}" type="button" onclick="location.href='${path}'"${disabled ? ' disabled' : ''}>${text}</button>`;

const cartLink = `<a data-test="shopping-cart-link" href="/cart.html">Cart
  <span data-test="shopping-cart-badge" hidden></span></a>`;

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
  ${cartLink}`;

function rows(surface: 'cart' | 'overview', options: FixtureOptions): string {
  return products.map(({ id, name, price }) => {
    const change = options.row?.surface === surface ? options.row.change : undefined;
    const backpackChange = id === 'backpack' ? change : undefined;
    const wrongPrice = backpackChange === 'wrong-price' || backpackChange === 'hidden-reference-price';
    const extraPrice = backpackChange === 'hidden-reference-price' || backpackChange === 'duplicate-price'
      ? `<span class="inventory_item_price"${wrongPrice ? ' hidden' : ''}>${price}</span>` : '';
    return `
      <article class="cart_item" data-row="${id}">
        ${backpackChange !== 'missing-name' ? `<h2 class="inventory_item_name">${name}</h2>` : ''}
        ${extraPrice}<span class="inventory_item_price"${change === 'hidden-prices' ? ' hidden' : ''}>${wrongPrice ? '$0.01' : price}</span>
        <span class="cart_quantity"${change === 'hidden-quantities' ? ' hidden' : ''}>${backpackChange === 'blank-quantity' ? '&nbsp;' : '1'}</span>
      </article>`;
  }).join('');
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
  <p data-test="complete-text">Your order has been dispatched.</p>
  ${navigation('back-to-products', 'Back Home', '/inventory.html')}`;

export function checkoutFixture(options: FixtureOptions, requests: string[]) {
  const pages: Record<string, string> = {
    '/': login,
    '/inventory.html': inventory,
    '/cart.html': `
      <h1 class="title">Your Cart</h1>
      ${cartLink}
      <div data-test="cart-contents-container" style="min-height: 1px">${rows('cart', options)}</div>
      ${navigation('continue-shopping', 'Continue Shopping', '/inventory.html', options.disableContinueShopping)}
      ${navigation('checkout', 'Checkout', '/checkout-step-one.html')}`,
    '/checkout-step-one.html': `${information}${navigation('cancel', 'Cancel', '/cart.html')}`,
    '/checkout-step-two.html': `
      <h1 class="title">Checkout: Overview</h1>
      ${rows('overview', options)}
      <p data-test="subtotal-label">Item total: $39.98</p>
      <p data-test="tax-label">Tax: ${options.tax ?? '$3.20'}</p>
      <p data-test="total-label">Total: $43.18</p>
      ${navigation('finish', 'Finish', '/checkout-complete.html')}
      ${navigation('cancel', 'Cancel', '/cart.html')}`,
    '/checkout-complete.html': completion
  };

  const selectionScript = `
    const selection = new Set(JSON.parse(sessionStorage.getItem('selection') || '[]'));
    const saveSelection = () => sessionStorage.setItem('selection', JSON.stringify([...selection]));
    const badge = document.querySelector('[data-test="shopping-cart-badge"]');
    function updateBadge() {
      if (!badge) return;
      badge.textContent = selection.size;
      badge.hidden = !selection.size || sessionStorage.getItem('orderComplete') === 'true';
    }
    for (const button of document.querySelectorAll('[data-add]')) {
      button.onclick = () => {
        selection.add(button.dataset.add);
        saveSelection();
        updateBadge();
        button.textContent = 'Added';
        button.disabled = true;
      };
    }
    document.querySelector('[data-test="cancel"]')?.addEventListener('click', () => {
      if (${Boolean(options.loseBikeLightOnCancel)}) selection.delete('bike-light');
      saveSelection();
    }, { capture: true });
    if (location.pathname === '/checkout-complete.html') {
      sessionStorage.setItem('orderComplete', 'true');
      if (!${Boolean(options.retainCartAfterOrder)}) selection.clear();
      saveSelection();
    }
    const checkout = document.querySelector('[data-test="checkout"]');
    if (checkout) checkout.disabled = !selection.size;
    for (const row of document.querySelectorAll('[data-row]')) {
      if (!selection.has(row.dataset.row)) row.remove();
    }
    updateBadge();
  `;

  return createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    if (!Object.hasOwn(pages, path)) {
      response.writeHead(404).end();
      return;
    }
    requests.push(path);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8">
      <title>Local checkout fixture</title><main>${pages[path]}</main><script>${selectionScript}</script></html>`);
  });
}
