@saucedemo @cart
Feature: Shopping Cart Management
  As a logged-in user of SauceDemo
  I want to manage items in my shopping cart
  So that I can review and modify my selections before checkout

  Background:
    Given I am logged in as a standard user

  @positive @smoke
  Scenario: View empty cart
    Given I have no items in my cart
    When I navigate to the cart page
    Then I should see an empty cart
    And I should see "Continue Shopping" button
    And I should see "Checkout" button

  @positive
  Scenario: View cart with single item
    Given I have added "Sauce Labs Backpack" to the cart
    When I navigate to the cart page
    Then I should see "Sauce Labs Backpack" in my cart
    And I should see the correct price for "Sauce Labs Backpack"
    And I should see quantity "1" for "Sauce Labs Backpack"
    And I should see "Continue Shopping" button
    And I should see "Checkout" button

  @positive
  Scenario: View cart with multiple items
    Given I have added the following items to the cart:
      | Sauce Labs Backpack    |
      | Sauce Labs Bike Light  |
      | Sauce Labs Bolt T-Shirt|
    When I navigate to the cart page
    Then I should see 3 items in my cart
    And I should see all selected items with correct details

  @positive
  Scenario: Remove single item from cart
    Given I have added "Sauce Labs Backpack" to the cart
    And I am on the cart page
    When I remove "Sauce Labs Backpack" from the cart
    Then I should see an empty cart
    And the shopping cart badge should not be visible

  @positive
  Scenario: Remove item from cart with multiple items
    Given I have added the following items to the cart:
      | Sauce Labs Backpack    |
      | Sauce Labs Bike Light  |
    And I am on the cart page
    When I remove "Sauce Labs Backpack" from the cart
    Then I should see 1 item in my cart
    And I should only see "Sauce Labs Bike Light" in my cart
    And the shopping cart badge should show "1"

  @positive
  Scenario: Continue shopping from cart
    Given I have added "Sauce Labs Backpack" to the cart
    And I am on the cart page
    When I click "Continue Shopping" button on cart page
    Then I should be taken back to the inventory page
    And the shopping cart badge should still show "1"

  @positive
  Scenario: Proceed to checkout from cart
    Given I have added "Sauce Labs Backpack" to the cart
    And I am on the cart page
    When I click "Checkout" button on cart page
    Then I should be taken to the checkout information page
    And I should see "Checkout: Your Information" page title

  @negative
  Scenario: Attempt checkout with empty cart
    Given I have no items in my cart
    And I am on the cart page
    When I click "Checkout" button on cart page
    Then I should be taken to the checkout information page
