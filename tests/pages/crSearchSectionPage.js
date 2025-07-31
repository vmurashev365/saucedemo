const BasePage = require('./base/basePage');
const { clickWithHover, typeText, navigateToHomePage, navigateBack, clickWithRetry, submitPassword, checkElementVisibility, checkTextPresented } = require('../utils/interactionUtils');

const CR_HOME_PAGE_URL = 'https://www.crunchyroll.com/';
const LOGIN_ICON_SELECTOR = "div.erc-header-tile:has-text('Account menu')";
const LOGIN_DROPDOWN_ITEM_SELECTOR = "div.nav-item-info:has-text('Log In') > h5";
const USERNAME_SELECTOR = "div[data-t='email-input']:has-text('Email Address') >> input[name='email']";
const PASSWORD_SELECTOR = "div[data-t='password-input']:has-text('Password') >> input[name='password']";
const SUBMIT_BUTTON_SELECTOR = "button[data-t='login-button']:has-text('Log In')";
const SEARCH_ICON_SELECTOR = "svg[data-t='search-svg']";
const SEARCH_FIELD_SELECTOR = "div.search-input-wrapper > input";
const CARD_FROM_TOP_SELECTOR = "div.top-results-cards-wrapper > div[data-t='search-series-card']:nth-child(2) >> a[class*='search-show-card-hover__link']";
const CARD_FROM_SERIES_SELECTOR = "div.series-results-cards-wrapper > div[data-t='search-series-card']:nth-child(3) >> a[class*='search-show-card-hover__link']";
const CARD_FROM_MOVIES_SELECTOR = "div.movies-results-cards-wrapper > div[data-t='search-movie-card']:nth-child(1) >> a[class*='search-show-card-hover__link']";
const CARD_FROM_EPISODES_SELECTOR = "div.episodes-results-cards-wrapper > div[data-t='search-episode-card']:nth-child(2) >> a[class*='search-episode-card-hover__link']";
const CARD_HEADER = ".top-controls >> h4"; 
const CARD_MOVIES_HEADER = "div.current-media-body >> h1"; 
const CARD_EPISODES_HEADER = "div.erc-current-media-info >> h1"; 




class CRSearchSectionPage extends BasePage {
    constructor() {
        super();
        this.bonusPopupChecker = null; // Property for interval handling
    }

    async navigateToCRHomePage() {
        await navigateToHomePage(this.page, CR_HOME_PAGE_URL);
    }

    // Using constants for selectors
    async clickOnLogInIcon() {
        await clickWithHover(this.page, LOGIN_ICON_SELECTOR);
        await clickWithHover(this.page, LOGIN_DROPDOWN_ITEM_SELECTOR);

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


    async clickOnSearchIcon() {
        await clickWithRetry(this.page, SEARCH_ICON_SELECTOR);
    }

    async enterContent(content) {
        await typeText(this.page, SEARCH_FIELD_SELECTOR, content);
    }

    async clickOnTopCard() {
        await clickWithRetry(this.page, CARD_FROM_TOP_SELECTOR);
    }

    async checkIfTopCardContentUploaded() {
        await checkTextPresented(this.page, CARD_HEADER);
    }

    async clickOnSeriesCard() {
        await clickWithRetry(this.page, CARD_FROM_SERIES_SELECTOR);
    }

    async checkIfSeriesCardContentUploaded() {
        await checkTextPresented(this.page, CARD_HEADER);
    }

    async clickOnMoviesCard() {
        await clickWithRetry(this.page, CARD_FROM_MOVIES_SELECTOR);
    }

    async checkIfMoviesCardContentUploaded() {
        await checkTextPresented(this.page, CARD_MOVIES_HEADER);
    }

    async clickOnEpisodesCard() {
        await clickWithRetry(this.page, CARD_FROM_EPISODES_SELECTOR);
    }

    async checkIfEpisodesCardContentUploaded() {
        await checkTextPresented(this.page, CARD_EPISODES_HEADER);
    }


    async navigateBackToSearchPage() {
        await navigateBack(this.page);
    }

    async pause(sec) {
        await this.page.waitForTimeout(sec * 1000)
    }


    async closeBrowser() {
        clearInterval(this.bonusPopupChecker);
        super.closeBrowser();
    }
}

module.exports = CRSearchSectionPage;
