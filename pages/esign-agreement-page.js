import { CasePage } from './check-for-qualification';
import fs from 'fs';
const path = require('path');

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

    // Signature fields
    this.iframe = page.frameLocator('#agreementDoc'); 
    this.birthYearSelector = this.iframe.locator('.date-input-container').nth(0);
    this.previousButton = this.iframe.getByRole('button').filter({ hasText: /^$/ }).nth(0);
    this.Year = (year) => this.iframe.getByRole('button', { name: year });
    this.Month = (month) => this.iframe.getByRole('button', { name: month });
    this.Day = (day) => this.iframe.getByRole('button', { name: day, exact: true });
    this.ssnField = this.iframe.getByRole('group').filter({ hasText: 'Patient Social Security' }).getByRole('textbox').nth(1);
    this.patientAddressField = this.iframe.getByRole('group').filter({ hasText: 'Patient Address' }).getByRole('textbox').nth(1);
    this.healthProviderName = this.iframe.getByRole('group').filter({ hasText: 'Name of health provider' }).getByRole('textbox').nth(1);
    this.healthProviderAddress = this.iframe.getByRole('group').filter({ hasText: 'Address of health provider' }).getByRole('textbox').nth(1);
    this.StartDateContainer = this.iframe.locator('.date-input-container').nth(1);
    this.endDateContainer = this.iframe.locator('.date-input-container').nth(2);
    this.otherConditionField = this.iframe.getByRole('group').filter({ hasText: /^Other$/ }).getByRole('textbox').nth(1);

    // Checkboxes
    this.alcoholDrugCheckbox = this.iframe.getByRole('group').filter({ hasText: 'Alcohol/Drug Treatment' }).getByLabel('');
    this.mentalHealthCheckbox = this.iframe.getByRole('group').filter({ hasText: 'Mental Health Information' }).getByLabel('');
    this.hivCheckbox = this.iframe.getByRole('group').filter({ hasText: 'HIV-Related Information' }).getByLabel('');

    // Signature fields
    this.initialsField = this.iframe.getByRole('group').filter({ hasText: 'By initialing here' }).getByRole('textbox').nth(1);
    this.doctorNameField = this.iframe.getByRole('group').filter({ hasText: 'Name of individual health care provider' }).getByRole('textbox').nth(1);
    this.atRequestCheckbox = this.iframe.getByLabel('', { exact: true }).nth(3);
    this.otherCheckbox = this.iframe.getByLabel('', { exact: true }).nth(4);

    this.expiryDateContainer = this.iframe.locator('.date-input-container').nth(3);
    this.signerName = this.iframe.getByRole('group').filter({ hasText: 'If not the patient, name of person signing form:' }).getByRole('textbox').nth(1);
    this.authorizedRepresentative = this.iframe.getByRole('group').filter({ hasText: 'Authority to sign on behalf of patient' }).getByRole('textbox').nth(1);

    // Confirmation checkbox
    this.signatureField = this.iframe.getByText('Click to add your signature here');
    this.signByTypingRadio = this.iframe.getByRole('radio', { name: 'Sign by typing' });
    this.addSignatureButton = this.iframe.getByText('Add signature');
    this.signDocumentButton = this.iframe.getByText('Sign document');
    this.verifySignDocumentButton = this.iframe.locator('.modal-footer-buttons-container .sign-button');

    this.submitInfoLink = page.getByRole('link', { name: 'Submit Information' });
    this.continueToMyClaimsButton = this.page.locator('a.btn[href="/dashboard/claim"]');
    this.viewCaseDetailButton = this.page.locator('.qualifyBox .btn-action .btn');
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

  async signAgreement(birthYear, birthMonth, birthDay, SSN, patientaddress, healthProvider, healthProviderAddress, 
    startYear, startMonth, startDay, endYear, endMonth, endDay, otherCondition, initials, doctorName, 
    expiryYear, expiryMonth, expiryDay, Signer_Name, Authorized_Representative) {
    await this.continueButton.click();
    await this.page.waitForTimeout(4000);

    // Select birth date dynamically
    await this.birthYearSelector.click();
    await this.Month('Apr').click();
    await this.Year('2025').click();  // Default future year

    // Navigate back to the correct birth year using the left arrow button
    let currentYear = 2025;
    while (currentYear > birthYear) {
        const yearExists = await this.iframe.getByRole('button', { name: birthYear }).isVisible();
        if (yearExists) {
            break; // Stop if the correct year is visible
        }
        await this.previousButton.click();
        currentYear--;
    }

    // Click the correct year, month, and day
    await this.Year(birthYear).click();
    await this.Month(birthMonth).click();
    await this.Day(birthDay).click();

    // Fill in Social Security Number
    await this.ssnField.fill(SSN);
    await this.patientAddressField.fill(patientaddress);

    // Fill in health provider details
    await this.healthProviderName.fill(healthProvider);
    await this.healthProviderAddress.fill(healthProviderAddress);

    // Select start date dynamically
    await this.StartDateContainer.click();
    await this.Month('Apr').click();
    await this.Year('2025').click();  // Default future year

    // Navigate back to the correct birth year using the left arrow button
    while (currentYear > startYear) {
        const yearExists = await this.iframe.getByRole('button', { name: startYear }).isVisible();
        if (yearExists) {
            break; // Stop if the correct year is visible
        }
        await this.previousButton.click();
        currentYear--;
    }
    await this.Year(startYear).click();
    await this.Month(startMonth).click();
    await this.Day(startDay).click();

    // Select end date dynamically
    await this.endDateContainer.click();
    await this.Month('Apr').click();
    await this.Year('2025').click();  // Default future year

    // Navigate back to the correct birth year using the left arrow button
    while (currentYear > endYear) {
        const yearExists = await this.iframe.getByRole('button', { name: endYear }).isVisible();
        if (yearExists) {
            break; // Stop if the correct year is visible
        }
        await this.previousButton.click();
        currentYear--;
    }
    await this.Year(endYear).click();
    await this.Month(endMonth).click();
    await this.Day(endDay).click();

    // Fill in other condition text field
    await this.otherConditionField.fill(otherCondition);

    // Click checkboxes
    await this.alcoholDrugCheckbox.click();
    await this.mentalHealthCheckbox.click();
    await this.hivCheckbox.click();

    // Fill in signature fields
    await this.initialsField.fill(initials);
    await this.doctorNameField.fill(doctorName);
    await this.atRequestCheckbox.click();
    await this.otherCheckbox.click();

    // Fill expiry date
    await this.expiryDateContainer.click();
    await this.Month('Apr').click();
    await this.Year('2025').click();  // Default future year

    // Navigate back to the correct birth year using the left arrow button
    while (currentYear > expiryYear) {
        const yearExists = await this.iframe.getByRole('button', { name: expiryYear }).isVisible();
        if (yearExists) {
            break; // Stop if the correct year is visible
        }
        await this.previousButton.click();
        currentYear--;
    }
    await this.Year(expiryYear).click();
    await this.Month(expiryMonth).click();
    await this.Day(expiryDay).click();
    await this.signerName.fill(Signer_Name);
    await this.authorizedRepresentative.fill(Authorized_Representative);


    // Click confirmation checkbox
    await this.signatureField.click();
    await this.signByTypingRadio.click();
    await this.addSignatureButton.click();
    await this.signDocumentButton.waitFor({ state: 'visible' });
    await this.signDocumentButton.click();
    await this.verifySignDocumentButton.click();

    await this.page.locator('.qualification_Sec').scrollIntoViewIfNeeded();
    await this.viewCaseDetailButton.click();

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

  async submitInfoLinkButton(){
    await this.submitInfoLink.waitFor({ state: 'visible' });
    await this.submitInfoLink.click();
  }

  async clickReleaseButton(){
    await this.releaseButton.waitFor({ state: 'visible' });
    await this.releaseButton.click();
  }

  async signReleaseDocument() {
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
    await this.releaseButton.click();
    await this.openCloseIcon.click();
    await this.viewEsignAgreementButton.click();
    console.log('Sign Release Process Completed Successfully');
}

}