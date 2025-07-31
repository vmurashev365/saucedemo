const { Given, When, Then, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const PandashopPage = require('../pages/pandashopPage.js');

const pandashopPage = new PandashopPage();

setDefaultTimeout(60000);



Given('I access the Pandashop home page', async function () {
    await pandashopPage.launchBrowser();
    await pandashopPage.navigateToPandaHomePage()
});

When('I click on Log In Icon in Pandashop', async function () {
    await pandashopPage.clickOnLogInIcon()
});

When('I enter Panda username {}', async function (username) {
    await pandashopPage.submitUserName(username)
});

When('I enter Panda password {}', async function (password) {

    await pandashopPage.submitPassword(password)
});

When('I click on search field, type {} and click on search button', async function (searchedProduct) {
    await pandashopPage.submitSearchedProduct(searchedProduct)
});

Then('Product named {} should be returned as result of the searching', async function (productReturned) {
    await pandashopPage.returnedProduct(productReturned)
});

Then('Click on the link related to the found {} to buy it', async function (productReturned) {
    await pandashopPage.clickOnProductToBuy(productReturned)
});

Then('Click on Buy button', async function () {
    await pandashopPage.clickOnBuyButton()
});

Then('Click on Add-To-Cart button', async function () {
    await pandashopPage.clickOnCartButton()
});

When('Click on Processed To Checkout button', async function () {
    await pandashopPage.clickOnPrepareToBuyButton()
});

When('Click on enter button', async function () {
    await pandashopPage.clickOnSubmitAccountButton()
});

Then('I enter my first and last name {}', async function (firstlastname) {
    await pandashopPage.submitFirstLastName(firstlastname)
});

Then('I select delivery by Courier to address: {}, {}, {}, {}', async function (city, street, houseN, appN) {
    await pandashopPage.clickOnCourierRadioButton()
    await pandashopPage.clickOnAddressRadioButton()
    await pandashopPage.selectTargetCity(city)
    await pandashopPage.submitTargetAddress(street, houseN, appN)
});

Then('I select to pay by {}, {}, {}, {}, {}', async function (Company, Bank, IBAN, CompanyAddress, fiscal) {
    await pandashopPage.submitTransferCompanyAddress(Company, Bank, IBAN, CompanyAddress, fiscal)
});

Then('I buy with {}', async function (bonuses) {
    await pandashopPage.submitBonuses(bonuses)
});


Then('I enter the following {}', async function (notes) {
    await pandashopPage.submitNotes(notes)
});

Then('Let us wait for {int} seconds', async function (sec) {
    await pandashopPage.pause(sec)
});

AfterAll(async function () {
    await pandashopPage.closeBrowser();
});
