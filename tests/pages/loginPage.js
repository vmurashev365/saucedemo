// loginPage.js
const { chromium } = require('playwright');


class LoginPage {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async launchBrowser() {
        this.browser = await chromium.launch({ headless: false });
        this.page = await this.browser.newPage();

    }

    async gotoHomepage() {
        await this.page.goto('https://webdriveruniversity.com/Login-Portal/index.html?');
    }

    async enterCredentials(username, password) {
        await this.page.fill('input[id="text"]', username);
        await this.page.fill('input[id="password"]', password);
    }

    async clickLogin() {
        await this.page.click('button[id="login-button"]');
    }

    async checkForAlert(loginValidationMessage){
        const isVisible = await this.page.isVisible(`text=${loginValidationMessage}`);
        if (!isVisible) {
          throw new Error(`Text "${loginValidationMessage}" not found on the page.`);
        }
        }

    async pause(sec) {
        await this.page.pause(sec * 1000)
    }

    async closeBrowser() {
        await this.browser.close();
    }
}

module.exports = LoginPage;
