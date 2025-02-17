import { test, expect } from '@playwright/test';
import { QualifiedCasePage, DisqualifiedCasePage } from '../pages/checkforqualification';
import testData from '../test_data/case_details.json' assert { type: 'json' };

test.describe('Case Qualification Tests', () => {
  test('Qualified Case - Complete Flow', async ({ page }) => {
    const qualifiedCasePage = new QualifiedCasePage(page);

    await qualifiedCasePage.navigateToHomePage();
    await qualifiedCasePage.closeCookieBanner();
    await qualifiedCasePage.searchAndOpenCase(testData.caseName);
    await qualifiedCasePage.startQualification();
    await qualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName);
    await qualifiedCasePage.fillContactInfo(testData.emailforqualified, testData.phone);
    await qualifiedCasePage.fillAddress(testData.address, testData.addressline1, testData.city, testData.zip);
    await qualifiedCasePage.submitForm();
    await qualifiedCasePage.verifyQualificationMessage();
  });

  test('Disqualified Case - Complete Flow', async ({ page }) => {
    const disqualifiedCasePage = new DisqualifiedCasePage(page);

    await disqualifiedCasePage.navigateToHomePage();
    await disqualifiedCasePage.closeCookieBanner();
    await disqualifiedCasePage.searchAndOpenCase(testData.caseName);
    await disqualifiedCasePage.startQualification();
    await disqualifiedCasePage.fillPersonalDetails(testData.firstName, testData.lastName);
    await disqualifiedCasePage.fillContactInfo(testData.emailfordisqualified, testData.phone);
    await disqualifiedCasePage.fillAddress(testData.address, testData.addressline1, testData.city, testData.zip);
    await disqualifiedCasePage.submitForm();
    await disqualifiedCasePage.verifyDisqualificationMessage();
  });
});
