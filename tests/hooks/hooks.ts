import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { CustomWorld } from './World';
import fs from 'fs';
import path from 'path';

// Global setup before all scenarios
BeforeAll(async function () {
  // Create necessary directories if they don't exist
  const directories = ['screenshots', 'videos', 'reports', 'har'];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log('🚀 Starting SauceDemo test suite...');
});

// Setup before each scenario
Before(async function (this: CustomWorld, scenario) {
  console.log(`📋 Starting scenario: ${scenario.pickle.name}`);
  
  // Initialize browser and page objects
  await this.init();
  
  // Set scenario name for screenshots
  this.setTestData('scenarioName', scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_'));
  this.setTestData('startTime', Date.now());
});

// Cleanup after each scenario
After(async function (this: CustomWorld, scenario) {
  const scenarioName = this.getTestData('scenarioName');
  const startTime = this.getTestData('startTime');
  const duration = Date.now() - startTime;
  
  console.log(`⏱️  Scenario "${scenario.pickle.name}" completed in ${duration}ms`);

  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED) {
    console.log(`❌ Scenario failed: ${scenario.pickle.name}`);
    await this.takeScreenshot(`FAILED-${scenarioName}`);
    
    // Attach screenshot to report
    if (this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    }
    
    // Log page console errors if available
    if (this.page) {
      const logs = await this.page.evaluate(() => {
        return {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
      }).catch(() => ({ url: 'unknown', userAgent: 'unknown', timestamp: new Date().toISOString() }));
      
      this.attach(JSON.stringify(logs, null, 2), 'application/json');
    }
  } else if (scenario.result?.status === Status.PASSED) {
    console.log(`✅ Scenario passed: ${scenario.pickle.name}`);
  }

  // Clean up browser resources
  await this.cleanup();
  
  // Clear test data
  this.clearTestData();
});

// Global cleanup after all scenarios
AfterAll(async function () {
  console.log('🏁 Test suite completed!');
  
  // Generate test report
  console.log('📊 Check reports/ directory for detailed test results');
});
