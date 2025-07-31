
const BasePage = require('./base/basePage');
const { clickWithHover, typeText, navigateToHomePage, checkLikeHuman, submitPassword } = require('../utils/interactionUtils');

const PANDA_HOME_PAGE_URL = 'https://www.pandashop.md/ru';
const LOGIN_ICON_SELECTOR = "div.profileIco > a:visible";
const USERNAME_SELECTOR = "//input[@id='txtEmail']";
const PASSWORD_SELECTOR = "//input[@id='txtPassword']";
const SUBMIT_BUTTON_SELECTOR = "button[name='btnSignIn']";
const SEARCH_INPUT_SELECTOR = "//input[@class='searchPnl-input ui-autocomplete-input']";
const SEARCH_BUTTON_SELECTOR = "(//i[@class='fa fa-search'])[1]";
const SELECTOR_PRODUCT_SPAN = (product) => `span:has-text('${product}')`;
const SELECTOR_PRODUCT_HEADER = (product) => `h1:has-text('${product}')`;
const BUY_BUTTON_SELECTOR = "span.btn-green:text-matches('Сumpără|Купить')";
const ADD_TO_CART_BUTTON_SELECTOR = "a.btn.btn-green:text-matches('Finalizează comanda|Перейти в корзину')";
const PREPARE_TO_BUY_BUTTON_SELECTOR = ".cart-aside-inner > button[name='btnNextStep'] > .btn-txt";
const FIRST_LAST_NAMES_SELECTOR = "//input[@name='name']";
const COURIER_RADIO_ITEM_SELECTOR = ".cart-section-delivery .cart-tile:nth-of-type(2) .cart-tile-body";
const ADDRESS_STREET_SELECTOR = "input[name='street-address']";
const ADDRESS_HOUSE_NUMBER_SELECTOR = "//input[@name='street-address-house']";
const ADDRESS_APPARTMENT_NUMBER_SELECTOR = "//input[@name='street-address-apartment']";
const ADDRESS_RADIO_ITEM_SELECTOR = "input#cart-tile-input-deliveryways-newAddress";
const COMPANY_NAME_SELECTOR = "//input[@name='companyName']";
const BANK_CODE_SELECTOR = "//input[@name='bankCode']";
const BANK_ACCOUNT_SELECTOR = "//input[@name='bankAccount']";
const ADDRESS_JURIDIC_SELECTOR = "//input[@name='addressJuridic']";
const CODE_FISCAL_SELECTOR = "//input[@name='codeFiscal']";
const USE_BONUS_FLAG_SELECTOR = "#cbBonusExpenditure";
const BONUS_SET_SELECTOR = "(//input[@id='txtBonusExpenditure'])[1]";
const COMMENT_SELECTOR = "//textarea[@name='comment']";




class PandashopPage extends BasePage {
    constructor() {
        super();
        this.bonusPopupChecker = null; // Property for interval handling
    }

    async navigateToPandaHomePage() {
        await navigateToHomePage(this.page, PANDA_HOME_PAGE_URL);
    }

    // Using constants for selectors
    async clickOnLogInIcon() {
        await clickWithHover(this.page, LOGIN_ICON_SELECTOR);
        //await clickWithHover(this.page, LOGIN_DROPDOWN_ITEM_SELECTOR);

    }

    async submitUserName(username) {
        await typeText(this.page, USERNAME_SELECTOR, username);
    }

    async submitPassword(password) {
        //await this.page.fill(PASSWORD_SELECTOR, atob(password));
        await submitPassword(this.page, PASSWORD_SELECTOR, password);
    }

    async clickOnSubmitAccountButton() {
        await this.page.waitForTimeout(2000)
        await clickWithHover(this.page, SUBMIT_BUTTON_SELECTOR)
    }


    async submitSearchedProduct(product) {
        await typeText(this.page, SEARCH_INPUT_SELECTOR, product);
        await clickWithHover(this.page, SEARCH_BUTTON_SELECTOR);
    }

    async returnedProduct(productReturned) {
        try {
            await this.page.waitForSelector(SELECTOR_PRODUCT_SPAN(productReturned));
        } catch (error) {
            console.error(`Error waiting for product ${productReturned} to return:`, error);
            return false; // Указывает на неудачу операции
        }
        return true; // Успех операции
    }

    async clickOnProductToBuy(productReturned) {
        try {
            await clickWithHover(this.page, SELECTOR_PRODUCT_SPAN(productReturned));
            await this.page.waitForSelector(SELECTOR_PRODUCT_HEADER(productReturned));
        } catch (error) {
            console.error(`Error waiting for product page of ${productReturned}:`, error);
            return false; // Указывает на неудачу операции
        }
        return true; // Успех операции

    }

    async clickOnBuyButton() {
        await clickWithHover(this.page, BUY_BUTTON_SELECTOR);
    }

    async clickOnCartButton() {
        await clickWithHover(this.page, ADD_TO_CART_BUTTON_SELECTOR);
    }

    async clickOnPrepareToBuyButton() {
        await clickWithHover(this.page, PREPARE_TO_BUY_BUTTON_SELECTOR);
    }

    async submitFirstLastName(firstlastname) {
        await typeText(this.page, FIRST_LAST_NAMES_SELECTOR, firstlastname);
    }

    async clickOnCourierRadioButton() {
        await checkLikeHuman(this.page, COURIER_RADIO_ITEM_SELECTOR)
    }

    async clickOnAddressRadioButton() {
        await checkLikeHuman(this.page, ADDRESS_RADIO_ITEM_SELECTOR)
    }


    async selectTargetCity(city) {
        await this.page.fill("input[name='city']", city)
        await this.page.locator("ul#ui-id-2")
            .locator("li.ui-menu-item.city")
            .filter({ hasText: city }).click()
    }

    async submitTargetAddress(street, houseN, appN) {
        await typeText(this.page, ADDRESS_STREET_SELECTOR, street);
        await typeText(this.page, ADDRESS_HOUSE_NUMBER_SELECTOR, houseN);
        await typeText(this.page, ADDRESS_APPARTMENT_NUMBER_SELECTOR, appN);
    }

    async submitTransferCompanyAddress(Company, Bank, IBAN, CompanyAddress, fiscal) {
        await typeText(this.page, COMPANY_NAME_SELECTOR, Company);
        await typeText(this.page, BANK_CODE_SELECTOR, Bank);
        await typeText(this.page, BANK_ACCOUNT_SELECTOR, IBAN);
        await typeText(this.page, ADDRESS_JURIDIC_SELECTOR, CompanyAddress);
        await typeText(this.page, CODE_FISCAL_SELECTOR, fiscal);
    }

    async submitBonuses(bonuses) {
        await checkLikeHuman(this.page, USE_BONUS_FLAG_SELECTOR)
        await this.page.waitForTimeout(1000 + Math.random() * 1000);
        await this.page.fill(BONUS_SET_SELECTOR, (bonuses));
    }

    async submitNotes(notes) {
        await typeText(this.page, COMMENT_SELECTOR, notes)
    }

    async pause(sec) {
        await this.page.waitForTimeout(sec * 1000)
    }


    async closeBrowser() {
        clearInterval(this.bonusPopupChecker);
        super.closeBrowser();
    }
}

module.exports = PandashopPage;
