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
    this.claimantsLink = page.getByRole('link', { name: 'Claimants', exact: true });
    this.claimantEmailField = page.getByTestId('Email');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.caseNumberButton = page.locator('.caseName button');

    this.tagInputField = this.page.locator('input[placeholder="Choose tags..."].k-input-inner');
    // this.searchButton = this.page.locator('#search-button');
    this.claimantListWrapper = this.page.locator('.claimant-list-wrapper');

    this.caseCheckbox = page.locator('input.k-checkbox');
    this.documentsTab = page.getByRole('tab', { name: 'Documents'});
    this.documentsDownloadButton = page.locator('button.k-button.viewicon.error:has(div.btn-for-base-icon[title="Download"])');
    
    this.eSignaturesTab = page.getByRole('tab', { name: 'eSignatures' });
    this.automationCaseReleaseSignDownload = page.locator("button.k-button.viewicon.error:has(.btn-for-base-icon)").nth(0);
    this.acaDownloadButton = page.locator("button.k-button.viewicon.error:has(.btn-for-base-icon)");

    this.internalFilesTab = page.getByRole('tab', { name: 'Internal Files' });
    this.uploadFileButton = page.locator('button:has-text("Upload Internal File")').nth(0);
    this.documentName = page.locator('[data-testid="DocumentName"]');
    this.browseFilesButton = page.getByText('Click to browse');
    this.fileUploadButton = page.locator('span.k-button-text:has-text("Upload Internal File")');

    // **Download Directories**
    this.zipDir = path.join(process.cwd(), 'downloads');
    this.releaseDocDir = path.join(process.cwd(), 'release-document');
    this.acaDocDir = path.join(process.cwd(), 'aca-document');

    this.closeButton=page.getByRole('button', { name: 'Cancel' });
  }

  async closeLink(){
  await this.page.waitForTimeout(3000);
  await this.closeButton.click();
}


  async navigateToLogin() {
    await this.page.goto(process.env.LANTERN_ADMIN_URL);
    await this.loginWithADButton.click();
  }

  async login(email, password) {
    await this.emailField.waitFor({state:'visible'});
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

  async selectTagAndFillEmailOld() {
    await this.claimantsLink.click();
    const adminData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
    const tags = adminData.Tags.slice(0, 3);

    for (const tag of tags) {
      let emailFile = '';
      if (tag === 'qualified_7251391') {
        emailFile = 'disqualification-email.txt';
      } else if (tag === 'qualified_7251390' || tag === 'ACAsigned_7251390') {
        emailFile = 'test-email.txt';
      } else {
        emailFile = 'test-email.txt';
      }

      const email = fs.readFileSync(emailFile, 'utf8').trim();
      // // await this.tagInputField.waitFor({ state: 'visible', timeout: 10000 });

      // await this.tagInputField.click();
      // await this.tagInputField.type('disqualified');
      
      // await this.page.getByRole('option', { name: tag }).click();
      await this.page.waitForTimeout(20000);
      //await this.page.getByRole('link', { name: 'Claimants' }).click();
      //await this.page.locator('.lm-content-section > .loaderWrap').click();
      //await this.page.getByRole('combobox', { name: 'Case Name or ID' }).fill('insta');
      //await this.page.getByRole('option', { name: 'Instagram Social Media' }).locator('span').click();
      const comboBox = this.page.getByRole('combobox', { name: 'Choose tags...' });
      await comboBox.scrollIntoViewIfNeeded();
      await comboBox.click();
      await this.page.getByRole('combobox', { name: 'Choose tags...' }).type(tag);
      await this.page.getByRole('option', { name: tag, exact: true }).click();
      await this.searchButton.click();
      await expect(this.claimantListWrapper).toContainText(email);
      console.log(`✔ Verified email ${email} for tag ${tag}`);
    }
    await this.page.reload();
  }

  async selectTagAndFillEmail() {
    await this.claimantsLink.click();
    const adminData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
    const tags = adminData.Tags;
  
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    const email = fs.readFileSync('test-email.txt', 'utf8').trim();
    await this.page.getByTestId('Email').click();
    await this.page.getByTestId('Email').type(email);
  
    const comboBox = this.page.getByRole('combobox', { name: 'Choose tags...' });
    await comboBox.scrollIntoViewIfNeeded();
    await comboBox.click();
    await comboBox.type(randomTag);
    await this.page.getByRole('option', { name: randomTag, exact: true }).click();
  
    await this.searchButton.click();
    await this.page.waitForTimeout(10000);
    await expect(this.claimantListWrapper).toContainText(email);
  
    console.log(`✔ Verified email ${email} for tag ${randomTag}`);
  
    await this.page.reload();
  }  

  async searchClaimant(email) {
    await this.claimantsLink.click();
    await this.claimantEmailField.type(email);
    await this.page.waitForTimeout(2000);
    await this.searchButton.click();
    await this.page.waitForTimeout(20000);

    // Locate the row that contains the "Validated" status
    const validatedRow = this.page.locator("//tr[td[text()='Validated']]").first();
    
    if (await validatedRow.isVisible()) {
        console.log("✅ 'Validated' status found.");
        await this.caseNumberButton.last().click();
        await this.page.waitForTimeout(20000);
    }
  }

  async verifyQuestionnaireDetails(caseName) {
    const myAccountData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));

    const expectedCaseDetails = {
        caseName: myAccountData.Case_name,
        workflowNames: myAccountData.Workflow_names,  
        workflowItemNames: myAccountData.Workflow_item_names,  
        status: myAccountData.Status[0]  // Since only one status exists, always check this
    };

    const caseRows = this.page.locator(`tr.k-table-row:has(td.filter-text:has-text("${expectedCaseDetails.caseName}"))`);
    await this.caseCheckbox.nth(1).click();

    // await expect(caseRows).toHaveCount(5); // Verify that case name appears 3 times
    // console.log(`✔ Case Name '${expectedCaseDetails.caseName}' appears 5 times.`);

    for (let i = 0; i < 5; i++) {
        const caseRow = caseRows.nth(i);
        
        await expect(caseRow.locator('td.filter-text').nth(0)).toHaveText(expectedCaseDetails.caseName);
        console.log(`✔ Case Name '${expectedCaseDetails.caseName}' is displayed.`);

        await expect(caseRow.locator('td.filter-text').nth(1)).toHaveText(expectedCaseDetails.workflowNames[i]);
        console.log(`✔ Workflow Name '${expectedCaseDetails.workflowNames[i]}' is displayed.`);

        await expect(caseRow.locator('td.filter-text').nth(2)).toHaveText(expectedCaseDetails.workflowItemNames[i]);
        console.log(`✔ Workflow Item Name '${expectedCaseDetails.workflowItemNames[i]}' is displayed.`);

        // Check the same status for all rows
        await expect(caseRow.locator('td.status-column')).toHaveText(expectedCaseDetails.status);
        console.log(`✔ Status '${expectedCaseDetails.status}' is displayed.`);
    }
}

async downloadAndVerifyZip() {
  await this.documentsTab.click();

  const downloadButtons = await this.page.locator('button.k-button.viewicon.error:has(div.btn-for-base-icon)').all();

  if (downloadButtons.length === 0) {
    throw new Error("❌ No download buttons found!");
  }

  for (let i = 0; i < downloadButtons.length; i++) {
    console.log(`⬇ Starting download ${i + 1}`);

    const zipDownloadPromise = this.page.waitForEvent('download');
    await downloadButtons[i].click();
    const zipDownload = await zipDownloadPromise;

    const zipPath = path.join(this.zipDir, `Automation_Case_Support_${i + 1}.zip`);
    await zipDownload.saveAs(zipPath);
    await this.page.waitForTimeout(2000);
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries().map(entry => entry.entryName);

    console.log("📂 Extracted Files:", zipEntries);

    const hasPDF = zipEntries.some(file => file.endsWith('.pdf'));
    const hasDOCX = zipEntries.some(file => file.endsWith('.docx'));
    const hasPNG = zipEntries.some(file => file.endsWith('.png'));

    // Conditional validation logic
    // if (i === 2) { // 3rd download
    //   const isDocxContent = zipEntries.some(file => file.includes('word/document.xml'));
    //   console.log(isDocxContent ? "✔ DOCX structure detected ✅" : "❌ DOCX structure missing ❌");
    //   expect(isDocxContent).toBe(true);
    // }    
    // else if (i === 3) { // 4th download
    //   console.log(hasPDF ? "✔ PDF file found ✅" : "❌ PDF file missing ❌");
    //   console.log(hasPNG ? "✔ PNG file found ✅" : "❌ PNG file missing ❌");
    //   expect(hasPDF).toBe(true);
    //   expect(hasPNG).toBe(true);
    // } else {
      // Original logic
      console.log(hasPDF ? "✔ PDF file found ✅" : "❌ PDF file missing ❌");
      console.log(hasDOCX ? "✔ DOCX file found ✅" : "❌ DOCX file missing ❌");
      console.log(hasPNG ? "✔ PNG file found ✅" : "❌ PNG file missing ❌");

      expect(hasPDF).toBe(true);
      expect(hasDOCX).toBe(true);
      expect(hasPNG).toBe(true);
    //}
  }
}

  async downloadACADocuments() {
    await this.eSignaturesTab.click();

    // **Download ACA Document**
    const acaDownloadPromise = this.page.waitForEvent('download'); // Wait for download event
    await this.acaDownloadButton.isVisible()
    await this.acaDownloadButton.click();

    const acaDownload = await acaDownloadPromise;
    const acaPath = path.join(this.acaDocDir, 'admin_aca_agreement.pdf');
    await acaDownload.saveAs(acaPath);
    console.log(`✅ ACA Document saved at: ${acaPath}`);

    // **Return the file paths**
    return {acaPath};
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