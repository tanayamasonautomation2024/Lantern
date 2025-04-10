import { test as base } from '@playwright/test';
import { MailinatorPage } from '../pages/mailinator-page';
import { LoginPage } from '../pages/login-page';
import { SignupPage } from '../pages/signup-page';
import fs from 'fs';
require('dotenv').config();

const emailFilePath = 'test-email.txt';
const mailinatorPassword = process.env.MAILINATOR_PASSWORD;
const mailinatorUsername = process.env.MAILINATOR_USERNAME;
const lanternPassword = process.env.LANTERN_PASSWORD;
const create_data = JSON.parse(JSON.stringify(require('../test_data/login.json')));

export const lanternFixtures = base.extend({
  
  // **Fixture for account creation**
  createdAccountEmail: async ({ page }, use) => {
    const signupPage = new SignupPage(page);
    const mailinator = new MailinatorPage(page);

    await signupPage.goto();
    const testEmail = signupPage.testEmail;
    console.log(`Generated Email: ${testEmail}`);

    // **Write the email to a file**
    try {
      fs.writeFileSync(emailFilePath, testEmail);
      console.log(`Test email saved to file: ${emailFilePath}`);
    } catch (err) {
      console.error('Error writing email to file:', err);
      throw err;
    }

    // **Sign up process**
    await signupPage.fillSignupForm(create_data.fname, create_data.lname, lanternPassword);
    await signupPage.submitForm();
    await signupPage.verifySignupSuccess();

    // **Email Verification**
    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailinatorPassword);
    await mailinator.searchEmail(testEmail);
    await mailinator.openVerificationEmail();
    await mailinator.clickVerificationLink();

    // **Pass the created email to the test**
    await use(testEmail);
  },

  // **Fixture for logging in after account creation**
  loggedInPage: async ({ page, createdAccountEmail }, use) => {
    const loginPage = new LoginPage(page);
    const mailinator = new MailinatorPage(page);
    
    let testEmail = createdAccountEmail;

    // **Read stored email if not provided (fallback)**
    if (!testEmail && fs.existsSync(emailFilePath)) {
      testEmail = fs.readFileSync(emailFilePath, 'utf8').trim();
    }

    console.log(`Logging in with email: ${testEmail}`);

    await loginPage.goto();
   // await loginPage.closeCookieBanner();
    await loginPage.signin(testEmail, lanternPassword);

    await mailinator.gotoLoginPage();
    //await mailinator.login(mailinatorUsername, mailinatorPassword);
    //await mailinator.searchEmail(testEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);
    
    await loginPage.submitOTP(otp);

    // **Pass the logged-in page instance**
    await use(page);
  },
});