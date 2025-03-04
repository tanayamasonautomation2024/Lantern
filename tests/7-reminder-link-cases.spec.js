import { test, expect, chromium } from '@playwright/test';
import { ConnectToDBPage } from '../pages/reminder-link.js';
import { CasePage } from '../pages/check-for-qualification.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import testData from '../test_data/my_account.json' assert { type: 'json' };
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf.js';
import { UploadPDF } from '../pages/upload-document.js';
import { LoginPage } from '../pages/login-page.js';
import { MailinatorPage } from '../pages/mailinator-page.js';
import { MyAccountPage } from '../pages/my-account-page.js';
import fs from 'fs';
import path from 'path';

const lanternPassword = process.env.LANTERN_PASSWORD;
const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
const mailinatorUsername = process.env.MAILINATOR_USERNAME;

// Declare email variable at the top to be accessible across tests
let sharedEmail = '';
let browser;
let context;
let page;
let reminder_link = '';

test.describe.serial('Reminder Link Test', () => {
  test.setTimeout(300000);

  test.beforeAll(async () => {
    // Clear the download folder before all tests start
    clearDownloadFolder();

    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();

    // Set up initial page actions inside the beforeAll hook
    test.slow();
    try {
      await page.goto(process.env.LANTERN_URL);
      await page.waitForTimeout(3000);

      const qualifiedCasePage = new CasePage(page);
      await qualifiedCasePage.closeCookieBanner();
      await qualifiedCasePage.searchAndOpenCase(testData.caseName);
      await qualifiedCasePage.startQualification();
      await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName, testData.dropdownSelection_yes);
    } catch (error) {
      console.error("An error occurred in test.beforeAll:", error);
    }
  });

  test('Connect To DB - Fetch Token and generate the Reminder link', async () => {
    const db = new ConnectToDBPage(page);
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
    const uploadDocument = new UploadPDF(page);

    // Store the email in the shared variable
    sharedEmail = await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);

    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await page.waitForTimeout(2000);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();

    console.log(sharedEmail); // Log the email to ensure it's stored correctly

    const token = await db.connectToDB(sharedEmail);
    reminder_link = await db.generateReminderLink(token);
    await page.goto(reminder_link);
    await qualifiedCasePage.closeCookieBanner();
    await page.waitForTimeout(2000);
    await db.esignFromReminderLink(sharedEmail);
    await db.clickNextButton();
    await db.fillCompanyName(sharedEmail);
    await db.clickSubmit();

    await db.clickNextButton();
    await uploadDocument.uploadDocuments();

    await db.clickNextButton();
    await eSignDocumentPage.signReleaseDocument();
    await page.waitForTimeout(3000);
  });

  test('Download the documents filled using reminder link and verify', async () => {
    await page.goto(reminder_link);
    const loginPage = new LoginPage(page);
    const db = new ConnectToDBPage(page);
    const pdfUtils = new DownloadAndVerifyPDF(page);
    await loginPage.closeCookieBanner();
    // **Download and Verify ACA Agreement**
    const acaPath = await pdfUtils.downloadACAgreementFromReminderLink();
    await pdfUtils.verifyPDFReminderLink(acaPath, sharedEmail);

   
  });

  test('Reset Password and Login - from My Claim - Download the documents filled using reminder link and verify', async () => {
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);
    const uploadDocument = new UploadPDF(page);
    const pdfUtils = new DownloadAndVerifyPDF(page);
    const db = new ConnectToDBPage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);

    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(sharedEmail); // Use the shared email from the first test
    await mailinator.resetPasswordEmail();
    await loginPage.closeCookieBanner();
    await loginPage.resetPassword(lanternPassword);
    await loginPage.goto();
    await loginPage.signin(sharedEmail, lanternPassword);

    await mailinator.gotoLoginPage();
    await mailinator.searchEmail(sharedEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    await loginPage.submitOTP(otp);

    const accountPage = new MyAccountPage(page);
    await accountPage.goToMyClaim();
    await uploadDocument.viewCaseDetail();
    // **Download and Verify Signed Release Agreement**
    const releasePath = await pdfUtils.downloadSignedReleaseAgreement();
    await pdfUtils.verifyPDFReminderLink(releasePath, sharedEmail);

    // **Download and Verify ACA Agreement**
    const acaPath = await pdfUtils.downloadACAgreement();
    await pdfUtils.verifyPDFReminderLink(acaPath, sharedEmail);

    // **Download and Verify Reference Document Name**
    await pdfUtils.downloadReferenceDocument();
    await eSignDocumentPage.logout();

  });


  test('Login - for the User who has submitted everything through ACA - check My Account', async () => {
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);
    const uploadDocument = new UploadPDF(page);
    const pdfUtils = new DownloadAndVerifyPDF(page);
    const db = new ConnectToDBPage(page);

    
    await loginPage.goto();
    await loginPage.signin(sharedEmail, lanternPassword);

    await mailinator.gotoLoginPage();
   // await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(sharedEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    await loginPage.submitOTP(otp);

    const accountPage = new MyAccountPage(page);
    await accountPage.goToMyAccount();
    await accountPage.validatePersonalDetails(testData.firstName, testData.lastName);
    await accountPage.clickAddressDetails();
    await accountPage.validateAddressDetailSection();
    await accountPage.clickEditAddressButton();
    await accountPage.addNewAddress();
    await accountPage.clickPhoneNumber();
    await accountPage.validatePhoneNumberSection();
    await accountPage.addPhoneNumber();
    await accountPage.clickEmailAddress();
    await accountPage.validateEmailAddress(sharedEmail);
    await accountPage.clickNotificationPreferences();
    await accountPage.validateNotificationPreferences();
    await accountPage.validateNotificationPreferencesCheck();
    await accountPage.validateCommunicationPreferences();
    await accountPage.validateEditFeatureOfNotifications();
    await accountPage.validateEmailCannotBeUnchecked();

  });

  // Function to clear the downloads folder
  const clearDownloadFolder = () => {
    // Directories to clear
    const directoriesToClear = [
      path.join(process.cwd(), 'downloads'),
      path.join(process.cwd(), 'release-document'),
      path.join(process.cwd(), 'aca-document'),
      path.join(process.cwd(), 'reference-document')
    ];

    directoriesToClear.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`🗑 Deleted old file: ${filePath}`);
          }
        });
      } else {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  };


  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed') {
      console.log(`Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`Test failed: ${testInfo.title}`);
    }

    // Clear the download folder after each test
    clearDownloadFolder();
  });
});
