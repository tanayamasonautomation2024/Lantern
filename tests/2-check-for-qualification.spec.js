import { test, expect } from '@playwright/test';
import { CasePage } from '../pages/check-for-qualification';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };


test.describe('Case Qualification Tests', () => {
  test.setTimeout(120000);

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
  test('Qualified Case - Complete Flow', async ({ page }) => {
    const qualifiedCasePage = new CasePage(page);
    await qualifiedCasePage.closeCookieBanner();
    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.qualifierQuestion(testData.option1);
   
    // Fill survey details (Page 1)
    await qualifiedCasePage.fillSurvey(testData.DOBday, testData.DOBmonth, testData.DOByear);
    await qualifiedCasePage.NextButton();

    // Fill contact details (Page 2)
    await qualifiedCasePage.fillContactDetails(testData.firstName, testData.lastName, testData.phone);
    await qualifiedCasePage.NextButton();

    // Fill address details (Page 3)
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.addresline3, testData.city, testData.zip);
    
    // Fill additional Instagram details
    await qualifiedCasePage.fillAdditionalDetails(testData.createdMonth, testData.CreatedYear, testData.endMonth, testData.endYear);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
  });

  test('Disqualified Case - Complete Flow', async ({ page }) => {
    const disqualifiedCasePage = new CasePage(page);

   // await disqualifiedCasePage.navigateToHomePage();
    await disqualifiedCasePage.closeCookieBanner();
    await disqualifiedCasePage.searchAndOpenCase(testData.caseName);
    
    await disqualifiedCasePage.startQualification();
    await disqualifiedCasePage.qualifierQuestion(testData.option2);
    // Fill survey details (Page 1)
    await disqualifiedCasePage.fillSurvey(testData.DOBday, testData.DOBmonth, testData.DOByear);
    await disqualifiedCasePage.NextButton();

    // Fill contact details (Page 2)
    await disqualifiedCasePage.fillContactDetails(testData.firstName, testData.lastName, testData.phone);
    await disqualifiedCasePage.NextButton();

    // Fill address details (Page 3)
    await disqualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.addresline3, testData.city, testData.zip);
    
    // Fill additional Instagram details
    await disqualifiedCasePage.fillAdditionalDetails(testData.createdMonth, testData.CreatedYear, testData.endMonth, testData.endYear);
    await disqualifiedCasePage.submitForm();
    await disqualifiedCasePage.verifyDisqualificationMessage();
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