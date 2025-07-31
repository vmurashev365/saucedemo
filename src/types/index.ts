export interface TestUser {
  username: string;
  password: string;
  type: 'standard' | 'locked_out' | 'problem' | 'performance_glitch' | 'error' | 'visual';
}

export interface Product {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  id: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface TestConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  headed: boolean;
  debug: boolean;
  baseUrl: string;
  viewport: string;
  timeout: number;
}

export interface CartItem {
  name: string;
  quantity: number;
  price: string;
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export interface ExpectedError {
  message: string;
  field?: string;
}
