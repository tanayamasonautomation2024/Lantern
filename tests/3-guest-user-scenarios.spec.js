import { test, expect, devices } from '@playwright/test';
import { CasePage } from '../pages/check-for-qualification.js';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
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
    await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName, testData.dropdownSelection_yes);
    email = await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
    await eSignDocumentPage.signAgreementGuest(email);
   // await eSignDocumentPage.signReleaseDocument();
   // await eSignDocumentPage.completeSignReleaseProcess();
  });

test.describe("Admin Scenario", () => {
    test.use({ storageState: './adminUser1.json' });
    test('Admin Scenario', async ({ page }) => {
      await page.goto(process.env.LANTERN_ADMIN_URL);
      await page.waitForTimeout(10000);
    })
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