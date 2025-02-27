import { test, expect } from '@playwright/test'; 
import { SignupPage } from '../pages/signup-page';
import { MailinatorPage } from '../pages/mailinator-page';
import { LoginPage } from '../pages/login-page';
import fs from 'fs';
require('dotenv').config();

const emailFilePath = 'test-email.txt'; // File to store the generated email
const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
const mailinatorUsername = process.env.MAILINATOR_USERNAME;
const lanternPassword = process.env.LANTERN_PASSWORD;


const create_data = JSON.parse(JSON.stringify(require('../test_data/login.json')));

test.describe.serial("Lantern create account and login scenarios", () => {  
  test.setTimeout(120000);

  // **Test 1: Sign up and store the generated email**
  test('Sign up and create an account', async ({ page }) => {
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

    await signupPage.fillSignupForm(create_data.fname, create_data.lname, lanternPassword);
    await signupPage.submitForm();
    await signupPage.verifySignupSuccess();
    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(testEmail);
    await mailinator.openVerificationEmail();
    await mailinator.clickVerificationLink();
  });

  // **Test 2: Retrieve stored email, verify account, and complete login**
  test('Retrieve OTP and complete login', async ({ page }) => {
    let testEmail;

    // **Ensure email file exists before proceeding**
    if (!fs.existsSync(emailFilePath)) {
      throw new Error('Test email file not found! Run the sign-up test first.');
    }

    // **Read the email from the file**
    try {
      testEmail = fs.readFileSync(emailFilePath, 'utf8').trim();
      console.log(`Retrieved Email from file: ${testEmail}`);
    } catch (err) {
      console.error('Error reading email from file:', err);
      throw err;
    }

    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);

    console.log(`Logging in with email: ${testEmail}`);

    await loginPage.goto();
    await loginPage.signin(testEmail, lanternPassword);

    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(testEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    await loginPage.submitOTP(otp);
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