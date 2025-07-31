# npm run test
# npx playwright codegen pandashop.md
# VUBWV003SENtL2dBcF9k   
# QWRvbmFpISEh


Feature: Pandashop ordering product
@pandaShop

  Scenario Outline: Validate searching and preparing order in Panda Shop
    Given I access the Pandashop home page
    And I click on Log In Icon in Pandashop
    And I enter Panda username <username>
    And I enter Panda password <password> 
    And Click on enter button
    When I click on search field, type <searchedProduct> and click on search button
    And Product named <returnedProduct> should be returned as result of the searching
    And Click on the link related to the found <returnedProduct> to buy it
    And Click on Buy button
    And Click on Add-To-Cart button
    And Click on Processed To Checkout button
    Then I enter my first and last name <firstlastname>
    And I select delivery by Courier to address: <city>, <street>, <houseN>, <appN>
    And I select to pay by <Company>, <Bank>, <IBAN>, <CompanyAddress>, <fiscal> 
    And I buy with <bonuses>
    And I enter the following <notes>
    And Let us wait for 5 seconds

    Examples: 
    | searchedProduct | returnedProduct   | username             | password              | firstlastname  | city          | street    | houseN | appN | Company        | Bank     | IBAN                     | CompanyAddress    | fiscal        | bonuses | notes |
    | sven ps-295     | Sven PS-295 Blue  | vmurashev@gmail.com  | QWRvbmFpISEh          | Victor Murasev | mun. Chişinău | Zelinski  | 32/4   |  8   | Urbanconstruct | AGRNMD2X | MD70AG000000022511781341 | Mt.Gurie Grosu 17 | 1010600033952 | 44      | Note to the order |
