import { test, expect, devices } from '@playwright/test';
import { CasePage } from '../pages/check-for-qualification.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import esign_data from '../test_data/agreement_details.json';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };

let email='';

test.describe.serial('Not-LoggedIn User Scenarios', () => {
  test.setTimeout(150000);
  // test.use({
  //   ...devices['Desktop Edge'], // Use the predefined "Desktop Edge" configuration
  //   channel: 'msedge',          // Ensure it's using the Microsoft Edge channel
  // });

  test.beforeEach(async ({ page }) => {
    test.slow();
    try {
      //await page.goto(process.env.WEB_URL);
      
      // const homePage = new HomePage(page);
      // await homePage.beTheFirstToKnow();
    } catch (error) {
      // Handle the error here
      console.error("An error occurred in test.beforeEach:", error);
    }

  })
  test('Qualified Case - eSign Agreement', async ({ page }) => {
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
   // await qualifiedCasePage.navigateToHomePage();
    await page.goto(process.env.LANTERN_URL);
    await page.waitForTimeout(3000);
    await qualifiedCasePage.closeCookieBanner();
    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.qualifierQuestion(testData.option1);
   
    // Fill survey details (Page 1)
    await qualifiedCasePage.fillSurvey(testData.DOBday, testData.DOBmonth, testData.DOByear);
    await qualifiedCasePage.NextButton();

    // Fill contact details (Page 2)
    await qualifiedCasePage.fillContactDetailsGuestUser(testData.firstName, testData.lastName, testData.phone);
    await qualifiedCasePage.NextButton();

    // Fill address details (Page 3)
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1,testData.addresslin2, testData.addresline3, testData.city, testData.zip);
    
    // Fill additional Instagram details
    await qualifiedCasePage.fillAdditionalDetails(testData.createdMonth, testData.CreatedYear, testData.endMonth, testData.endYear);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
   await eSignDocumentPage.signAgreement(esign_data.birthYear, esign_data.birthMonth, esign_data.birthDay,
         esign_data.ssn, esign_data.patientAddress, esign_data.healthProvider, esign_data.healthProviderAddress,
         esign_data.start_year, esign_data.start_month, esign_data.start_day, esign_data.end_year, esign_data.end_month,
         esign_data.end_day, esign_data.otherCondition, esign_data.initials, esign_data.doctor_name, esign_data.expiry_year,
         esign_data.expiry_month, esign_data.expiry_day, esign_data.signer_name, esign_data.authorized_representative);
  });

// test.describe("Admin Scenario", () => {
//     test.use({ storageState: './adminUser1.json' });
//     test('Admin Scenario', async ({ page }) => {
//       await page.goto(process.env.LANTERN_ADMIN_URL);
//       await page.waitForTimeout(10000);
//     })
//     });
 
// **After each test: log success or failure**
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'passed') {
    console.log(`Test passed: ${testInfo.title}`);
  } else if (testInfo.status === 'failed') {
    console.log(`Test failed: ${testInfo.title}`);
  }
});
});