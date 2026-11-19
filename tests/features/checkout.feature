@saucedemo @checkout
Feature: Checkout Process
  As a logged-in user with items in my cart
  I want to complete the checkout process
  So that I can purchase the selected items

  Background:
    Given I am logged in as a standard user

  Rule: Checkout with a single item
    Background:
      Given I have added "Sauce Labs Backpack" to the cart
      And I am on the cart page
      And the cart should contain exactly the selected items, prices, and quantities
      And I proceed from the cart to checkout

    @positive @smoke @e2e
    Scenario: Complete successful checkout process
      When I fill in the checkout information with valid details:
        | firstName | lastName | postalCode |
        | John      | Doe      | 12345      |
      And I click "Continue" on checkout page
      Then I should be taken to the checkout overview page
      And I should see "Checkout: Overview" as page title
      And the overview should contain exactly the selected items, prices, and quantities
      And the subtotal should equal the sum of all item prices
      And the tax should equal 8% of the subtotal
      And the total should equal subtotal plus tax
      When I click "Finish" on checkout page
      Then I should be taken to the checkout complete page
      And I should see order completion confirmation message
      And I should see order dispatched confirmation message

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

    @positive @TC-045
    Scenario: Cancel checkout from step one
      When I click "Cancel" on the checkout step one page
      Then I should be redirected to the cart page
      And my items should still be in the cart

    @positive @TC-046 @known-spec-discrepancy
    Scenario: Cancel checkout from overview page
      Given I have filled in valid checkout information and proceeded to overview
      When I click "Cancel" on the checkout overview page
      Then I should be redirected to the cart page
      And my items should still be in the cart

  Rule: Checkout with multiple items
    Background:
      Given I have added the following items to the cart:
        | Sauce Labs Backpack  |
        | Sauce Labs Bike Light |
      And I am on the cart page
      And the cart should contain exactly the selected items, prices, and quantities
      And I proceed from the cart to checkout

    @positive @TC-043
    Scenario: Complete checkout with multiple items
      When I fill in the checkout information with valid details:
        | firstName | lastName | postalCode |
        | Jane      | Smith    | 54321      |
      And I click "Continue" on checkout page
      Then the overview should contain exactly the selected items, prices, and quantities
      And Finish and Cancel should be available on the checkout overview
      And the subtotal should equal the sum of all item prices
      And the tax should equal 8% of the subtotal
      And the total should equal subtotal plus tax
      When I click "Finish" on checkout page
      Then I should see the order completion confirmation

    @positive @TC-047
    Scenario: Verify order summary calculations
      Given I have filled in valid checkout information and proceeded to overview
      Then the overview should contain exactly the selected items, prices, and quantities
      And the subtotal should equal the sum of all item prices
      And the tax should equal 8% of the subtotal
      And the total should equal subtotal plus tax
