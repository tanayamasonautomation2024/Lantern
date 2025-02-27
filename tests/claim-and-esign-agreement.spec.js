import { lanternFixtures } from '../pages/fixtures.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import { CasePage } from '../pages/check-for-qualification.js';
import { MailinatorPage } from '../pages/mailinator-page';
import { LoginPage } from '../pages/login-page';
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf.js';
import testData from '../test_data/qualification_case_details.json';
import fs from 'fs';
import path from 'path';

const test = lanternFixtures;

test.describe.serial("Lantern Account Creation, Login, and Claim Scenario", () => {
  
  // **Clear the downloads folder only once before any tests run**
  test.beforeAll(() => {
    const downloadsDir = path.join(process.cwd(), 'downloads');

    if (fs.existsSync(downloadsDir)) {
      fs.readdirSync(downloadsDir).forEach(file => {
        const filePath = path.join(downloadsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑 Deleted old file: ${filePath}`);
        }
      });
    } else {
      fs.mkdirSync(downloadsDir, { recursive: true });
      console.log('📁 Created downloads folder.');
    }
  });

  test.setTimeout(400000);

  // **Test 1: Login and complete e-sign flow**
  test('Login and complete e-sign agreement', async ({ loggedInPage }) => {
    const eSignDocumentPage = new ESignAgreementPage(loggedInPage);
    const qualifiedCasePage = new CasePage(loggedInPage);
    console.log('Continuing with logged-in session for e-sign flow.');
    const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();

    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await eSignDocumentPage.fillPersonalDetails(testData.dropdownSelection_yes);
    await eSignDocumentPage.fillContactInfo(testData.phone);
    await qualifiedCasePage.fillAddress(
      testData.address, testData.autosuggestadd, 
      testData.addressline1, testData.city, testData.zip
    );
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();

    await eSignDocumentPage.signAgreement(testEmail);
    await eSignDocumentPage.logout();
  });

  // **Test 2: Login, sign release form and check data**
  test('Login and E-sign Release document', async ({ page }) => {
    const eSignDocumentPage = new ESignAgreementPage(page);
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);

    const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
    const mailinatorUsername = process.env.MAILINATOR_USERNAME;
    const lanternPassword = process.env.LANTERN_PASSWORD;
    const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();
    console.log(`Logging in with email: ${testEmail}`);

    await loginPage.goto();
    await loginPage.closeCookieBanner();
    await loginPage.signin(testEmail, lanternPassword);

    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(testEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    await loginPage.submitOTP(otp);
    await eSignDocumentPage.signReleaseDocument();
  });

  // **Test 3: Login, download release agreement**
  test('Download both PDFs and check data', async ({ page }) => {
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);
    const pdfUtils = new DownloadAndVerifyPDF(page);

    const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
    const mailinatorUsername = process.env.MAILINATOR_USERNAME;
    const lanternPassword = process.env.LANTERN_PASSWORD;
    const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();
    console.log(`Logging in with email: ${testEmail}`);

    await loginPage.goto();
    await loginPage.closeCookieBanner();
    await loginPage.signin(testEmail, lanternPassword);

    await mailinator.gotoLoginPage();
    await mailinator.login(mailinatorUsername, mailnatorPassword);
    await mailinator.searchEmail(testEmail);

    await mailinator.openOTPEmail();
    const otp = await mailinator.extractOTPFromIframe();
    console.log(`Extracted OTP: ${otp}`);

    await loginPage.submitOTP(otp);

    const { releasePath, acaPath } = await pdfUtils.downloadEsignedAgreements();

    await pdfUtils.verifyPDF(releasePath, 'Signed Release Agreement', testEmail);
    await pdfUtils.verifyPDF(acaPath, 'ACA Agreement', testEmail);
  });
});
