import { expect } from '@playwright/test';
import fs from 'fs';
import { saveAs } from 'file-saver';
const path = require('path');
const AdmZip = require('adm-zip');

export class AdminPage {
  constructor(page) {
    this.page = page;

    // **Locators**
    this.loginWithADButton = page.getByRole('button', { name: 'Login with AD' });
    this.emailField = page.getByRole('textbox', { name: 'Enter your email, phone, or' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.passwordField = page.getByRole('textbox', { name: 'Enter the password for' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.dontShowAgainCheckbox = page.getByRole('checkbox', { name: 'Don\'t show this again' });
    this.yesButton = page.getByRole('button', { name: 'Yes' });
    this.okAgreeButton = page.getByRole('button', { name: 'Ok, I Agree' });

    this.caseDetailsButton = page.getByRole('button', { name: 'Case Details' });
    this.claimantsLink = page.getByRole('link', { name: 'Claimants' });
    this.claimantEmailField = page.getByTestId('Email');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.caseNumberButton = page.locator('.caseName button');

    this.tagInputField = this.page.locator('input[placeholder="Choose tags..."].k-input-inner');
    this.searchButton = this.page.locator('#search-button');
    this.claimantListWrapper = this.page.locator('.claimant-list-wrapper');

    this.caseCheckbox = page.locator('input.k-checkbox');
    this.documentsTab = page.getByRole('tab', { name: 'Documents'});
    this.documentsDownloadButton = page.locator('button.k-button.viewicon.error:has(div.btn-for-base-icon[title="Download"])');
    
    this.eSignaturesTab = page.getByRole('tab', { name: 'eSignatures' });
    this.automationCaseReleaseSignDownload = page.locator("button.k-button.viewicon.error:has(.btn-for-base-icon)").nth(0);
    this.acaDownloadButton = page.locator("button.k-button.viewicon.error:has(.btn-for-base-icon)").nth(1);

    this.internalFilesTab = page.getByRole('tab', { name: 'Internal Files' });
    this.uploadFileButton = page.locator('button:has-text("Upload Internal File")').nth(0);
    this.documentName = page.locator('[data-testid="DocumentName"]');
    this.browseFilesButton = page.getByText('Click to browse');
    this.fileUploadButton = page.locator('span.k-button-text:has-text("Upload Internal File")');

    // **Download Directories**
    this.zipDir = path.join(process.cwd(), 'downloads');
    this.releaseDocDir = path.join(process.cwd(), 'release-document');
    this.acaDocDir = path.join(process.cwd(), 'aca-document');
  }

  async navigateToLogin() {
    await this.page.goto(process.env.LANTERN_ADMIN_URL);
    await this.loginWithADButton.click();
  }

  async login(email, password) {
    await this.emailField.fill(email);
    await this.nextButton.click();
    await this.passwordField.fill(password);
    await this.signInButton.click();
    await this.dontShowAgainCheckbox.check();
    await this.yesButton.click();
    await this.okAgreeButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.okAgreeButton.click();
  }

  async openCaseDetails() {
    await this.caseDetailsButton.click();
  }

  async selectTagAndFillEmail() {
    await this.claimantsLink.click();
    const adminData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
    const tags = adminData.Tags.slice(0, 3);

    for (const tag of tags) {
      let emailFile = '';
      if (tag === 'disqualified_7251390') {
        emailFile = 'disqualification-email.txt';
      } else if (tag === 'qualified_7251390' || tag === 'ACAsigned_7251390') {
        emailFile = 'test-email.txt';
      } else {
        continue;
      }

      const email = fs.readFileSync(emailFile, 'utf8').trim();
      // // await this.tagInputField.waitFor({ state: 'visible', timeout: 10000 });

      // await this.tagInputField.click();
      // await this.tagInputField.type('disqualified');
      
      // await this.page.getByRole('option', { name: tag }).click();
      await this.page.waitForTimeout(10000);
      await this.page.getByRole('combobox', { name: 'Choose tags...' }).click();
      //await this.page.getByRole('combobox', { name: 'Choose tags...' }).type('disqualified_7251');
      await this.page.getByRole('group').filter({ hasText: 'Tags' }).getByRole('combobox').type('disqualified_7251390');
      await this.page.getByRole('option', { name: '​disqualified_7251390' }).click();
      await this.searchButton.click();
      await expect(this.claimantListWrapper).toContainText(email);
      console.log(`✔ Verified email ${email} for tag ${tag}`);
    }
    await this.page.reload();
  }

  async searchClaimant(email) {
    await this.claimantEmailField.fill(email);
    await this.searchButton.click();
    await this.page.waitForTimeout(20000);

    // Locate the row that contains the "Validated" status
    const validatedRow = this.page.locator("//tr[td[text()='Validated']]");
    
    if (await validatedRow.isVisible()) {
        console.log("✅ 'Validated' status found.");
        await this.caseNumberButton.last().click();
        await this.page.waitForTimeout(20000);
    }
  }

  async verifyQuestionnaireDetails(caseName){
      const myAccountData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
      const expectedCaseDetails = {
        caseName: myAccountData.Case_name,
        workflowName: myAccountData.Workflow_name,
        workflowItemName: myAccountData.Workflow_item_name,
        statusList: myAccountData.Status
      };

      const caseRow = this.page.locator(`tr.k-table-row:has(td.filter-text:has-text("${expectedCaseDetails.caseName}"))`);
      await this.page.locator(`tr:has-text("${caseName}")`).waitFor({ state: 'visible', timeout: 20000 });
      await this.caseCheckbox.nth(1).click();
    
      await expect(caseRow.locator('td.filter-text').nth(0)).toHaveText(expectedCaseDetails.caseName);
      console.log(`✔ Case Name '${expectedCaseDetails.caseName}' is displayed.`);
    
      await expect(caseRow.locator('td.filter-text').nth(1)).toHaveText(expectedCaseDetails.workflowName);
      console.log(`✔ Workflow Name '${expectedCaseDetails.workflowName}' is displayed.`);
    
      await expect(caseRow.locator('td.filter-text').nth(2)).toHaveText(expectedCaseDetails.workflowItemName);
      console.log(`✔ Workflow Item Name '${expectedCaseDetails.workflowItemName}' is displayed.`);
    
      let statusFound = false;
      for (const status of expectedCaseDetails.statusList) {
        const statusLocator = caseRow.locator(`td.status-column:has-text("${status}")`);
        if (await statusLocator.count() > 0) {
          console.log(`✔ Status '${status}' is displayed.`);
          statusFound = true;
          break;
        }
      }
      await expect(statusFound).toBeTruthy(); // Ensure at least one status is found
    }

  async downloadAndVerifyZip() {
    await this.documentsTab.click();

    // **Download ZIP file**
    const zipDownloadPromise = this.page.waitForEvent('download');
    await this.documentsDownloadButton.click();
    const zipDownload = await zipDownloadPromise;
    
    const zipPath = path.join(this.zipDir, 'Automation_Case_Support.zip');
    await zipDownload.saveAs(zipPath);

    // **Verify ZIP contents**
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries().map(entry => entry.entryName);

    console.log(`✔ Extracted Files:`, zipEntries);

    const hasPDF = zipEntries.some(file => file.endsWith('.pdf'));
    const hasDOCX = zipEntries.some(file => file.endsWith('.docx'));
    const hasPNG = zipEntries.some(file => file.endsWith('.png'));

    console.log(hasPDF ? "✔ PDF file found ✅" : "❌ PDF file missing ❌");
    console.log(hasDOCX ? "✔ DOCX file found ✅" : "❌ DOCX file missing ❌");
    console.log(hasPNG ? "✔ PNG file found ✅" : "❌ PNG file missing ❌");

    expect(hasPDF).toBe(true);
    expect(hasDOCX).toBe(true);
    expect(hasPNG).toBe(true);
  }

  async downloadReleaseAndACADocuments() {
    await this.eSignaturesTab.click();

    // **Download Release Document**
    const releaseDownloadPromise = this.page.waitForEvent('download'); // Wait for download event
    await this.automationCaseReleaseSignDownload.isVisible()
    await this.automationCaseReleaseSignDownload.click();

    const releaseDownload = await releaseDownloadPromise;
    const releasePath = path.join(this.releaseDocDir, 'admin_release_agreement.pdf');
    await releaseDownload.saveAs(releasePath);
    console.log(`✅ Release Document saved at: ${releasePath}`);

    // **Download ACA Document**
    const acaDownloadPromise = this.page.waitForEvent('download'); // Wait for download event
    await this.acaDownloadButton.isVisible()
    await this.acaDownloadButton.click();

    const acaDownload = await acaDownloadPromise;
    const acaPath = path.join(this.acaDocDir, 'admin_aca_agreement.pdf');
    await acaDownload.saveAs(acaPath);
    console.log(`✅ ACA Document saved at: ${acaPath}`);

    // **Return the file paths**
    return { releasePath, acaPath };
  }
  
  async uploadInternalFile(fileName) {
  const files = [
      path.resolve(process.cwd(), 'uploads', 'document.pdf')
  ];
  await this.internalFilesTab.click();
  await this.uploadFileButton.click();
  await this.documentName.fill(fileName);

  // **Handle file upload**
  const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.browseFilesButton.click()
  ]);
  await fileChooser.setFiles(files);

  await this.page.getByTestId('modalSubmitButton').click();
  console.log("✅ File uploaded");
}
}