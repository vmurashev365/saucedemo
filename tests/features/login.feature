@saucedemo @login
Feature: User Authentication
  As a user of SauceDemo
  I want to log in to the application
  So that I can access the product inventory

  Background:
    Given I am on the SauceDemo login page

  @positive @smoke
  Scenario: Successful login with valid credentials
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be redirected to the inventory page
    And I should see the "Products" page title
    And I should see the shopping cart icon

  @positive
  Scenario Outline: Login with different valid user types
    When I login with username "<username>" and password "secret_sauce"
    Then I should be redirected to the inventory page
    And I should see the "Products" page title

    Examples:
      | username                |
      | standard_user          |
      | problem_user           |
      | performance_glitch_user|
      | visual_user            |

  @negative
  Scenario: Login attempt with locked out user
    When I login with username "locked_out_user" and password "secret_sauce"
    Then I should see the error message "Epic sadface: Sorry, this user has been locked out."
    And I should remain on the login page

  @negative
  Scenario: Login attempt with invalid credentials
    When I login with username "invalid_user" and password "wrong_password"
    Then I should see the error message "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page

  @negative
  Scenario: Login attempt with empty username
    When I login with username "" and password "secret_sauce"
    Then I should see the error message "Epic sadface: Username is required"
    And I should remain on the login page

  @negative
  Scenario: Login attempt with empty password
    When I login with username "standard_user" and password ""
    Then I should see the error message "Epic sadface: Password is required"
    And I should remain on the login page

  @negative
  Scenario: Login attempt with empty credentials
    When I login with username "" and password ""
    Then I should see the error message "Epic sadface: Username is required"
    And I should remain on the login page
