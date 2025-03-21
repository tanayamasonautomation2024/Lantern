import { test, expect } from '@playwright/test'; 
import { SignupPage } from '../pages/signup-page';
import { MailinatorPage } from '../pages/mailinator-page';
import { LoginPage } from '../pages/login-page';
import {MyAccountPage} from '../pages/my-account-page'
import { CasePage } from '../pages/check-for-qualification';
import accountData from '../test_data/my_account.json'
import fs from 'fs';
require('dotenv').config();


const emailFilePath = 'test-email.txt'; // File to store the generated email
const newEmailFilePath = 'account-email.txt';
const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
const mailinatorUsername = process.env.MAILINATOR_USERNAME;
const lanternPassword = process.env.LANTERN_PASSWORD;
const new_email = `automation${Math.floor(Math.random() * 100000) + 1}@lantern.throwemails.com`;


const create_data = JSON.parse(JSON.stringify(require('../test_data/login.json')));
const testData = JSON.parse(JSON.stringify(require('../test_data/qualification_case_details.json')));

test.describe("Lantern - My Account scenarios", () => {  
  test.setTimeout(300000);
test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    test.slow();

    // **Write the email to a file**
          try {
            fs.writeFileSync(newEmailFilePath, new_email);
            console.log(`Test email saved to file: ${newEmailFilePath}`);
          } catch (err) {
            console.error('Error writing email to file:', err);
            throw err;
          }
    // try {  
    //   const signupPage = new SignupPage(page);
    //       const mailinator = new MailinatorPage(page);
    //       await signupPage.goto();
      
    //       const testEmail = signupPage.testEmail;  
    //       console.log(`Generated Email: ${testEmail}`);
      
    //       // **Write the email to a file**
    //       try {
    //         fs.writeFileSync(emailFilePath, testEmail);
    //         console.log(`Test email saved to file: ${emailFilePath}`);
    //       } catch (err) {
    //         console.error('Error writing email to file:', err);
    //         throw err;
    //       }
      
          // await signupPage.fillSignupForm(create_data.fname, create_data.lname, lanternPassword);
          // await signupPage.submitForm();
          // await signupPage.verifySignupSuccess();
          // await mailinator.gotoLoginPage();
          // await mailinator.login(mailinatorUsername, mailnatorPassword);
          // await mailinator.searchEmail(testEmail);
          // await mailinator.openVerificationEmail();
          // await mailinator.clickVerificationLink();
          // await page.goto(process.env.LANTERN_SIGNIN_URL);
      
    // } catch (error) {
    //   // Handle the error here
    //   console.error("An error occurred in test.beforeEach:", error);
    // }

  })
  

  test('Check My Account page', async ({ page }) => {
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
    const accountPage = new MyAccountPage(page);

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
  
    // const qualifiedCasePage = new CasePage(page);
    // await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    // await qualifiedCasePage.startQualification();
    // await qualifiedCasePage.fillDetailsForLoggedInUser(testData.dropdownSelection_yes, testData.phone);
    // await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    // await page.waitForTimeout(2000);
    // await qualifiedCasePage.submitForm();
    // await qualifiedCasePage.verifySuccessMessage();
    // await qualifiedCasePage.closeClaim();
    await accountPage.goToMyAccount();
    await accountPage.validateMyAccountSections();
    await accountPage.validatePersonalDetails(create_data.fname,create_data.lname);
    await accountPage.clickAddressDetails();
    await accountPage.validateAddressDetailSection();
    await accountPage.clickEditAddressButton();
    await accountPage.addNewAddress();
    await accountPage.clickPhoneNumber();
    await accountPage.validatePhoneNumberSection();
    await accountPage.addPhoneNumber();
    await accountPage.clickEmailAddress();
    await accountPage.validateEmailAddress(testEmail);
    await accountPage.addNewEmail(new_email);
    await mailinator.gotoLoginPage();
    await mailinator.searchEmail(new_email);
    await mailinator.openOTPEmail();
    const otp2 = await mailinator.extractOTPFromIframe();
    await accountPage.goToMyAccountLink();
    await accountPage.clickEmailAddress();
    await accountPage.addNewEmail(new_email);
    await accountPage.submitOTP(otp2);
    console.log(`Extracted OTP: ${otp2}`);
    await accountPage.validateUpdatedEmailText();
    await accountPage.clickNotificationPreferences();
    await accountPage.validateNotificationPreferences();
    await accountPage.validateNotificationPreferencesCheck();
    await accountPage.validateCommunicationPreferences();
    await accountPage.validateEditFeatureOfNotifications();
    await accountPage.validateEmailCannotBeUnchecked();

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