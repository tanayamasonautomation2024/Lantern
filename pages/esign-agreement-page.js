import { CasePage } from './check-for-qualification';

export class ESignAgreementPage extends CasePage {
  constructor(page) {
    super(page); // Inherit everything from CasePage
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
    this.openCloseIcon = this.page.locator('span.open-close-icon');
    this.viewEsignAgreementButton = this.page.locator('button.btn.outline', { hasText: 'View E-sign Agreement' });
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

  async signAgreement(email) {
    await this.continueButton.click();

    await this.checkbox1.click();
    await this.signatureField1.click();
    console.log(`Filling email field with: ${email}`);
    await this.emailField.first().fill(email);

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
    await this.page.locator('.card-box-container').scrollIntoViewIfNeeded();
    await this.viewClaimButton.click();
    await this.page.waitForTimeout(20000);
    console.log('E-Signed agreement')
  }

  async signAgreementGuest(email) {
    await this.continueButton.click();
    await this.checkbox1.waitFor({state:'visible'});
    await this.checkbox1.click();
    await this.signatureField1.click();
    console.log(`Filling email field with: ${email}`);
    await this.emailField.first().fill(email);

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
    await this.page.locator('.card-box-container').scrollIntoViewIfNeeded();
    await this.viewClaimButton.click();
    console.log('E-Signed agreement')
  }

  async esignFromReminderLink(email){
    await this.eSignAgreementButton.click();
    await this.checkbox1.waitFor({state:'visible'});
    await this.checkbox1.click();
    await this.signatureField1.click();
    console.log(`Filling email field with: ${email}`);
    await this.emailField.first().fill(email);

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
    await this.page.locator('.card-box-container').scrollIntoViewIfNeeded();
    await this.viewClaimButton.click();
    const progressMessage = await this.page.locator('.e-sign-progress-msg');
  
    // Ensure the button is disabled
    await expect(button).toHaveAttribute('disabled', ''); // Ensure the button is disabled
    
    // Ensure the "Your E-sign is in progress" message is visible
    await expect(progressMessage).toBeVisible();
     // Ensure the "Signed" status tag is visible
    const signedStatus = this.page.locator('button.completed .status-tag.complete >> text=Signed');
    
    // Wait for the "Signed" status to appear
    await (signedStatus).waitFor({state:'visible'});
    console.log('E-Signed agreement')
  }

  

  async logout(){
    await this.page.locator('#header').getByRole('img').nth(1).click();
    await this.logoutLink.click();
  }

  async signReleaseDocument() {
    await this.submitInfoLink.waitFor({ state: 'visible' });
    await this.submitInfoLink.click();
    await this.releaseButton.click();
    await this.eSignAgreementButton.click();
    await this.showButton.click();

    await this.signatureField3.scrollIntoViewIfNeeded();
    await this.signatureField3.click();
    await this.signByTypingRadio2.click();
    await this.fontSelection2.click();
    await this.addSignatureButton2.click();

    await this.signDocumentModal.waitFor({state:'visible'});
    await this.signDocumentModal.click();
    await this.page.waitForTimeout(5000);
    await this.modalSignDocumentButton.waitFor();
    await this.modalSignDocumentButton.click();
    console.log('Release Document Signed');
  }

  async completeSignReleaseProcess() {
    await this.page.waitForLoadState('networkidle');
    try {
      await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.acceptButton.isVisible()) {
        await this.acceptButton.click();
      }
    } catch (error) {
      console.log('Consent popup not found, continuing...');
    }
    await this.continueToMyClaimsButton.click();
    await this.page.waitForTimeout(20000)
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    try {
      await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.acceptButton.isVisible()) {
        await this.acceptButton.click();
      }
    } catch (error) {
      console.log('Consent popup not found, continuing...');
    }
    await this.viewCaseDetailButton.waitFor({ state: 'visible' });
    await this.viewCaseDetailButton.click();
    await this.releaseButton.click();
    await this.openCloseIcon.click();
    await this.viewEsignAgreementButton.click();
    console.log('Sign Release Process Completed Successfully');
}

}