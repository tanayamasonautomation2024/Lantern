import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/admin';
import { DownloadAndVerifyPDF } from '../pages/download-and-verify-pdf';
import {AdminPageVerifyDetails} from '../pages/admin-verify-details';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

test('Lantern Admin Flow', async ({ page }) => {
  test.setTimeout(1200000);
  const adminPage = new AdminPage(page);
  const pdfVerifier = new DownloadAndVerifyPDF(page);
  const adminverifydetails = new AdminPageVerifyDetails(page);

  const emailFilePath = 'test-email.txt';
  const email = fs.readFileSync(emailFilePath, 'utf8').trim();

  // Navigate to login and authenticate
  await adminPage.navigateToLogin();
  await adminPage.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

  // Open Case Details and Search Claimant
  await adminPage.openCaseDetails();
  // await adminPage.selectTagAndFillEmail();
  await adminPage.searchClaimant(email);

  // Verify Claimant Details
  await adminverifydetails.verifyClaimantDetails();

  // Verify Questionnaire Details
  await adminPage.verifyQuestionnaireDetails(testData.caseName);

  // Download Documents and Signatures
  await adminPage.downloadAndVerifyZip();
  const { acaPath } = await adminPage.downloadACADocuments();
  console.log(`📂 ACA PDF Path: ${acaPath}`);

  const isACAValid = await pdfVerifier.verifyPDF(acaPath);
  expect(isACAValid).toBeTruthy();

  // Upload Internal File
  await adminPage.uploadInternalFile(testData.file_name);

  // Verify Personal information
  await adminverifydetails.verifyPersonalInformation();
  await adminverifydetails.verifyPrimaryIndicators();

  // Handle Notifications
  await adminverifydetails.verifyMarketingAndCommunicationPreferences();
  await adminverifydetails.clearDownloadFolders();
  await adminPage.closeLink();
  await adminPage.selectTagAndFillEmail();
});