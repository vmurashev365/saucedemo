import { CartItem, SelectedItem } from '../types';

export const CHECKOUT_TAX_PERCENT = 8;

export function parseUsdCents(text: string): number | undefined {
  const amount = /^\$(\d+|\d{1,3}(?:,\d{3})+)\.(\d{2})$/.exec(text.trim());
  if (!amount) return undefined;
  const cents = Number(amount[1].replaceAll(',', '')) * 100 + Number(amount[2]);
  return Number.isSafeInteger(cents) ? cents : undefined;
}

export function referencePriceCents(name: string, text: string): number {
  const cents = parseUsdCents(text);
  if (cents === undefined) {
    throw new Error(`Reference price for ${name}: expected USD with two decimals, actual ${JSON.stringify(text)}.`);
  }
  return cents;
}

export function assertPrice(field: string, expectedCents: number, actual: string): number {
  const actualCents = parseUsdCents(actual);
  if (actualCents !== expectedCents) {
    const expected = `$${(expectedCents / 100).toFixed(2)}`;
    const displayed = actual.trim();
    const received = actualCents === undefined ? JSON.stringify(displayed) : displayed;
    throw new Error(`${field}: expected ${expected}, actual ${received}.`);
  }
  return actualCents;
}

export function assertSelectedItems(surface: string, selected: readonly SelectedItem[], actual: readonly CartItem[]): void {
  const expectedNames = selected.map(item => item.name).sort();
  const actualNames = actual.map(item => item.name).sort();
  if (expectedNames.length !== actualNames.length || expectedNames.some((name, index) => name !== actualNames[index])) {
    throw new Error(`${surface} items: expected ${JSON.stringify(expectedNames)}, actual ${JSON.stringify(actualNames)}.`);
  }

  const actualByName = new Map(actual.map(item => [item.name, item]));
  for (const expected of selected) {
    const item = actualByName.get(expected.name)!;
    assertPrice(`${surface} price for ${expected.name}`, expected.catalogPriceCents, item.price);
    const quantityText = item.quantityText?.trim();
    if (quantityText !== String(expected.expectedQuantity)) {
      const quantity = quantityText === undefined ? 'missing' : quantityText === '' ? 'blank' : quantityText;
      throw new Error(`${surface} quantity for ${expected.name}: expected ${expected.expectedQuantity}, actual ${quantity}.`);
    }
  }
}

export function expectedAmounts(items: readonly SelectedItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.catalogPriceCents * item.expectedQuantity, 0);
  const tax = Math.round(subtotal * CHECKOUT_TAX_PERCENT / 100);
  return { subtotal, tax, total: subtotal + tax };
}
