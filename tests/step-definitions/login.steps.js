// login.steps.js
const { Given, When, Then, AfterAll } = require('@cucumber/cucumber');
const LoginPage = require('../pages/loginPage.js');

const loginPage = new LoginPage();


Given('A web browser is at the homepage', async function () {
  await loginPage.launchBrowser();
  await loginPage.gotoHomepage();
});

When('I enter valid {} and {}', async function (username, password) {
  await loginPage.enterCredentials(username, password);
});

When('I click the login button', async function () {
  await loginPage.clickLogin();
});

Then('I should be redirected to the dashboard', async function () {
  await loginPage.waitForDashboard();
});

When('I wait for <{int}> seconds', async function (sec) {
  await loginPage.pause(sec)
  //return new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

Then('I see a {} message', async function (loginValidationMessage) {
  await loginPage.checkForAlert(loginValidationMessage);
  });


AfterAll(async function() {
  await loginPage.closeBrowser();
});
