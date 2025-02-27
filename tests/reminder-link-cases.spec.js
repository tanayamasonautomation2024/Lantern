import { test, expect } from '@playwright/test';
import { ConnectToDBPage } from '../pages/reminder-link';
import { CasePage } from '../pages/check-for-qualification';
import { ESignAgreementPage } from '../pages/esign-agreement-page.js';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };

test.describe('Reminder Link Test', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    test.slow();
    try {
      await page.goto(process.env.LANTERN_URL);
      await page.waitForTimeout(3000);

      const qualifiedCasePage = new CasePage(page);

      // await qualifiedCasePage.navigateToHomePage();
      await qualifiedCasePage.closeCookieBanner();
      await qualifiedCasePage.searchAndOpenCase(testData.caseName);
      await qualifiedCasePage.startQualification();
      await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName, testData.dropdownSelection_yes);
     
    } catch (error) {
      // Handle the error here
      console.error("An error occurred in test.beforeEach:", error);
    }
  });

  test('Connect To DB - Fetch Token and generate the Reminder link', async ({ page }) => {
    const db = new ConnectToDBPage(page);
    const qualifiedCasePage = new CasePage(page);
    const eSignDocumentPage = new ESignAgreementPage(page);
      // Store the email in the variable
    const email = await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);

    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
    console.log(email);
    //await page.waitForTimeout(10000);
    // Pass the email to connectToDB method
    const token = await db.connectToDB(email);
    const reminder_link = await db.generateReminderLink(token);
    await page.goto(reminder_link);
    await qualifiedCasePage.closeCookieBanner();
    await db.esignFromReminderLink(email);
    await db.clickNextButton();
    await db.fillCompanyName(email);
    await db.clickSubmit();
    await db.clickNextButton();
  });

  // After each test: log success or failure
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed') {
      console.log(`Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`Test failed: ${testInfo.title}`);
    }
  });
});
