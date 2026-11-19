export interface TestUser {
  username: string;
  password: string;
  type: 'standard' | 'locked_out' | 'problem' | 'performance_glitch' | 'error' | 'visual';
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface TestConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  headed: boolean;
  slowMo: number;
  debug: boolean;
  baseUrl: string;
  viewport: string;
  timeout: number;
}

export interface CartItem {
  name: string;
  price: string;
  quantityText: string | null;
}

export interface SelectedItem {
  name: string;
  catalogPriceCents: number;
  expectedQuantity: number;
}

export const sortOptions = ['az', 'za', 'lohi', 'hilo'] as const;
export type SortOption = typeof sortOptions[number];

export function toSortOption(value: string): SortOption {
  const option = sortOptions.find(item => item === value);
  if (!option) throw new Error(`Sort option: expected one of ${sortOptions.join(', ')}, actual ${JSON.stringify(value)}.`);
  return option;
}
