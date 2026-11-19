import testData from '../fixtures/testData.json';
import { TestUser, CheckoutInfo } from '../types';

export class DataHelper {
  static getUser(userType: keyof typeof testData.users): TestUser {
    return testData.users[userType] as TestUser;
  }

  static getValidUser(): TestUser {
    return this.getUser('standard_user');
  }

  static getValidCheckoutInfo(): CheckoutInfo {
    return testData.checkoutInfo.valid;
  }

  static getReferencePrice(name: string): string {
    const product = Object.values(testData.products).find(item => item.name === name);
    if (!product || !('price' in product) || typeof product.price !== 'string' || !product.price.trim()) {
      throw new Error(`Reference price for ${name}: expected a USD price in testData.json, actual missing.`);
    }
    return product.price;
  }
}
