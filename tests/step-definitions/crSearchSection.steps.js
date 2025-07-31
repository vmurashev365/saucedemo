const { Given, When, Then, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const CRSearchSectionPage = require('../pages/crSearchSectionPage.js');

const crSearchSectionPage = new CRSearchSectionPage();

setDefaultTimeout(60000);

Given('I access the Crunchroll home page', async function () {
  await crSearchSectionPage.launchBrowser();
  await crSearchSectionPage.navigateToCRHomePage()
});

Given('I click on Log In Icon to enter Crunchroll account', async function () {
  await crSearchSectionPage.clickOnLogInIcon()
});

Given('I enter username {}', async function (username) {
  await crSearchSectionPage.submitUserName(username)
});

Given('I enter password {}', async function (password) {
  await crSearchSectionPage.submitPassword(password)
});


Given('Click on Submit button', async function () {
  await crSearchSectionPage.clickOnSubmitAccountButton()
});

When('I click on the search icon', async function () {
  await crSearchSectionPage.clickOnSearchIcon()
});

When('I fill in the search field with {}', async function (content) {
  await crSearchSectionPage.enterContent(content)
});


When('I click on any card from the Top Results section', async function () {
  await crSearchSectionPage.clickOnTopCard()
});


Then('I should be redirected to the desired content page', async function () {
  await crSearchSectionPage.checkIfTopCardContentUploaded()
});

When('I return back to the search page', async function () {
  await crSearchSectionPage.navigateBackToSearchPage()
});

When('I click on any result from the Series section', async function () {
  await crSearchSectionPage.clickOnSeriesCard()
});


Then('I should be redirected to the desired series page', async function () {
  await crSearchSectionPage.checkIfSeriesCardContentUploaded()
});

When('I click on any result from the Movies section', async function () {
  await crSearchSectionPage.clickOnMoviesCard()
});

Then('I should be redirected to the desired Movies page', async function () {
  await crSearchSectionPage.checkIfMoviesCardContentUploaded()
});

When('I click on any result from the Episodes section', async function () {
  await crSearchSectionPage.clickOnEpisodesCard()
});

Then('I should be redirected to the desired Episodes page', async function () {
  await crSearchSectionPage.checkIfEpisodesCardContentUploaded()
});

Then('Let us wait for {int} seconds', async function (sec) {
  await crSearchSectionPage.pause(sec)
});

AfterAll(async function () {
  await crSearchSectionPage.closeBrowser();
});
