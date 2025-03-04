import { lanternFixtures } from '../pages/fixtures.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import { CasePage } from '../pages/check-for-qualification.js';
import { MailinatorPage } from '../pages/mailinator-page.js';
import { LoginPage } from '../pages/login-page.js';
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf.js';
import {UploadPDF} from '../pages/upload-document.js';
import testData from '../test_data/qualification_case_details.json';
import fs from 'fs';
import path from 'path';

const test = lanternFixtures;

test.describe.serial("Lantern Account Creation, Login, and Claim Scenario", () => {  

    // **Clear the downloads folder only once before any tests run**
    test.beforeAll(() => {
      clearDownloadFolder();
    });
    
  test.setTimeout(200000);

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
    const pdfUtils = new DownloadAndVerifyPDF(page);
    const uploadDocument = new UploadPDF(page);
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
    await eSignDocumentPage.submitInfoLinkButton();
    //await uploadDocument.viewCaseDetail();
    await uploadDocument.fillCompanyName("email");
    await uploadDocument.clickNextButton();
    await page.waitForTimeout(3000);
    await uploadDocument.clicksupportDocumentButton();
    await uploadDocument.uploadDocuments();
    await eSignDocumentPage.clickReleaseButton();
    await eSignDocumentPage.signReleaseDocument();
    await page.waitForTimeout(3000);
    
});

// **Test 3: Login, download release agreement**
test('Download and verify documents - From My claims', async ({ page }) => {
  const mailinator = new MailinatorPage(page);
  const loginPage = new LoginPage(page);
  const pdfUtils = new DownloadAndVerifyPDF(page);
  const uploadDocument = new UploadPDF(page);

  const mailinatorPassword = process.env.MAILINATOR_PASSWORD;
  const mailinatorUsername = process.env.MAILINATOR_USERNAME;
  const lanternPassword = process.env.LANTERN_PASSWORD;
  const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();
  console.log(`Logging in with email: ${testEmail}`);

  // **Login Steps**
  await loginPage.goto();
  await loginPage.closeCookieBanner();
  await loginPage.signin(testEmail, lanternPassword);

  // **OTP Handling**
  await mailinator.gotoLoginPage();
  await mailinator.login(mailinatorUsername, mailinatorPassword);
  await mailinator.searchEmail(testEmail);
  await mailinator.openOTPEmail();
  const otp = await mailinator.extractOTPFromIframe();
  console.log(`Extracted OTP: ${otp}`);
  await loginPage.submitOTP(otp);

  // **Upload Documents**
  await loginPage.acceptCookieButton();
  await uploadDocument.viewCaseDetail();
  // **Download and Verify Signed Release Agreement**
  const releasePath = await pdfUtils.downloadSignedReleaseAgreement();
  await pdfUtils.verifyPDF(releasePath);

  // **Download and Verify ACA Agreement**
  const acaPath = await pdfUtils.downloadACAgreement();
  await pdfUtils.verifyPDF(acaPath);

  // **Download and Verify Reference Document Name**
  await pdfUtils.downloadReferenceDocument();
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