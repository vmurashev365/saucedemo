#npm run test
@crSearchSection
Feature: Test cases for Crunchroll

  Scenario Outline: TC3.1 - Search in the top results section
    Given I access the Crunchroll home page
    And I click on Log In Icon to enter Crunchroll account
    And I enter username <username>
    And I enter password <password>
    And Click on Submit button
    And Let us wait for 2 seconds
    When I click on the search icon
    And I fill in the search field with <content>
    And Let us wait for 2 seconds
    And I click on any card from the Top Results section
    And Let us wait for 2 seconds
    Then I should be redirected to the desired content page

    Given I return back to the search page
    And Let us wait for 2 seconds
    When I click on any result from the Series section
    And Let us wait for 2 seconds
    Then I should be redirected to the desired series page

    Given I return back to the search page
    And Let us wait for 2 seconds
    When I click on any result from the Movies section
    And Let us wait for 2 seconds
    Then I should be redirected to the desired Movies page

    Given I return back to the search page
    And Let us wait for 2 seconds
    When I click on any result from the Episodes section
    And Let us wait for 2 seconds
    Then I should be redirected to the desired Episodes page


    Examples:
      | username            | password             | content |
      | vmurashev@gmail.com | VUBWV003SENtL2dBcF9k | the     |
