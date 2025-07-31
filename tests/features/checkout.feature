@saucedemo @checkout
Feature: Checkout Process
  As a logged-in user with items in my cart
  I want to complete the checkout process
  So that I can purchase the selected items

  Background:
    Given I am logged in as a standard user
    And I have added "Sauce Labs Backpack" to the cart
    And I am on the checkout step one page

  @positive @smoke @e2e
  Scenario: Complete successful checkout process
    When I fill in the checkout information with valid details:
      | firstName | lastName | postalCode |
      | John      | Doe      | 12345      |
    And I click "Continue" on checkout page
    Then I should be taken to the checkout overview page
    And I should see "Checkout: Overview" as page title
    And I should see "Sauce Labs Backpack" in the order summary
    And I should see the correct subtotal and total amounts
    When I click "Finish" on checkout page
    Then I should be taken to the checkout complete page
    And I should see order completion confirmation message
    And I should see order dispatched confirmation message

  @positive
  Scenario: Complete checkout with multiple items
    Given I have also added "Sauce Labs Bike Light" to the cart
    When I fill in the checkout information with valid details:
      | firstName | lastName | postalCode |
      | Jane      | Smith    | 54321      |
    And I click "Continue"
    Then I should see 2 items in the order summary
    And I should see the correct total for multiple items
    When I click "Finish"
    Then I should see the order completion confirmation

  @positive
  Scenario: Return to products after successful checkout
    Given I have completed a successful checkout
    When I click "Back Home"
    Then I should be taken back to the inventory page
    And the shopping cart should be empty

  @negative
  Scenario: Checkout with empty first name
    When I fill in the checkout information:
      | firstName | lastName | postalCode |
      |           | Doe      | 12345      |
    And I click "Continue"
    Then I should see the error message "Error: First Name is required"
    And I should remain on the checkout step one page

  @negative
  Scenario: Checkout with empty last name
    When I fill in the checkout information:
      | firstName | lastName | postalCode |
      | John      |          | 12345      |
    And I click "Continue"
    Then I should see the error message "Error: Last Name is required"
    And I should remain on the checkout step one page

  @negative
  Scenario: Checkout with empty postal code
    When I fill in the checkout information:
      | firstName | lastName | postalCode |
      | John      | Doe      |            |
    And I click "Continue"
    Then I should see the error message "Error: Postal Code is required"
    And I should remain on the checkout step one page

  @negative
  Scenario: Checkout with all empty fields
    When I fill in the checkout information:
      | firstName | lastName | postalCode |
      |           |          |            |
    And I click "Continue"
    Then I should see the error message "Error: First Name is required"
    And I should remain on the checkout step one page

  @positive
  Scenario: Cancel checkout from step one
    When I click "Cancel" on the checkout step one page
    Then I should be redirected to the cart page
    And my items should still be in the cart

  @positive
  Scenario: Cancel checkout from overview page
    Given I have filled in valid checkout information and proceeded to overview
    When I click "Cancel" on the checkout overview page
    Then I should be taken back to the inventory page
    And my items should still be in the cart

  @positive
  Scenario: Verify order summary calculations
    Given I have added multiple items with different prices to the cart
    And I have filled in valid checkout information and proceeded to overview
    Then the subtotal should equal the sum of all item prices
    And the tax should be calculated correctly (8% of subtotal)
    And the total should equal subtotal plus tax
