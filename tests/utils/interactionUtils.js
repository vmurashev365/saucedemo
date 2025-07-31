//const BasePage = require('../pages/base/basePage.js');



async function navigateToHomePage(page, URL) {
    try {
        await page.goto(URL);
        await page.waitForTimeout(1000 + Math.random() * 2000); // Mimic human delay
    } catch (error) {
        console.error(`Error navigating to ${URL}:`, error);
    }
}

async function navigateBack(page) {
    try {
        await page.waitForTimeout(1000 + Math.random() * 2000); // Mimic human delay
        // Return back to previous page
        await page.goBack();
    } catch (error) {
        console.error(`Error navigating back`, error);
    }
}

async function clickWithHover(page, selector) {
    const element = await page.waitForSelector(selector);
    const boundingBox = await element.boundingBox();
    if (boundingBox) {
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.hover(selector);
        await page.waitForTimeout(1000 + Math.random() * 1500);
        await page.click(selector);
    }
}

async function clickWithoutHover(page, selector) {
    const element = await page.waitForSelector(selector);
    const boundingBox = await element.boundingBox();
    if (boundingBox) {
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.waitForTimeout(1000 + Math.random() * 1500);
        await page.click(selector);
    }
}

async function checkLikeHuman(page, selector) {
    const element = await page.waitForSelector(selector);

    // Check that the item is visible and not already selected before performing operations
    if (await element.isVisible() && !(await element.isChecked())) {
        // Hovering the cursor over an element
        await element.hover();
        // Random delay before click
        await page.waitForTimeout(300 + Math.random() * 200);
        await element.click();
    }
}

async function clickWithRetry(page, selector, maxRetries = 5, waitTime = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const button = await page.locator(selector);
            if (await button.isVisible() && await button.isEnabled()) {
                // Hovering the cursor over an element
                await button.hover();
                // Random delay before click
                await page.waitForTimeout(150 + Math.random() * 200);
                await button.click();
                return true;
            }
        } catch (error) {
            console.log(`Attempt ${retries + 1} failed: ${error.message}`);
        }
        retries++;
        await page.waitForTimeout(waitTime);
    }
    return false;
}

async function typeText(page, selector, text) {
    try {
        const element = await page.waitForSelector(selector);
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
            await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
            await page.fill(selector, ''); // clear field before typing
            await page.waitForTimeout(500 + Math.random() * 500);
            await page.type(selector, text, { delay: 50 + Math.random() * 100 });
        }
    } catch (error) {
        console.error('Error in typeText:', error);
        throw error; // Transferring errors for more transparent exception management
    }
}

async function submitPassword(page, selector, password) {
    const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');
    const inputSelector = selector;

    // Hover the cursor over the password entry
    await page.hover(inputSelector);
    await page.waitForTimeout(300 + Math.random() * 200);  // Mimic human delay
    // Click on item to activate input field
    await page.click(inputSelector);

    // Use a delay between characters when entering a password
    for (const char of decodedPassword) {
        await page.type(inputSelector, char, { delay: 50 + Math.random() * 150 });
    }

    // Simulate the accidental deletion of the last symbol and re-type.
    if (Math.random() < 0.3) {  // With a 30% probability
        await page.press(inputSelector, 'Backspace');
        await page.waitForTimeout(100 + Math.random() * 100);
        await page.type(inputSelector, decodedPassword.slice(-1), { delay: 50 + Math.random() * 150 });
    }
}

async function checkElementVisibility(page, selector) {
    const isVisible = await page.locator(selector).isVisible();
    if (!isVisible) {
        throw new Error('Element is not visible');
    }
}

async function checkTextPresented(page, selector) {
    const pageText = await page.textContent('body');
    const text = await page.locator(selector).innerText();
    //const isTExtPresent = await page.textContent(text);
    if (pageText.includes(text)) {
        console.log(`Text "${text}" is present on the page.`);
    } else {
        console.log(`Text "${text}" is NOT present on the page.`);
    }
}


module.exports = {
    clickWithHover,
    clickWithoutHover,
    clickWithRetry,
    typeText,
    navigateToHomePage,
    navigateBack,
    checkLikeHuman,
    submitPassword,
    checkElementVisibility,
    checkTextPresented
};

