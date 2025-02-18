import { test, expect } from '@playwright/test';
import { CasePage, DisqualifiedCasePage } from '../pages/check-for-qualification';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };

test.describe('Case Qualification Tests', () => {
  test.setTimeout(120000);
  test('Qualified Case - Complete Flow', async ({ page }) => {
    const qualifiedCasePage = new CasePage(page);

    await qualifiedCasePage.navigateToHomePage();
    await qualifiedCasePage.closeCookieBanner();
    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName);
    await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);
    await qualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifySuccessMessage();
  });

  test('Disqualified Case - Complete Flow', async ({ page }) => {
    const disqualifiedCasePage = new DisqualifiedCasePage(page);

    await disqualifiedCasePage.navigateToHomePage();
    await disqualifiedCasePage.closeCookieBanner();
    await disqualifiedCasePage.searchAndOpenCase(testData.caseName);
    await disqualifiedCasePage.startQualification();
    await disqualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName);
    await disqualifiedCasePage.fillContactInfo(testData.emailfordisqualified, testData.phone);
    await disqualifiedCasePage.fillAddress(testData.address, testData.autosuggestadd, testData.addressline1, testData.city, testData.zip);
    await disqualifiedCasePage.submitForm();
    await disqualifiedCasePage.verifyDisqualificationMessage();
  });
});