import { test, expect } from '@playwright/test';
import { MailinatorPage } from '../pages/mailinator-page';
import { LoginPage } from '../pages/login-page';
require('dotenv').config();

const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
const mailinatorUsername = process.env.MAILINATOR_USERNAME;
const lanternPassword = process.env.LANTERN_PASSWORD;
const email = process.env.TEST_EMAIL;  

test.describe("Lantern - Verify the registered case should display on My Claim page", () => {
    test.setTimeout(90000);

test('Login, verify OTP, and check claimBox', async ({ page }) => {
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);

    
    console.log(`Logging in with email: ${email}`);

    // Step 1: Go to login page and enter credentials
    await loginPage.goto();
    await loginPage.signin(email, lanternPassword);

    // Step 2: Retrieve OTP from Mailinator
    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(email);
    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    // Step 3: Enter OTP and click Agree
    await loginPage.submitOTP(otp);

    // Step 4: Check for claimBox under 'My ongoing claims'
    await loginPage.verifyRegisteredCase();
});
// **After each test: log success or failure**
test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed') {
      console.log(`Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`Test failed: ${testInfo.title}`);
    }
  });
});