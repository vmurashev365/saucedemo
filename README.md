# SauceDemo Playwright TypeScript Cucumber Framework

A comprehensive test automation framework for SauceDemo application using Playwright, TypeScript, and Cucumber with Gherkin syntax, built following Page Object Model (POM) and DRY principles.

## 🎯 Features

- **TypeScript Support**: Fully typed for better IDE support and error catching
- **Cucumber/Gherkin**: BDD approach with readable feature files
- **Page Object Model**: Organized and maintainable page classes
- **DRY Principles**: Reusable components and utilities
- **Cross-browser Testing**: Chrome, Firefox, and Safari support
- **Parallel Execution**: Run tests in parallel for faster execution
- **Rich Reporting**: HTML and JSON reports with screenshots
- **CI/CD Ready**: Configured for continuous integration

## 🏗️ Project Structure

```
├── src/
│   ├── pages/           # Page Object Model classes
│   │   ├── base/        # Base page class
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   └── ...
│   ├── utils/           # Utility classes
│   │   ├── BrowserManager.ts
│   │   └── DataHelper.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── fixtures/        # Test data
│       └── testData.json
├── tests/
│   ├── features/        # Gherkin feature files
│   │   ├── login.feature
│   │   ├── inventory.feature
│   │   ├── cart.feature
│   │   └── checkout.feature
│   ├── step-definitions/ # Cucumber step definitions
│   │   ├── common.steps.ts
│   │   ├── inventory.steps.ts
│   │   └── ...
│   └── hooks/           # Test setup and teardown
│       ├── World.ts
│       └── hooks.ts
├── reports/             # Test reports (generated)
├── screenshots/         # Test screenshots (generated)
└── videos/              # Test videos (generated)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd saucedemo-playwright-cucumber
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in Chrome
npm run test:chrome

# Run tests in Firefox
npm run test:firefox

# Run tests in Safari
npm run test:safari

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Tag-based Execution

```bash
# Run only smoke tests
npx cucumber-js --tags "@smoke"

# Run only positive test cases
npx cucumber-js --tags "@positive"

# Run login tests
npx cucumber-js --tags "@login"

# Run inventory tests
npx cucumber-js --tags "@inventory"

# Run checkout tests
npx cucumber-js --tags "@checkout"

# Exclude certain tags
npx cucumber-js --tags "not @skip"
```

## 🎭 Test Scenarios Covered

### Authentication (`@login`)
- ✅ Successful login with valid credentials
- ✅ Login with different user types
- ❌ Locked out user handling
- ❌ Invalid credentials validation
- ❌ Empty field validations

### Product Inventory (`@inventory`)
- ✅ Product display and information
- ✅ Add/remove products to/from cart
- ✅ Product sorting (A-Z, Z-A, Price)
- ✅ Shopping cart badge updates
- ✅ Product navigation

### Shopping Cart (`@cart`)
- ✅ View cart contents
- ✅ Remove items from cart
- ✅ Continue shopping functionality
- ✅ Proceed to checkout
- ✅ Empty cart handling

### Checkout Process (`@checkout`)
- ✅ Complete end-to-end checkout
- ✅ Order summary validation
- ✅ Price calculations
- ❌ Form validation errors
- ✅ Checkout cancellation
- ✅ Order completion confirmation

## 🏷️ Test Tags

- `@smoke` - Critical functionality tests
- `@positive` - Happy path scenarios
- `@negative` - Error handling scenarios
- `@e2e` - End-to-end user journeys
- `@login` - Authentication tests
- `@inventory` - Product management tests
- `@cart` - Shopping cart tests
- `@checkout` - Checkout process tests

## 🔧 Configuration

### Browser Configuration

Configure browser settings in `cucumber.js`:

```javascript
worldParameters: {
  browser: 'chromium', // 'chromium', 'firefox', 'webkit'
  headed: false,       // true for visible browser
  debug: false,        // true for debug mode
  baseUrl: 'https://www.saucedemo.com',
  viewport: '1920x1080',
  timeout: 30000
}
```

### Environment Variables

```bash
# Browser selection
BROWSER=firefox

# Run mode
HEADED=true
DEBUG=true

# URL configuration
BASE_URL=https://www.saucedemo.com

# Viewport
VIEWPORT=1920x1080

# Timeout
TIMEOUT=30000

# Test tags
TAGS="@smoke and not @skip"
```

## 📊 Reporting

The framework generates multiple types of reports:

1. **Console Output**: Real-time test execution feedback
2. **JSON Report**: `reports/cucumber-report.json`
3. **HTML Report**: `reports/cucumber-report.html`
4. **Screenshots**: Captured on test failures in `screenshots/`
5. **Videos**: Test execution videos in `videos/` (debug mode)

### Generating Reports

```bash
# Generate HTML report from JSON
npm run report
```

## 🛠️ Development

### Writing New Tests

1. **Create a feature file** in `tests/features/`:
   ```gherkin
   @tag
   Feature: Feature Name
     Scenario: Test scenario
       Given I am on the login page
       When I perform an action
       Then I should see expected result
   ```

2. **Implement step definitions** in `tests/step-definitions/`:
   ```typescript
   import { Given, When, Then } from '@cucumber/cucumber';
   import { CustomWorld } from '../hooks/World';

   Given('I am on the login page', async function (this: CustomWorld) {
     await this.loginPage.navigateTo();
   });
   ```

3. **Add page objects** in `src/pages/` if needed:
   ```typescript
   export class NewPage extends BasePage {
     // Page-specific methods
   }
   ```

### Best Practices

1. **Follow POM**: Keep page-specific logic in page classes
2. **Use TypeScript**: Leverage type safety and IDE support
3. **DRY Principle**: Reuse common functionality
4. **Descriptive Names**: Use clear, readable step definitions
5. **Error Handling**: Implement proper error handling and assertions
6. **Data Management**: Use fixtures for test data
7. **Screenshots**: Capture screenshots on failures for debugging

## 🐛 Debugging

### Debug Mode

```bash
# Run in debug mode
DEBUG=true npm test

# Run specific test in debug mode
DEBUG=true npx cucumber-js tests/features/login.feature
```

### IDE Debugging

1. Set breakpoints in your TypeScript code
2. Run debug configuration in VS Code
3. Step through test execution

### Common Issues

1. **Element not found**: Check selectors and wait conditions
2. **Timing issues**: Increase timeout or add explicit waits
3. **Cross-browser issues**: Test on different browsers
4. **Data dependencies**: Ensure test data is properly set up

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests following existing patterns
4. Ensure all tests pass
5. Submit a pull request

## 📝 Test Data

Test users available in SauceDemo:

- `standard_user` - Normal user
- `locked_out_user` - Blocked user
- `problem_user` - User with UI issues
- `performance_glitch_user` - Slow user
- `error_user` - User with errors
- `visual_user` - Visual testing user

Password for all users: `secret_sauce`

## 🚀 CI/CD Integration

The framework is ready for CI/CD integration with:

- GitHub Actions
- Jenkins
- Azure DevOps
- CircleCI

Example GitHub Actions workflow included in `.github/workflows/`.

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [SauceDemo Application](https://www.saucedemo.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
