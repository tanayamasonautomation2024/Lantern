import { CasePage } from './check-for-qualification';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const loginData = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_data/login.json')));
const { fname, lname } = loginData;
const testEmail = fs.readFileSync('test-email.txt', 'utf-8').trim();

const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

export class ESignAgreementPage extends CasePage {
    constructor(page) {
        super(page);
        this.page = page;

            // **Locators**
    this.my_account_link = page.getByRole('link', { name: 'My Account' });
    this.logoutLink = page.getByRole('button', { name: 'Sign Out' });
    this.acceptButton = page.getByRole('button', { name: 'Accept All' })
    this.dropdownfield = '.choices.form-group.formio-choices';
    this.phoneInput = page.getByRole('textbox', { name: 'Phone Number *' });
    this.continueButton = page.getByRole('button', { name: 'Continue to e-sign agreement' });
    this.agreementFrame = page.locator('#agreementDoc').contentFrame();

    this.checkbox1 = this.agreementFrame.locator('div[role="checkbox"]').nth(0);
    this.checkbox2 = this.agreementFrame.locator('div[role="checkbox"]').nth(1);
    this.signatureField1 = this.agreementFrame.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(0);
    this.signatureField2 = this.agreementFrame.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(1);
    this.emailField = this.agreementFrame.locator('.email-input-container .email-input .tiptap');

    this.signByTypingRadio = this.agreementFrame.getByRole('radio', { name: 'Sign by typing' });
    this.signByTypingRadio2 = page.getByRole('radio', { name: 'Sign by typing' });
    this.fontSelection = this.agreementFrame.getByRole('img').filter({ hasText: '/* latin */ @font-face { font' });
    this.addSignatureButton = this.agreementFrame.getByRole('button', { name: 'Add signature' });

    this.signDocumentButton = this.agreementFrame.getByRole('button', { name: 'Sign document' });
    this.verifyClickButton = this.agreementFrame.locator('#verify-click').getByRole('button', { name: 'Sign document' })

     // **Locators for signReleaseDocument()**
     this.viewClaimButton = page.locator('.qualifyBox').locator('a.btn', { hasText: 'View my claim' });
    this.submitInfoLink = page.locator('.claimBox').getByRole('link', { name: 'Submit Information' })
    this.releaseButton = page.getByRole('button', { name: 'Release 1 required' });
    this.eSignAgreementButton = page.getByRole('button', { name: 'E-sign Agreement' });
    this.showButton = page.getByRole('button', { name: 'Show' });
    this.signatureField3 = page.getByText('Click to add your signature here');
    this.fontSelection2 = page.getByRole('img').filter({ hasText: '/* latin */ @font-face { font' });
    this.addSignatureButton2 = page.getByRole('button', { name: 'Add signature' });
    this.signDocumentModal = page.locator('.signing-bottom-bar').getByRole('button', { name: 'Sign document' });
    this.modalSignDocumentButton = this.page.locator('[data-external="verify-click-sign-button"]'); 

    this.continueToMyClaimsButton = this.page.locator('a.btn[href="/dashboard/claim"]');
    this.viewCaseDetailButton = this.page.locator('a.btn.outline[href^="/dashboard/claim/submit"]');
    this.releaseElement = page.locator('.text .case', { hasText: 'Release' });
    this.defaultButton = 
    this.openCloseIcon = this.page.locator('span.open-close-icon');
    this.viewEsignAgreementButton = this.page.locator('button.btn.outline', { hasText: 'View E-sign Agreement' });
    this.downloadPDFButton = this.page.locator('button#download-pdf');
  }

    async fillPersonalDetails(selectOption) {
      await this.page.waitForTimeout(10000);
      const dropdowns = await this.page.$$(this.dropdownfield);
  
      for (let dropdown of dropdowns) {
        const dropdownControl = await dropdown.$('.form-control.ui.fluid.selection.dropdown');
        if (dropdownControl) {
          await dropdownControl.scrollIntoViewIfNeeded();
          await dropdownControl.click();
        }
  
        const optionsList = await dropdown.$('.choices__list--dropdown');
        if (optionsList) {
          await optionsList.scrollIntoViewIfNeeded();
          const option = await optionsList.$(`.choices__item[data-value="${selectOption.toLowerCase()}"]`);
          if (option) {
            const classAttribute = await option.getAttribute('class');
            const isSelected = classAttribute && classAttribute.includes('is-selected');
            if (!isSelected) {
              await option.scrollIntoViewIfNeeded();
              await option.click();
            }
          }
        }
      }
    }
  
    async fillContactInfo(phoneNumber) {
      await this.page.getByText('Select CodeSelect CodeRemove').click();
      await this.page.getByText('+1', { exact: true }).click();
      await this.phoneInput.fill(phoneNumber);
    }

    async signAgreement() {
        await this.continueButton.click();
        await this.checkbox1.click();
        await this.signatureField1.click();
        await this.emailField.first().fill(testEmail);
        await this.signByTypingRadio.click();
        await this.fontSelection.click();
        await this.addSignatureButton.click();

        await this.checkbox2.click();
        await this.signatureField2.click();
        await this.signByTypingRadio.click();
        await this.fontSelection.click();
        await this.addSignatureButton.click();

        await this.signDocumentButton.click();
        await this.verifyClickButton.click();
        await this.viewClaimButton.click();
        await this.page.waitForTimeout(20000);
        console.log('✅ E-Signed agreement');
    }

    async signReleaseDocument() {
        await this.submitInfoLink.click();
        await this.releaseButton.click();
        await this.eSignAgreementButton.click();
        await this.showButton.click();

        await this.signatureField3.click();
        await this.signByTypingRadio2.click();
        await this.fontSelection2.click();
        await this.addSignatureButton2.click();

        await this.signDocumentModal.click();
        await this.page.waitForTimeout(5000);
        await this.modalSignDocumentButton.click();
        await this.page.waitForTimeout(20000);
        console.log('✅ Release Document Signed');
    }

  async logout(){
    await this.page.locator('#header').getByRole('img').nth(1).click();
    await this.logoutLink.click();
  }
}