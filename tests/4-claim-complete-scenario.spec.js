import { lanternFixtures } from '../pages/fixtures.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import { CasePage } from '../pages/check-for-qualification.js';
import { MailinatorPage } from '../pages/mailinator-page.js';
import { LoginPage } from '../pages/login-page.js';
import {AdditionalHarmPage} from '../pages/additional-forms-page.js';
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf.js';
import {UploadPDF} from '../pages/upload-document.js';
import testData from '../test_data/qualification_case_details.json';
import additional_details from '../test_data/additional_form.json';
import esign_data from '../test_data/agreement_details.json';
import fs from 'fs';
import path from 'path';
const test = lanternFixtures;

test.describe.serial("Lantern Account Creation, Login, and Claim Scenario", () => {  

    // **Clear the downloads folder only once before any tests run**
    test.beforeAll(() => {
      test.setTimeout(1200000);
       clearDownloadFolder();
      // Launch a shared browser instance
    });
    
  test.setTimeout(1200000);

  // **Test 1: Login and complete e-sign flow**
  test('1. Create new account, complete claim and e-sign agreement', async ({ loggedInPage }) => {
    const eSignDocumentPage = new ESignAgreementPage(loggedInPage);
    const qualifiedCasePage = new CasePage(loggedInPage);
    console.log('Continuing with logged-in session for e-sign flow.');

    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.qualifierQuestion(testData.option1);
   
    // Fill survey details (Page 1)
    await qualifiedCasePage.fillSurvey(testData.DOBday, testData.DOBmonth, testData.DOByear);
    await qualifiedCasePage.NextButton();

    // Fill contact details (Page 2)
    await qualifiedCasePage.fillContactDetailsLoggedInUser(testData.phone);
    await qualifiedCasePage.NextButton();

    // Fill address details (Page 3)
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.addresslin2, testData.addresline3, testData.city, testData.zip);
    
    // Fill additional Instagram details
    await qualifiedCasePage.fillAdditionalDetails(testData.createdMonth, testData.CreatedYear, testData.endMonth, testData.endYear);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();

    await eSignDocumentPage.signAgreement(esign_data.birthYear, esign_data.birthMonth, esign_data.birthDay,
      esign_data.ssn, esign_data.patientAddress, esign_data.healthProvider, esign_data.healthProviderAddress,
      esign_data.start_year, esign_data.start_month, esign_data.start_day, esign_data.end_year, esign_data.end_month,
      esign_data.end_day, esign_data.otherCondition, esign_data.initials, esign_data.doctor_name, esign_data.expiry_year,
      esign_data.expiry_month, esign_data.expiry_day, esign_data.signer_name, esign_data.authorized_representative);
    await eSignDocumentPage.logout();
  });

  // **Test 2: Login and sign release form and check data**
  test('2. Login and pod workflow', async ({page}) => {
    const eSignDocumentPage = new ESignAgreementPage(page);
    const mailinator = new MailinatorPage(page);
    const loginPage = new LoginPage(page);
    const additionalform = new AdditionalHarmPage(page);
    const mailnatorPassword = process.env.MAILINATOR_PASSWORD;
    const mailinatorUsername = process.env.MAILINATOR_USERNAME;
    const lanternPassword = process.env.LANTERN_PASSWORD;
    const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();
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
    await eSignDocumentPage.submitInfoLinkButton();

   // Basic Instagram Claim Details
    await additionalform.fillBasicClaimDetailForm();
    console.log('🎯 Basic Instagram Claim Details filled');
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
    console.log('🎯 Additional Damages Form filled!');
})


// **Test 3: Login, download release agreement**
test('3. Download and verify documents - From My claims', async ({ page }) => {
  const mailinator = new MailinatorPage(page);
  const loginPage = new LoginPage(page);
  const pdfUtils = new DownloadAndVerifyPDF(page);
  const eSignDocumentPage = new ESignAgreementPage(page);
  const uploadDocument = new UploadPDF(page);

  const mailinatorPassword = process.env.MAILINATOR_PASSWORD;
  const mailinatorUsername = process.env.MAILINATOR_USERNAME;
  const lanternPassword = process.env.LANTERN_PASSWORD;
  const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();
  console.log(`Logging in with email: ${testEmail}`);

  // **Login Steps**
  await loginPage.goto();
  await loginPage.signin(testEmail, lanternPassword);

  await mailinator.gotoLoginPage();
  await mailinator.login(mailinatorUsername, mailinatorPassword);
  await mailinator.searchEmail(testEmail);
  await mailinator.openOTPEmail();
  const otp = await mailinator.extractOTPFromIframe();
  console.log(`Extracted OTP: ${otp}`);
  await loginPage.submitOTP(otp);

  // **Upload Documents**
  await loginPage.acceptCookieButton();
 // await eSignDocumentPage.submitInfoLinkButton();
  await uploadDocument.viewCaseDetail();
  await uploadDocument.clickClaimDocumentButton();
  await uploadDocument.uploadDocuments();
  console.log('🎯 Page 1 document upload successful');
  await uploadDocument.uploadDocuments();
  console.log('🎯 Page 2 document upload successful');
  await uploadDocument.uploadDocuments();
  console.log('🎯 Page 3 document upload successful');

  // **Download and Verify Signed Release Agreement**
  const releasePath = await pdfUtils.downloadSignedReleaseAgreement();
  await pdfUtils.verifyPDF(releasePath);

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
  testInfo.setTimeout(120000); 
    if (testInfo.status === 'passed') {
      console.log(`Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`Test failed: ${testInfo.title}`);
    }

//     // Clear the download folder after each test
//     clearDownloadFolder();
});
})