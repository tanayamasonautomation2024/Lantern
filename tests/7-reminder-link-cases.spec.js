import { test, expect, chromium } from '@playwright/test';
import { ConnectToDBPage } from '../pages/reminder-link.js';
import { CasePage } from '../pages/check-for-qualification.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import accData from '../test_data/my_account.json' assert { type: 'json' };
import testData from '../test_data/qualification_case_details.json';
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf.js';
import { UploadPDF } from '../pages/upload-document.js';
import { LoginPage } from '../pages/login-page.js';
import { MailinatorPage } from '../pages/mailinator-page.js';
import { MyAccountPage } from '../pages/my-account-page.js';
import esign_data from '../test_data/agreement_details.json';
import { AdditionalHarmPage } from '../pages/additional-forms-page.js';
import additional_details from '../test_data/additional_form.json';
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
  test.setTimeout(2000000);

  test.beforeAll(async () => {
    test.setTimeout(1200000);
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
      await qualifiedCasePage.qualifierQuestion(testData.option1);

      // Fill survey details (Page 1)
      await qualifiedCasePage.fillSurvey(testData.DOBday, testData.DOBmonth, testData.DOByear);
      await qualifiedCasePage.NextButton();
      // Store the email in the shared variable
      sharedEmail = await qualifiedCasePage.fillContactDetailsGuestUser(testData.firstName, testData.lastName, testData.phone);
      await qualifiedCasePage.NextButton();

      // Fill address details (Page 3)
      await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1,testData.addresslin2, testData.addresline3, testData.city, testData.zip);

      // Fill additional Instagram details
      await qualifiedCasePage.fillAdditionalDetails(testData.createdMonth, testData.CreatedYear, testData.endMonth, testData.endYear);
      await qualifiedCasePage.submitForm();
      await qualifiedCasePage.verifySuccessMessage();

      console.log(sharedEmail);

    } catch (error) {
      console.error("An error occurred in test.beforeAll:", error);
    }
  });

  test('Connect To DB - Fetch Token and generate the Reminder link- esign and fill Basic forms', async () => {
    const db = new ConnectToDBPage(page);
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
    const uploadDocument = new UploadPDF(page);
    const additionalform = new AdditionalHarmPage(page);

    // Log the email to ensure it's stored correctly

    const token = await db.connectToDB(sharedEmail);
    reminder_link = await db.generateReminderLink(token);
    await page.goto(reminder_link);
    await qualifiedCasePage.closeCookieBanner();
    await page.waitForTimeout(2000);
    await db.esignFromReminderLink(esign_data.birthYear, esign_data.birthMonth, esign_data.birthDay,
      esign_data.ssn, esign_data.patientAddress, esign_data.healthProvider, esign_data.healthProviderAddress,
      esign_data.start_year, esign_data.start_month, esign_data.start_day, esign_data.end_year, esign_data.end_month,
      esign_data.end_day, esign_data.otherCondition, esign_data.initials, esign_data.doctor_name, esign_data.expiry_year,
      esign_data.expiry_month, esign_data.expiry_day, esign_data.signer_name, esign_data.authorized_representative);
    await db.clickNextButton();
    await additionalform.fillBasicClaimDetailForm();
    console.log('🎯 Basic Instagram Claim Details filled');

  });

  test('Fill Harm forms 1', async () => {
    const db = new ConnectToDBPage(page);
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
    const uploadDocument = new UploadPDF(page);
    const additionalform = new AdditionalHarmPage(page);
    await page.goto(reminder_link);
    await qualifiedCasePage.closeCookieBanner();
    await page.waitForTimeout(2000);
    await additionalform.clickNextAfterSubmit();
    // Instagram Additional Harm Form 1
    await additionalform.form1Page1(additional_details.harm1_options);
    await additionalform.clickNextButton();
    // Page 2
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page2 filled successfully!');
    await additionalform.clickNextButton();
    // Page 3
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page3 filled successfully!');
    await additionalform.clickNextButton();
    // Page 4
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page4 filled successfully!');
    await additionalform.clickNextButton();
    // Page 5
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page5 filled successfully!');
    await additionalform.clickNextButton();
    //Page 6
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page6 filled successfully!');
    await additionalform.clickNextButton();
    //Page 7
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page7 filled successfully!');
    await additionalform.clickNextButton();
    //Page 8
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.fillYesNoQuestions(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page8 filled successfully!');
    await additionalform.clickNextButton();
    // Page 9
    await additionalform.fillDate(additional_details.start_month, additional_details.start_year);
    await additionalform.page9(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.physicianTextbox, additional_details.physician_name);
    await additionalform.fillTextBox(additional_details.pharmacyTextbox, additional_details.pharmacy_name);
    // await additionalform.fillTextBox(additional_details.hospitalTextbox, additional_details.hospital_name);
    await additionalform.fillAddress(additional_details.address);
    console.log('🎯 Page9 filled successfully!');
    await page.waitForTimeout(3000);
    await additionalform.clickSubmitButton();
    console.log('🎯 Instagram Additional Harm Form 1 filled!');

  });
  test('Fill Harm form 2 and additional damage form', async () => {
    const db = new ConnectToDBPage(page);
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
    const uploadDocument = new UploadPDF(page);
    const additionalform = new AdditionalHarmPage(page);
    await page.goto(reminder_link);
    await qualifiedCasePage.closeCookieBanner();
    await page.waitForTimeout(2000);
    //await additionalform.clickNextAfterSubmit();
    await additionalform.clickNextAfterSubmit();
    // Instagram Additional Harm Form 2
    await additionalform.form2Page1(additional_details.harm2_options);
    await additionalform.clickNextButton();
    // Page2
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page2 filled successfully!');
    await additionalform.clickNextButton();
    // Page3
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page3 filled successfully!');
    await additionalform.clickNextButton();
    // Page 4
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page4 filled successfully!');
    await additionalform.clickNextButton();
    // Page 5
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page5 filled successfully!');
    await additionalform.clickNextButton();
    // Page 6
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page6 filled successfully!');
    await additionalform.clickNextButton();
    // Page 7
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page7 filled successfully!');
    await additionalform.clickNextButton();
    // // Page 8
    await additionalform.fillTextBox(additional_details.crimeTextbox, additional_details.crime);
    await additionalform.fillTextBox(additional_details.dateTextbox, additional_details.date_occured);
    await additionalform.addtionalForm2yesorno(additional_details.select_yes);
    await additionalform.fillTextBox(additional_details.organizationTextbox, additional_details.organization_name);
    await additionalform.fillTextBox(additional_details.resolutionTextbox, additional_details.resolutionAns);
    console.log('🎯 Form 2 page8 filled successfully!');
    await page.waitForTimeout(4000);
    await additionalform.clickSubmitButton();
    console.log('🎯 Instagram Additional Harm Form 2 filled!');
    await additionalform.clickNextAfterSubmit();
    // Additional Damages Form
    await additionalform.fillAdditionalDamagesForm();
    await additionalform.clickSubmitButton();
    await additionalform.clickNextAfterSubmit();
    console.log('🎯 Additional Damages Form filled!');

  });


  test('Download the documents filled using reminder link and verify - Upload documents', async () => {
    await page.goto(reminder_link);
    const loginPage = new LoginPage(page);
    const db = new ConnectToDBPage(page);
    const uploadDocument = new UploadPDF(page);
    const pdfUtils = new DownloadAndVerifyPDF(page);
    const additionalform = new AdditionalHarmPage(page);
    await loginPage.closeCookieBanner();
    // **Download and Verify ACA Agreement**
    const releasePath = await pdfUtils.downloadSignedReleaseAgreementReminder();
    await pdfUtils.verifyPDF(releasePath);
    await additionalform.clickNextAfterSubmit();
    await uploadDocument.uploadDocuments();
    console.log('🎯 Page 1 document upload successful');
    await uploadDocument.uploadDocuments();
    console.log('🎯 Page 2 document upload successful');
    await uploadDocument.uploadDocuments();
    console.log('🎯 Page 3 document upload successful');


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

    // **Download and Verify ACA Agreement**
    const releasePath = await pdfUtils.downloadSignedReleaseAgreement();
    await pdfUtils.verifyPDF(releasePath);

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
    await accountPage.validatePersonalDetails(accData.firstName, accData.lastName);
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
    testInfo.setTimeout(120000); 
    if (testInfo.status === 'passed') {
      console.log(`Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`Test failed: ${testInfo.title}`);
    }

    // Clear the download folder after each test
    clearDownloadFolder();
  });
});
