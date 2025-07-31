import fs from 'fs';
import path from 'path';
import testData from '../fixtures/testData.json';
import { TestUser, CheckoutInfo, Product, ExpectedError } from '../types';

export class DataHelper {
  // User data methods
  static getUser(userType: string): TestUser {
    const user = testData.users[userType as keyof typeof testData.users];
    if (!user) {
      throw new Error(`User type '${userType}' not found in test data`);
    }
    return user as TestUser;
  }

  static getAllUsers(): TestUser[] {
    return Object.values(testData.users) as TestUser[];
  }

  static getValidUser(): TestUser {
    return this.getUser('standard_user');
  }

  static getLockedOutUser(): TestUser {
    return this.getUser('locked_out_user');
  }

  static getProblemUser(): TestUser {
    return this.getUser('problem_user');
  }

  // Product data methods
  static getProduct(productKey: string): Product {
    const product = testData.products[productKey as keyof typeof testData.products];
    if (!product) {
      throw new Error(`Product '${productKey}' not found in test data`);
    }
    return product as Product;
  }

  static getAllProducts(): Product[] {
    return Object.values(testData.products) as Product[];
  }

  static getRandomProduct(): Product {
    const products = this.getAllProducts();
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  static getRandomProducts(count: number): Product[] {
    const products = this.getAllProducts();
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, products.length));
  }

  // Checkout data methods
  static getValidCheckoutInfo(): CheckoutInfo {
    return testData.checkoutInfo.valid as CheckoutInfo;
  }

  static getInvalidCheckoutInfo(type: string): CheckoutInfo {
    const invalidInfo = testData.checkoutInfo.invalid[type as keyof typeof testData.checkoutInfo.invalid];
    if (!invalidInfo) {
      throw new Error(`Invalid checkout info type '${type}' not found`);
    }
    return invalidInfo as CheckoutInfo;
  }

  static generateRandomCheckoutInfo(): CheckoutInfo {
    return {
      firstName: this.generateRandomString(8),
      lastName: this.generateRandomString(10),
      postalCode: this.generateRandomZipCode()
    };
  }

  // Error message methods
  static getLoginError(errorType: string): string {
    const error = testData.errors.login[errorType as keyof typeof testData.errors.login];
    if (!error) {
      throw new Error(`Login error type '${errorType}' not found`);
    }
    return error;
  }

  static getCheckoutError(errorType: string): string {
    const error = testData.errors.checkout[errorType as keyof typeof testData.errors.checkout];
    if (!error) {
      throw new Error(`Checkout error type '${errorType}' not found`);
    }
    return error;
  }

  // Utility methods
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomZipCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  static generateRandomEmail(): string {
    const username = this.generateRandomString(8).toLowerCase();
    const domain = 'example.com';
    return `${username}@${domain}`;
  }

  // File operations
  static readJsonFile(filePath: string): any {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to read JSON file: ${filePath}. Error: ${error}`);
    }
  }

  static writeJsonFile(filePath: string, data: any): void {
    try {
      const fullPath = path.resolve(filePath);
      const directory = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to write JSON file: ${filePath}. Error: ${error}`);
    }
  }

  // Environment helpers
  static getEnvironmentVariable(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (value === undefined && defaultValue === undefined) {
      throw new Error(`Environment variable '${name}' is not set and no default value provided`);
    }
    return value ?? defaultValue!;
  }

  static getBooleanEnvironmentVariable(name: string, defaultValue: boolean = false): boolean {
    const value = process.env[name];
    if (value === undefined) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  static getNumericEnvironmentVariable(name: string, defaultValue?: number): number {
    const value = process.env[name];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Environment variable '${name}' is not set and no default value provided`);
      }
      return defaultValue;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      throw new Error(`Environment variable '${name}' is not a valid number: ${value}`);
    }
    return numericValue;
  }

  // Date and time helpers
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static formatTimestamp(date: Date): string {
    return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  static createUniqueIdentifier(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
