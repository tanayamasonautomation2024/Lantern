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
    this.checkbox1 = page.locator('div[role="checkbox"]').nth(0);
    this.checkbox2 = page.locator('div[role="checkbox"]').nth(1);
    this.eSignAgreementButton = page.getByRole('button', { name: 'E-sign Agreement' });

    this.signatureField1 = page.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(0);
    this.signatureField2 = page.locator('div').filter({ hasText: /^Click to add your signature here$/ }).nth(1);


    this.emailField = page.locator('.email-input-container .email-input .tiptap');

    this.signByTypingRadio = page.getByRole('radio', { name: 'Sign by typing' });
    this.signByTypingRadio2 = page.getByRole('radio', { name: 'Sign by typing' });
    this.fontSelection = page.getByRole('img').filter({ hasText: '/* latin */ @font-face { font' });
    this.addSignatureButton = page.getByRole('button', { name: 'Add signature' });

    this.signDocumentButton = page.getByRole('button', { name: 'Sign document' });
    this.verifyClickButton = page.locator('#verify-click').getByRole('button', { name: 'Sign document' });
    this.company_name = page.locator('input[name="data[whatIsYourCompanyName]"]');
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
  async esignFromReminderLink(email) {
    await this.eSignAgreementButton.click();
    await this.checkbox1.waitFor({ state: 'visible' });
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
