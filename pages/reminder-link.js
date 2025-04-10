import { expect } from '@playwright/test';
import testData from '../test_data/login.json';
import accountData from '../test_data/my_account.json';
import config from '../test_data/db_details.json'; // Import config directly (no need to read via fs)

const sql = require('mssql');


// Class to connect to DB and fetch the claimantToken
export class ConnectToDBPage {
  constructor(page) {
    this.page = page;
    this.nextButton = page.locator('button.next-workflow');
    this.cookieBanner = page.locator('.onetrust-pc-dark-filter');
    this.closeButton = page.getByRole('button', { name: 'Close' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    
    this.birthYearSelector = page.locator('.date-input-container').nth(0);
    this.previousButton = page.getByRole('button').filter({ hasText: /^$/ }).nth(0);
    this.Year = (year) => page.getByRole('button', { name: year });
    this.Month = (month) => page.getByRole('button', { name: month });
    this.Day = (day) => page.getByRole('button', { name: day, exact: true });
    this.ssnField = page.getByRole('group').filter({ hasText: 'Patient Social Security' }).getByRole('textbox').nth(1);
    this.patientAddressField = page.getByRole('group').filter({ hasText: 'Patient Address' }).getByRole('textbox').nth(1);
    this.healthProviderName = page.getByRole('group').filter({ hasText: 'Name of health provider' }).getByRole('textbox').nth(1);
    this.healthProviderAddress = page.getByRole('group').filter({ hasText: 'Address of health provider' }).getByRole('textbox').nth(1);
    this.StartDateContainer = page.locator('.date-input-container').nth(1);
    this.endDateContainer = page.locator('.date-input-container').nth(2);
    this.otherConditionField = page.getByRole('group').filter({ hasText: /^Other$/ }).getByRole('textbox').nth(1);

    // Checkboxes
    this.alcoholDrugCheckbox = page.getByRole('group').filter({ hasText: 'Alcohol/Drug Treatment' }).getByLabel('');
    this.mentalHealthCheckbox = page.getByRole('group').filter({ hasText: 'Mental Health Information' }).getByLabel('');
    this.hivCheckbox = page.getByRole('group').filter({ hasText: 'HIV-Related Information' }).getByLabel('');

    // Signature fields
    this.initialsField = page.getByRole('group').filter({ hasText: 'By initialing here' }).getByRole('textbox').nth(1);
    this.doctorNameField = page.getByRole('group').filter({ hasText: 'Name of individual health care provider' }).getByRole('textbox').nth(1);
    this.atRequestCheckbox = page.getByLabel('', { exact: true }).nth(3);
    this.otherCheckbox = page.getByLabel('', { exact: true }).nth(4);

    this.expiryDateContainer = page.locator('.date-input-container').nth(3);
    this.signerName = page.getByRole('group').filter({ hasText: 'If not the patient, name of person signing form:' }).getByRole('textbox').nth(1);
    this.authorizedRepresentative = page.getByRole('group').filter({ hasText: 'Authority to sign on behalf of patient' }).getByRole('textbox').nth(1);

    // Confirmation checkbox
    this.signatureField = page.getByText('Click to add your signature here');
    this.signByTypingRadio = page.getByRole('radio', { name: 'Sign by typing' });
    this.addSignatureButton = page.getByText('Add signature');
    this.signDocumentButton = page.getByText('Sign document');
    this.verifySignDocumentButton = page.locator('.modal-footer-container .sign-button');

    this.submitInfoLink = page.getByRole('link', { name: 'Submit Information' });
    this.signatureField1 = page.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(0);
    this.signatureField2 = page.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(1);


    this.emailField = page.locator('.email-input-container .email-input .tiptap');

    this.signByTypingRadio = page.getByRole('radio', { name: 'Sign by typing' });
    this.signByTypingRadio2 = page.getByRole('radio', { name: 'Sign by typing' });
    this.fontSelection = page.getByRole('img').filter({ hasText: '/* latin */ @font-face { font' });
    this.addSignatureButton = page.getByRole('button', { name: 'Add signature' });
    this.eSignAgreementButton = page.getByRole('button', { name: 'E-sign Agreement' });
    this.signDocumentButton = page.getByRole('button', { name: 'Sign document' });
    this.verifyClickButton = page.locator('#verify-click').getByRole('button', { name: 'Sign document' });
    this.company_name = page.locator('input[name="data[whatIsYourCompanyName]"]');
    this.viewCaseDetailButton=page.locator('a.btn.outline:has-text("View Case Detail")');
  }

  async viewCaseDetail() {
    await this.viewCaseDetailButton.waitFor({ state: 'visible' });
    await this.viewCaseDetailButton.click();
}

  // Async method to connect to DB and fetch claimantToken
  async connectToDB(email) {
    try {
      // Connect to the database using the loaded configuration
      await sql.connect(config);
      console.log(email);

      // Query to fetch claimantToken from db_CASE.ClaimantToken where the CaseClaimantID matches
      const result = await sql.query`
        SELECT ClaimantToken 
        FROM db_CASE.ClaimantToken 
        WHERE CaseClaimantID in (select CaseClaimantID from db_CASE.CaseClaimant where UserID in(
select UserID  from db_CASE.UserEmailAddress where EmailAddress =${email}))
      `;

      // Check if data was returned
      if (result.recordset.length > 0) {
        // Assuming you want the first record's claimantToken
        const claimantToken = result.recordset[0].ClaimantToken;
        console.log('Claimant Token:', claimantToken);
        return claimantToken;
      } else {
        console.log('No records found.');
        return null;
      }
    } catch (err) {
      console.error('Error while fetching claimant token:', err);
      return null;
    } finally {
      // Close the connection
      await sql.close();
    }
  }

  async generateReminderLink(claimantToken) {
    const reminderLink = accountData.reminderLink;

    // Replace the token placeholder with the actual claimantToken
    const generatedLink = reminderLink.replace(accountData.replace_value, claimantToken);
    console.log(generatedLink);
    return generatedLink;
  }
  async esignFromReminderLink(birthYear, birthMonth, birthDay, SSN, patientaddress, healthProvider, healthProviderAddress, 
    startYear, startMonth, startDay, endYear, endMonth, endDay, otherCondition, initials, doctorName, 
    expiryYear, expiryMonth, expiryDay, Signer_Name, Authorized_Representative) {
  {
    await this.eSignAgreementButton.click();
      await this.page.waitForTimeout(4000);
  
      // Select birth date dynamically
      await this.birthYearSelector.click();
      await this.Month('Apr').click();
      await this.Year('2025').click();  // Default future year
  
      // Navigate back to the correct birth year using the left arrow button
      let currentYear = 2025;
      while (currentYear > birthYear) {
          const yearExists = await this.page.getByRole('button', { name: birthYear }).isVisible();
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
          const yearExists = await this.page.getByRole('button', { name: startYear }).isVisible();
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
          const yearExists = await this.page.getByRole('button', { name: endYear }).isVisible();
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
          const yearExists = await this.page.getByRole('button', { name: expiryYear }).isVisible();
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
  
    await this.signatureField.click();
    await this.signByTypingRadio.click();
    await this.fontSelection.click();
    await this.addSignatureButton.click();

    await this.signDocumentButton.click();
    await this.verifyClickButton.click();
    await (this.cookieBanner).waitFor({ state: 'visible' });
    await this.cookieBanner.click();
    await this.closeButton.click();
    await this.page.locator('.paymentBox.agreementBox').scrollIntoViewIfNeeded();
    // await this.viewClaimButton.click();
    const progressMessage = await this.page.locator('.e-sign-progress-msg');

    // Ensure the button is disabled
    // await expect(button).toHaveAttribute('disabled', ''); // Ensure the button is disabled

    // Ensure the "Your E-sign is in progress" message is visible
    await expect(progressMessage).toBeVisible();
    // Ensure the "Signed" status tag is visible
    await this.page.waitForTimeout(20000);
    const signedStatus = this.page.locator('button.completed .status-tag.complete >> text=Signed');

    // Wait for the "Signed" status to appear
    await (signedStatus).waitFor({ state: 'visible' });
    console.log('E-Signed agreement')

  }
}

  async clickNextButton() {

    // Wait for the "Next" button to be visible and enabled
    await (this.nextButton).waitFor({ state: 'visible' });

    // Optionally, you can check if the button is enabled
    await expect(this.nextButton).not.toBeDisabled();

    // Click the "Next" button
    await this.nextButton.click();
  }

  async fillCompanyName(email) {
    await this.company_name.waitFor({state:'visible'});
    await this.company_name.fill(email);
 }

 async clickSubmit()
 {
  await this.submitButton.waitFor({state:'visible'});
  await this.submitButton.click();
 }

}
