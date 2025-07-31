const { chromium } = require('playwright');
const popupSelectorPanda = "div.h3:text-matches('Înregistrați-vă și primiți|Подпишись и получи'):visible";
const popupSelector = "div[class*='modal-content']:has-text('Created A Profile For You')";
const closeButtonSelectorPanda = 'div.popup-close:visible';
const closeButtonSelector = "button[data-t='close-button']";

class BasePage {
    constructor() {
        this.browser = null;
        this.page = null;
        this.bonusPopupChecker = null; // Property for saving time interval 

    }

    async launchBrowser() {
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
        this.browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--disable-infobars', '--no-sandbox', '--disable-software-rasterizer', '--lang=en-US']
        });
        this.context = await this.browser.newContext({
            viewport: null,
            userAgent: userAgent
        });

        this.page = await this.context.newPage();

        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        this.bonusPopupChecker = setInterval(() => { this.closeBonusPopup(); }, 2000);

    }

    async closeBonusPopup() {
        try {
            if (this.browser && this.page && !this.page.isClosed()) {
                if (await this.page.isVisible(popupSelector)) {
                    console.log('Bonus popup detected, closing...');
                    await this.page.click(closeButtonSelector);
                }
            }
            {
                if (this.browser && this.page && !this.page.isClosed()) {
                    if (await this.page.isVisible(popupSelectorPanda)) {
                        console.log('Bonus popup detected, closing...');
                        await this.page.click(closeButtonSelectorPanda);
                    }
                }
            }
        } catch (error) {
            console.error('Error closing bonus popup:', error);
        }
    }



    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = BasePage;
