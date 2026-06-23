/**
 * SmartCanteen Selenium E2E Web Test Suite
 * Tests the complete student workflow.
 */

const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const excelReporter = require('./excel-reporter.js');
const http = require('http');

// Config check to find whether the dev server is active on 5173 or 5174
async function checkPortActive(port) {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port, path: '/', method: 'GET', timeout: 1000 }, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

describe('SmartCanteen E2E Selenium Web Suite', function() {
  this.timeout(60000); // 60 seconds timeout for entire suite

  let driver;
  let baseUrl = 'http://localhost:5173'; // Default Vite port

  const randomId = Math.floor(10000 + Math.random() * 90000);
  const TEST_USER = {
    email: `john.doe.${randomId}@college.edu`,
    fullName: 'JOHN DOE',
    studentId: `CS-2026-${randomId}`,
    mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
  };

  before(async () => {
    excelReporter.init();
    excelReporter.log('Starting SmartCanteen Web Tests...');

    // Detect the active port
    const is5173Active = await checkPortActive(5173);
    const is5174Active = await checkPortActive(5174);
    if (is5174Active && !is5173Active) {
      baseUrl = 'http://localhost:5174';
    }
    excelReporter.log(`Selected Base URL: ${baseUrl}`);

    try {
      const chrome = require('selenium-webdriver/chrome');
      const options = new chrome.Options();

      // Add options for headless/CI environments
      const isCI = process.env.CI === 'true';
      if (isCI) {
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
      }
      options.addArguments('--window-size=1920,1080');

      // Enable browser console logs collection in chromedriver
      const webdriver = require('selenium-webdriver');
      const prefs = new webdriver.logging.Preferences();
      prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
      options.setLoggingPrefs(prefs);

      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
      await driver.manage().window().maximize();
      await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
      excelReporter.log('WebDriver initialized successfully');
    } catch (error) {
      excelReporter.log(`WebDriver init error: ${error.message}`, 'error');
      throw error;
    }
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed' && driver) {
      try {
        // Query and log any visible validation error text
        const errorElements = await driver.findElements(By.className('text-error'));
        if (errorElements.length > 0) {
          excelReporter.log('--- VISIBLE FORM VALIDATION ERRORS ---', 'error');
          for (const el of errorElements) {
            excelReporter.log(`Validation Error Text: "${await el.getText()}"`, 'error');
          }
          excelReporter.log('---------------------------------------', 'error');
        }

        // Query and log any visible toast alerts
        const toastElements = await driver.findElements(By.css('[role="alert"]'));
        if (toastElements.length > 0) {
          excelReporter.log('--- VISIBLE TOAST ALERTS ---', 'error');
          for (const el of toastElements) {
            excelReporter.log(`Toast Alert: "${await el.getText()}"`, 'error');
          }
          excelReporter.log('-----------------------------', 'error');
        }

        // Query and log form text content
        try {
          const formText = await driver.findElement(By.css('form')).getText();
          excelReporter.log('--- FORM TEXT CONTENT ---', 'error');
          excelReporter.log(formText, 'error');
          excelReporter.log('-------------------------', 'error');
        } catch (err) {
          excelReporter.log(`Could not get form text: ${err.message}`, 'error');
        }

        const pageSource = await driver.getPageSource();
        const bodyIdx = pageSource.indexOf('<body');
        const bodyHtml = bodyIdx !== -1 ? pageSource.substring(bodyIdx, bodyIdx + 5000) : pageSource.substring(0, 2000);
        excelReporter.log('--- FAILURE PAGE BODY (Truncated) ---', 'error');
        excelReporter.log(bodyHtml, 'error'); 
        excelReporter.log('----------------------------', 'error');
        
        const logs = await driver.manage().logs().get('browser');
        if (logs.length > 0) {
          excelReporter.log('--- BROWSER CONSOLE LOGS ---', 'error');
          logs.forEach(l => {
            excelReporter.log(`[${l.level.name}] ${l.message}`, 'error');
          });
          excelReporter.log('----------------------------', 'error');
        }
      } catch (e) {
        excelReporter.log(`Could not capture failure details: ${e.message}`, 'error');
      }
    }
  });

  after(async () => {
    if (driver) {
      try {
        excelReporter.log('Closing WebDriver...');
        await driver.quit();
      } catch (e) {
        excelReporter.log(`Driver quit error: ${e.message}`, 'error');
      }
    }
    // Generate Report
    await excelReporter.generateAndPrint();
  });

  // Helper function to run a test with timer and register results
  async function runTestCase(id, moduleName, name, fn) {
    const start = Date.now();
    try {
      excelReporter.log(`Running [${id}] - ${name}...`);
      await fn();
      const duration = Date.now() - start;
      excelReporter.addResult(id, moduleName, name, true, null, duration);
      excelReporter.log(`[${id}] - ${name} : PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      excelReporter.addResult(id, moduleName, name, false, error.message, duration);
      excelReporter.log(`[${id}] - ${name} : FAILED (${duration}ms) - Error: ${error.message}`, 'error');
      throw error;
    }
  }

  // ============================================================
  // TEST CASES
  // ============================================================

  it('TC-W001: Register Navigation', async function() {
    await runTestCase('TC-W001', 'Authentication', 'Verify landing page and register page load', async () => {
      excelReporter.log(`Navigating to register page at ${baseUrl}/auth/register`);
      await driver.get(`${baseUrl}/auth/register`);
      await driver.wait(until.elementLocated(By.css('form')), 15000);
      excelReporter.log('Registration page and form loaded successfully');
    });
  });

  it('TC-W002: Student Registration', async function() {
    await runTestCase('TC-W002', 'Authentication', 'Fill signup form and register student', async () => {
      // Fill Full Name
      const nameInput = await driver.findElement(By.name('fullName'));
      await nameInput.sendKeys(TEST_USER.fullName);

      // Fill Student ID
      const idInput = await driver.findElement(By.name('studentId'));
      await idInput.sendKeys(TEST_USER.studentId);

      // Fill Email
      const emailInput = await driver.findElement(By.name('email'));
      await emailInput.sendKeys(TEST_USER.email);

      // Fill Mobile Number
      const mobileInput = await driver.findElement(By.name('mobile'));
      await mobileInput.sendKeys(TEST_USER.mobile);

      // Fill Password
      const passwordInput = await driver.findElement(By.name('password'));
      await passwordInput.sendKeys(TEST_USER.password);

      // Fill Confirm Password
      const confirmPasswordInput = await driver.findElement(By.name('confirmPassword'));
      await confirmPasswordInput.sendKeys(TEST_USER.password);

      // Accept Terms Checkbox
      const termsCheckbox = await driver.findElement(By.id('acceptTerms'));
      await driver.executeScript("arguments[0].click();", termsCheckbox);

      // Submit registration
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitBtn);

      // Wait for registration complete screen
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Registration Complete!')]")), 15000);
      excelReporter.log('Registration complete page is visible');

      // Wait for redirect to login page
      await driver.wait(until.urlContains('/auth/login'), 8000);
      excelReporter.log('Redirected to login page successfully');
    });
  });

  it('TC-W003: Student Login', async function() {
    await runTestCase('TC-W003', 'Authentication', 'Log in using the newly created student credentials', async () => {
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('/auth/login')) {
        await driver.get(`${baseUrl}/auth/login`);
      }

      await driver.wait(until.elementLocated(By.id('email')), 10000);
      const emailInput = await driver.findElement(By.id('email'));
      await emailInput.sendKeys(TEST_USER.email);

      const passwordInput = await driver.findElement(By.id('password'));
      await passwordInput.sendKeys(TEST_USER.password);

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();

      // Wait for redirect to dashboard
      await driver.wait(until.urlContains('/dashboard'), 15000);
      excelReporter.log('Successfully logged in and redirected to dashboard');

      // Verify Welcome Header contains student name
      await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Welcome, ')]")), 10000);
      const bodySource = await driver.getPageSource();
      if (!bodySource.includes(TEST_USER.fullName)) {
        throw new Error('User full name not displayed in dashboard welcome banner');
      }
      excelReporter.log('User name verified on dashboard');
    });
  });

  it('TC-W004: Wallet Credit Top-up', async function() {
    await runTestCase('TC-W004', 'Wallet', 'Simulate credit deposit top-up in wallet', async () => {
      const addMoneyBtn = await driver.findElement(By.css('button[title="Add Cash"]'));
      await addMoneyBtn.click();
      excelReporter.log('Clicked Add Cash button');

      // Allow state update and toast transition
      await driver.sleep(1500);

      const bodySource = await driver.getPageSource();
      // Mock initial balance starts at 450. Adding 100 makes it 550.
      if (!bodySource.includes('550')) {
        throw new Error('Wallet balance did not update to 550 after credit');
      }
      excelReporter.log('Wallet credit successfully verified');
    });
  });

  it('TC-W005: Shopping Cart - Add Menu Item', async function() {
    await runTestCase('TC-W005', 'Cart & Menu', 'Select a canteen food item and add to cart', async () => {
      const addButtons = await driver.findElements(By.xpath("//button[contains(text(), 'ADD')]"));
      excelReporter.log(`Found ${addButtons.length} menu items available to add`);

      if (addButtons.length === 0) {
        throw new Error('No items in menu catalog with active "ADD" button');
      }

      // Add first item using script click to avoid scrolling issues
      await driver.executeScript("arguments[0].click();", addButtons[0]);
      excelReporter.log('Clicked first ADD item button');

      // Verify the checkout/pay button becomes visible
      await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Pay & Generate Pass')]")), 8000);
      excelReporter.log('Checkout button Pay & Generate Pass is active');
    });
  });

  it('TC-W006: Digital Token Pass Generation', async function() {
    await runTestCase('TC-W006', 'Checkout', 'Complete payment and generate digital canteen token pass', async () => {
      const payBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Pay & Generate Pass')]"));
      await driver.executeScript("arguments[0].click();", payBtn);
      excelReporter.log('Clicked Checkout button');
      await driver.sleep(2000); // Wait for checkout processing

      const pageContent = await driver.getPageSource();
      const hasPass = pageContent.includes('Token Pass') || pageContent.includes('Preparing');
      if (!hasPass) {
        throw new Error('Active digital token pass not generated on dashboard');
      }
      excelReporter.log('Digital token pass generated successfully');
    });
  });

  it('TC-W007: Canteen Order Pickup', async function() {
    await runTestCase('TC-W007', 'Dashboard Operations', 'Claim order and pick up food', async () => {
      const claimButtons = await driver.findElements(By.xpath("//button[contains(., 'Claim Order')]"));
      if (claimButtons.length === 0) {
        throw new Error('Claim Order button not visible on active pass card');
      }
      await driver.executeScript("arguments[0].click();", claimButtons[0]);
      excelReporter.log('Clicked Claim Order button');
      await driver.sleep(1500);
      excelReporter.log('Claim Order flow verified');
    });
  });

  it('TC-W008: Notifications Check', async function() {
    await runTestCase('TC-W008', 'Dashboard Operations', 'Toggle and read notifications tray', async () => {
      const bellBtn = await driver.findElement(By.css('button[aria-label="View notifications"]'));
      await driver.executeScript("arguments[0].click();", bellBtn);
      excelReporter.log('Clicked notifications dropdown button');
      await driver.sleep(1000);

      const pageContent = await driver.getPageSource();
      if (!pageContent.includes('Canteen System Alerts')) {
        throw new Error('Notifications dropdown did not show CampusBite system alerts');
      }
      excelReporter.log('System notification checked');
    });
  });

  it('TC-W009: Session Redirection Simulator', async function() {
    await runTestCase('TC-W009', 'Security & Sessions', 'Simulate session expiration and redirect to session expired screen', async () => {
      const expireBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Expire')]"));
      await driver.executeScript("arguments[0].click();", expireBtn);
      excelReporter.log('Clicked Session Expire simulation button');

      // Wait for session expired route redirection
      await driver.wait(until.urlContains('/auth/session-expired'), 10000);
      excelReporter.log('Redirected to session expired screen');

      const pageContent = await driver.getPageSource();
      if (!pageContent.includes('Session Expired')) {
        throw new Error('Session Expired title not found on destination screen');
      }
      excelReporter.log('Session expiration redirection validated successfully');
    });
  });
});
