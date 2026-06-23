/**
 * SmartCanteen E2E Test Suite
 * Tests the complete student workflow:
 * 1. Student Signup
 * 2. Student Login
 * 3. Dashboard Operations (Wallet, Cart, Order, and Notifications)
 * 4. Auth Lockout/Timeout Simulations
 *
 * Run with: npm run canteen-e2e
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');
const reportGenerator = require('./reportGenerator.cjs');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const TEST_USER = {
  email: 'john.doe@college.edu',
  fullName: 'JOHN DOE',
  studentId: 'CS-2026-928',
  mobile: '9876543210',
  password: 'Password123!',
};

// Re-export the reporter functions for use in tests
const log = (message, level) => reportGenerator.log(message, level);
const addResult = (testName, passed, error) => reportGenerator.addResult(testName, passed, error);

describe('SmartCanteen E2E Workflow', function() {
  this.timeout(60000); // 60 seconds timeout for entire suite

  let driver;

  before(async () => {
    reportGenerator.init();
    log('Initializing WebDriver...');
    try {
      const chrome = require('selenium-webdriver/chrome');
      const options = new chrome.Options();

      // Add options for CI/headless environment
      const isCI = process.env.CI === 'true';
      if (isCI) {
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
      }
      options.addArguments('--window-size=1920,1080');

      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
      await driver.manage().window().maximize();
      await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
      log(`WebDriver initialized successfully in ${isCI ? 'headless' : 'headed'} mode`);
    } catch (error) {
      log(`WebDriver init error: ${error.message}`, 'error');
    }
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed' && driver) {
      try {
        const logs = await driver.manage().logs().get('browser');
        if (logs.length > 0) {
          log('--- BROWSER CONSOLE LOGS ---', 'error');
          logs.forEach(l => {
            log(`[${l.level.name}] ${l.message}`, 'error');
          });
          log('----------------------------', 'error');
        }
      } catch (e) {
        log(`Could not capture browser logs: ${e.message}`, 'error');
      }
    }
  });

  after(async () => {
    if (driver) {
      try {
        log('Closing WebDriver...');
        await driver.quit();
      } catch (e) {
        log(`Driver quit error: ${e.message}`, 'error');
      }
    }
    // Generate report
    const report = await reportGenerator.generateAndPrint();
    log(`Tests completed: ${report.passed} passed, ${report.failed} failed`);
  });

  // ============================================================
  // TEST 1: SIGNUP
  // ============================================================
  describe('1. Student Signup', function() {
    it('should navigate to register page and create new student account', async function() {
      try {
        log('Starting Signup test...');

        // Navigate to register page
        log(`Navigating to register page at ${BASE_URL}/auth/register`);
        await driver.get(`${BASE_URL}/auth/register`);

        // Wait for register form to load
        await driver.wait(until.elementLocated(By.css('form')), 15000);
        log('Register form loaded successfully');

        // Fill Full Name
        const nameInput = await driver.findElement(By.css('input[placeholder="Rohan Sharma"]'));
        await nameInput.sendKeys(TEST_USER.fullName);
        log('Entered full name');

        // Fill Student ID
        const idInput = await driver.findElement(By.css('input[placeholder="CS-2023-92"]'));
        await idInput.sendKeys(TEST_USER.studentId);
        log('Entered student roll no.');

        // Fill Email
        const emailInput = await driver.findElement(By.css('input[placeholder="student@college.edu"]'));
        await emailInput.sendKeys(TEST_USER.email);
        log('Entered college email');

        // Fill Mobile Number
        const mobileInput = await driver.findElement(By.css('input[placeholder="9876543210"]'));
        await mobileInput.sendKeys(TEST_USER.mobile);
        log('Entered mobile number');

        // Fill Password
        const passwordInput = await driver.findElement(By.css('input[placeholder="••••••••"]'));
        const passwordFields = await driver.findElements(By.css('input[type="password"]'));
        if (passwordFields.length >= 2) {
          await passwordFields[0].sendKeys(TEST_USER.password);
          await passwordFields[1].sendKeys(TEST_USER.password);
          log('Entered password and confirm password');
        } else {
          throw new Error('Could not find password and confirm password fields');
        }

        // Accept Terms & Conditions checkbox
        const termsCheckbox = await driver.findElement(By.id('acceptTerms'));
        // Click using javascript helper to bypass any absolute overlay alignment issues
        await driver.executeScript("arguments[0].click();", termsCheckbox);
        log('Accepted terms and conditions');

        // Submit registration
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await submitBtn.click();
        log('Clicked create account submit button');

        // Wait for registration complete screen
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Registration Complete!')]")), 15000);
        log('Registration complete success message detected');

        // Wait for redirect to login page (takes ~3s in UI)
        await driver.wait(until.urlContains('/auth/login'), 6000);
        log(`Successfully redirected to login page: ${await driver.getCurrentUrl()}`);

        addResult('Signup - Create student account and redirect', true);

      } catch (error) {
        addResult('Signup - Create student account and redirect', false, error.message);
        throw error;
      }
    });
  });

  // ============================================================
  // TEST 2: LOGIN
  // ============================================================
  describe('2. Student Login', function() {
    it('should login with the newly created account', async function() {
      try {
        log('Starting Login test...');

        // If not already on login page, navigate to it
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/auth/login')) {
          log('Navigating to login page...');
          await driver.get(`${BASE_URL}/auth/login`);
        }

        // Wait for login form
        await driver.wait(until.elementLocated(By.id('email')), 10000);
        log('Login page loaded');

        // Fill credentials
        const emailInput = await driver.findElement(By.id('email'));
        await emailInput.sendKeys(TEST_USER.email);

        const passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys(TEST_USER.password);
        log('Entered login credentials');

        // Click Sign In
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await submitBtn.click();
        log('Clicked Sign In button');

        // Wait for redirect to dashboard
        await driver.wait(until.urlContains('/dashboard'), 15000);
        log('Successfully logged in and redirected to dashboard');

        // Wait for welcome header element to render (resolves React loading screen race condition)
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Welcome, ')]")), 10000);
        log('Dashboard welcome header rendered');

        // Check if welcome message matches user's name
        const bodySource = await driver.getPageSource();
        const welcomeMessagePresent = bodySource.includes(TEST_USER.fullName);

        if (welcomeMessagePresent) {
          log('Welcome message verified successfully');
          addResult('Login - Login with student account', true);
        } else {
          throw new Error('Dashboard welcome message did not display user name');
        }

      } catch (error) {
        addResult('Login - Login with student account', false, error.message);
        throw error;
      }
    });
  });

  // ============================================================
  // TEST 3: DASHBOARD OPERATIONS
  // ============================================================
  describe('3. Dashboard Canteen Operations', function() {
    it('should deposit money and top-up the wallet balance', async function() {
      try {
        log('Testing wallet deposit...');

        // Verify initial deposit top-up triggers balance update
        const addMoneyBtn = await driver.findElement(By.css('button[title="Add Cash"]'));
        await addMoneyBtn.click();
        log('Clicked Add Cash button');

        // Let the state update and toast disappear
        await driver.sleep(1500);

        const bodySource = await driver.getPageSource();
        // Default mock balance starts at 450. Adding 100 makes it 550.
        const balanceCredited = bodySource.includes('550');

        if (balanceCredited) {
          log('Wallet credited by ₹100 successfully');
          addResult('Dashboard - Deposit money to wallet', true);
        } else {
          throw new Error('Balance did not reflect top-up amount');
        }
      } catch (error) {
        addResult('Dashboard - Deposit money to wallet', false, error.message);
        throw error;
      }
    });

    it('should add menu items to the shopping cart', async function() {
      try {
        log('Testing adding menu items to cart...');

        // Find the first ADD button in the menu catalogue
        const addButtons = await driver.findElements(By.xpath("//button[contains(text(), 'ADD')]"));
        log(`Found ${addButtons.length} menu items available to add`);

        if (addButtons.length === 0) {
          throw new Error('No menu items available with an "ADD" button');
        }

        // Add first item to cart using JavaScript click to be bulletproof
        await driver.executeScript("arguments[0].click();", addButtons[0]);
        log('Added first item to cart');

        // Wait for the checkout/billing section to appear and contain "Pay & Generate Pass"
        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Pay & Generate Pass')]")), 5000);
        log('Cart billing section updated and checkout button is active');
        addResult('Dashboard - Add menu item to cart', true);
      } catch (error) {
        addResult('Dashboard - Add menu item to cart', false, error.message);
        throw error;
      }
    });

    it('should pay and generate digital tokens', async function() {
      try {
        log('Testing checkout payment and token generation...');

        const payBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Pay & Generate Pass')]"));
        await driver.executeScript("arguments[0].click();", payBtn);
        log('Clicked Checkout button via JS click');
        await driver.sleep(2000); // Wait for animations

        // Verify active token card appeared in dashboard
        const pageContent = await driver.getPageSource();
        const hasTokenCard = pageContent.includes('Token Pass') || pageContent.includes('Preparing');

        if (hasTokenCard) {
          log('Digital token pass generated successfully');
          addResult('Dashboard - Pay & Generate Token', true);
        } else {
          throw new Error('Digital token pass did not appear in dashboard');
        }
      } catch (error) {
        addResult('Dashboard - Pay & Generate Token', false, error.message);
        throw error;
      }
    });

    it('should collect/claim a food token pass', async function() {
      try {
        log('Testing token pickup collection...');

        // Click Claim Order button
        const claimButtons = await driver.findElements(By.xpath("//button[contains(., 'Claim Order')]"));
        if (claimButtons.length > 0) {
          await driver.executeScript("arguments[0].click();", claimButtons[0]);
          log('Clicked Claim Order pickup button via JS click');
          await driver.sleep(1500);

          addResult('Dashboard - Claim and pick up order', true);
        } else {
          throw new Error('No claim order buttons found');
        }
      } catch (error) {
        addResult('Dashboard - Claim and pick up order', false, error.message);
        throw error;
      }
    });

    it('should open system notifications panel', async function() {
      try {
        log('Testing notifications menu toggle...');

        // Click notifications button (bell icon)
        const bellBtn = await driver.findElement(By.css('button[aria-label="View notifications"]'));
        await driver.executeScript("arguments[0].click();", bellBtn);
        log('Opened notifications dropdown via JS click');
        await driver.sleep(1000);

        const pageContent = await driver.getPageSource();
        const hasAlerts = pageContent.includes('Canteen System Alerts');

        if (hasAlerts) {
          log('Notifications dropdown content verified');
          addResult('Dashboard - Open notifications panel', true);
        } else {
          throw new Error('Notifications dropdown did not open');
        }
      } catch (error) {
        addResult('Dashboard - Open notifications panel', false, error.message);
        throw error;
      }
    });
  });

  // ============================================================
  // TEST 4: AUTH FLOW SIMULATIONS
  // ============================================================
  describe('4. Simulation and Error Scenarios', function() {
    it('should trigger session expiration timeout and redirect to session expired screen', async function() {
      try {
        log('Testing simulated session timeout...');

        // Click the timeout/expiration simulator button
        const expireBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Expire')]"));
        await driver.executeScript("arguments[0].click();", expireBtn);
        log('Clicked simulated Expire button via JS click');

        // Wait for session expired route redirection
        await driver.wait(until.urlContains('/auth/session-expired'), 10000);
        log('Successfully redirected to /auth/session-expired page');

        const pageContent = await driver.getPageSource();
        const isSessionExpiredScreen = pageContent.includes('Session Expired');

        if (isSessionExpiredScreen) {
          log('Session Expired page verified');
          addResult('Simulation - Session Timeout redirection', true);
        } else {
          throw new Error('Session Expired title not found on the page');
        }
      } catch (error) {
        addResult('Simulation - Session Timeout redirection', false, error.message);
        throw error;
      }
    });
  });
});
