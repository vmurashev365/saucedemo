@saucedemo @inventory
Feature: Product Inventory Management
  As a logged-in user of SauceDemo
  I want to browse and manage products in the inventory
  So that I can select items for purchase

  Background:
    Given I am logged in as a standard user
    And I am on the inventory page

  @positive @smoke
  Scenario: View product inventory
    Then I should see 6 products displayed
    And each product should have a name, description, price, and image
    And each product should have an "Add to cart" button

  @positive
  Scenario: Add single product to cart
    When I add "Sauce Labs Backpack" to the cart
    Then the shopping cart badge should show "1"
    And the "Add to cart" button should change to "Remove" for "Sauce Labs Backpack"

  @positive
  Scenario: Add multiple products to cart
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I add "Sauce Labs Bolt T-Shirt" to the cart
    Then the shopping cart badge should show "3"

  @positive
  Scenario: Remove product from cart
    Given I have added "Sauce Labs Backpack" to the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the shopping cart badge should not be visible
    And the "Remove" button should change to "Add to cart" for "Sauce Labs Backpack"

  @positive
  Scenario: Add all products to cart
    When I add all products to the cart
    Then the shopping cart badge should show "6"
    And all "Add to cart" buttons should be changed to "Remove"

  @positive
  Scenario Outline: Sort products by different criteria
    When I sort products by "<sortOption>"
    Then products should be sorted by "<sortOption>"

    Examples:
      | sortOption |
      | az         |
      | za         |
      | lohi       |
      | hilo       |

  @positive
  Scenario: Navigate to product details
    When I click on "Sauce Labs Backpack" product name
    Then I should be taken to the product details page
    And I should see detailed information about "Sauce Labs Backpack"

  @positive
  Scenario: Access shopping cart
    Given I have added "Sauce Labs Backpack" to the cart
    When I click on the shopping cart icon
    Then I should be taken to the cart page
    And I should see "Sauce Labs Backpack" in my cart
