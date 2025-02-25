import { test, expect } from '@playwright/test';
import { CasePage } from '../pages/check-for-qualification';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };

test.describe.serial('Not-LoggedIn User Scenarios', () => {
  test.setTimeout(150000);

  test.beforeEach(async ({ page }) => {
    test.slow();
    try {
      //await page.goto(process.env.WEB_URL);
      await page.goto(process.env.LANTERN_URL);
      await page.waitForTimeout(3000);
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
    await qualifiedCasePage.closeCookieBanner();
    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName, testData.dropdownSelection_yes);
    const email = await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
    await eSignDocumentPage.signAgreementGuest(email);
   // await eSignDocumentPage.signReleaseDocument();
   // await eSignDocumentPage.completeSignReleaseProcess();
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