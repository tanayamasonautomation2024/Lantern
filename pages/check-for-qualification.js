import { expect } from '@playwright/test';
import fs from 'fs';
import testData from '../test_data/qualification_case_details.json' assert { type: 'json' };

export class CasePage {
  constructor(page) {
    this.page = page;
    this.cookieBanner = page.locator('.onetrust-pc-dark-filter');
    this.closeButton = page.getByRole('button', { name: 'Close' });
    this.exploreCasesLink = page.locator('#header').getByRole('link', { name: 'Explore Cases' });
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.firstCaseLink = page.locator('section').locator('a').first();
    this.viewCaseButton = page.getByRole('link', { name: 'View case' });
    this.getStartedButton = page.getByRole('button', { name: 'Get Started' });

    //page1
    // this.haveCreatedInstagram = page.getByLabel('Have you created an Instagram').locator('label').filter({ hasText: answer });
    // this.haveUsedInstagram = page.getByLabel('Have you used Instagram since').locator('label').filter({ hasText: answer });
    // this.haveExperiencedIssues = page.getByLabel('Have you ever experienced any').locator('label').filter({ hasText: answer });
    this.dobMonth = page.locator('#whatIsYourDateOfBirth-month');
    this.dobDay = page.locator('#whatIsYourDateOfBirth-day');
    this.dobYear = page.locator('#whatIsYourDateOfBirth-year');
    this.depressionCheckbox = page.locator('label').filter({ hasText: 'Depression' });
    this.insomniaCheckbox = page.locator('label').filter({ hasText: 'Insomnia or other sleep' });
    this.eatingDisordersCheckbox = page.locator('label').filter({ hasText: 'Eating disorders' });
    this.treatedByMedical = page.getByLabel('Were you treated by a medical').locator('label').filter({ hasText: 'Yes' });
    this.antiAnxietyMedication = page.getByText('Anti-anxiety medication');
    this.antiDepressantMedication = page.getByText('Anti-depressant medication');
    this.sleepMedication = page.getByText('Sleep medication');
    this.disqualificationMessage = page.getByText('Unfortunately, you do not qualify for this claim');

    this.nextButton = page.getByRole('button', { name: 'Next button. Click to go to' });

    //page2
    this.contactSection = page.locator('section').filter({ hasText: 'Contact' });

    this.firstNameInput = page.getByRole('textbox', { name: 'First Name *' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name *' });
    this.emailInput = page.getByRole('textbox', { name: 'What is the best email' });

    this.emailConfirmationYes = page.getByLabel('Is the email address you just').locator('label').filter({ hasText: 'Yes' });

    this.selectCodeDropdown = page.getByText('Select CodeSelect CodeRemove');
    this.countryCodeUS = page.getByText('+1', { exact: true });

    this.phoneNumberInput = page.getByRole('textbox', { name: 'Phone Number *' });
    this.phoneConfirmationYes = page.getByLabel('Is the phone number you just').locator('label').filter({ hasText: 'Yes' });

    //page3
    this.autocompleteInput = page.getByRole('textbox', { name: 'autocomplete' });
    // this.addressSelection = page.getByText(autosuggestadd);
    this.addressLine1Input = page.getByRole('textbox', { name: 'AddressLine 1 *' });
    this.addressLine3Input = page.getByRole('textbox', { name: 'AddressLine 3' });
    this.cityInput = page.getByRole('textbox', { name: 'City *' });
    this.stateSelection = page.getByText('<span>Illinois</span>IllinoisRemove item');
    this.zipCodeInput = page.getByRole('textbox', { name: 'Zip Code *' });
    this.instagramHandleInput = page.getByRole('textbox', { name: 'Please enter your Instagram' });
    this.changedUsernameYes = page.getByLabel('Have you ever changed your').locator('label').filter({ hasText: 'Yes' });
    this.changedUsernameNo = page.getByLabel('Have you ever changed your').locator('label').filter({ hasText: 'No' });
    this.accountCreationMonth = page.locator('#whenDidYouCreateYourInstagramAccount-month');
    this.accountCreationYear = page.locator('#whenDidYouCreateYourInstagramAccount-year');
    this.stillUsingInstagramYes = page.getByLabel('Do you still use Instagram?').locator('label').filter({ hasText: 'Yes' });
    this.stopUsingMonth = page.locator('#whenDidYouStopUsingInstagram-month');
    this.stopUsingYear = page.locator('#whenDidYouStopUsingInstagram-year');
    this.submitButton = page.getByRole('button', { name: 'Submit button. Click to' });
  }

  async closeCookieBanner() {
    await expect(this.cookieBanner).toBeVisible({ timeout: 5000 });
    await this.cookieBanner.click();
    await this.closeButton.click();
  }

  async closeClaim(){
    await this.closeButton.click();
  }

  async searchAndOpenCase(caseName) {
    await expect(this.exploreCasesLink).toBeVisible();
    await this.exploreCasesLink.click();
    await expect(this.searchBox).toBeVisible();
    await this.searchBox.type(caseName);
    await this.firstCaseLink.waitFor({state:'visible'});
    await this.firstCaseLink.click();
  }

  async startQualification() {
    await expect(this.viewCaseButton).toBeVisible();
    await this.viewCaseButton.click();
    await expect(this.getStartedButton).toBeVisible();
    await this.getStartedButton.click();
  }

  async qualifierQuestion(answer){
    const haveCreatedInstagram = this.page.getByLabel('Have you created an Instagram')
        .locator('label')
        .filter({ hasText: answer });

    const haveUsedInstagram = this.page.getByLabel('Have you used Instagram since')
        .locator('label')
        .filter({ hasText: answer });

    const haveExperiencedIssues = this.page.getByLabel('Have you ever experienced any')
        .locator('label')
        .filter({ hasText: answer });
    await haveCreatedInstagram.waitFor({state:'visible'});
    await haveCreatedInstagram.click();
    await haveUsedInstagram.click();
    await haveExperiencedIssues.click();
  }

  async fillSurvey(DOBday, DOBmonth, DOByear) {
    await this.dobMonth.fill(DOBday);
    await this.dobDay.fill(DOBmonth);
    await this.dobYear.fill(DOByear);
    await this.depressionCheckbox.click();
    await this.insomniaCheckbox.click();
    await this.eatingDisordersCheckbox.click();
    await this.treatedByMedical.click();
    await this.antiAnxietyMedication.click();
    await this.antiDepressantMedication.click();
    await this.sleepMedication.click();
  }

  async NextButton(){
    await this.nextButton.click();
  }

  async fillContactDetails(firstname, lastname, phone) {
    const testemail = `automation_qual${Math.floor(Math.random() * 100000) + 1}@lantern.throwemails.com`;
    // **Write the email to a file**
    const newEmailFilePath = 'qualification-email.txt';
      try {
          fs.writeFileSync(newEmailFilePath, testemail);
          console.log(`Email saved to file: ${newEmailFilePath}`);
        } catch (err) {
          console.error('Error writing email to file:', err);
          throw err;
        }

    await this.contactSection.click();
    await this.firstNameInput.fill(firstname);
    await this.lastNameInput.fill(lastname);
    await this.emailInput.fill(testemail);
    await this.emailConfirmationYes.click();
    await this.selectCodeDropdown.click();
    await this.countryCodeUS.click();
    await this.phoneNumberInput.fill(phone);
    await this.phoneConfirmationYes.click();
    return testemail;
  }

  async fillAddress(address, autosuggestadd, addressline1, addressline3, city, zip) {
    // Fill Address
    await this.autocompleteInput.click();
    await this.autocompleteInput.fill(address);
    await this.page.getByText(autosuggestadd).click();
    await this.addressLine1Input.fill(addressline1);
    await this.addressLine3Input.fill(addressline3);
    await this.cityInput.fill(city);
    await this.zipCodeInput.fill(zip);
  }

  async fillAdditionalDetails(createdmonth, CreatedYear, endMonth, endYear) {
    const emailFilePath = 'test-email.txt';
    let email = '';

    try {
        email = fs.readFileSync(emailFilePath, 'utf-8').trim();
    } catch (err) {
        console.error('Error reading email from file:', err);
        throw err;
    }
    // Extract Instagram username from email
    const emailPrefix = email.split('@')[0];  // Get the part before '@'
    const instaUserName = emailPrefix.replace(/(\d+)/, '_$1'); // Insert '_' before numbers

    // Fill Instagram handle
    await this.instagramHandleInput.fill(instaUserName);
    // Change Username Confirmation
    await this.changedUsernameNo.click();
    // Account Creation Date
    await this.accountCreationMonth.fill(createdmonth);
    await this.accountCreationYear.fill(CreatedYear);
    // Still Using Instagram
    await this.stillUsingInstagramYes.click();
    // Stopped Using Instagram Date
    await this.stopUsingMonth.fill(endMonth);
    await this.stopUsingYear.fill(endYear);
  }

  async submitForm() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitButton.click();
  }

  async verifySuccessMessage() {
    await (this.page.locator('div').filter({ hasText: /^Continue to e-sign agreement$/ })).waitFor({state:'visible'});
    console.log("Passed");
  }

  async verifyDisqualificationMessage() {
    // await expect(this.page.locator('div').filter({ hasText: 'Unfortunately, you do not qualify for this claim' })).toBeVisible();
     await (this.disqualificationMessage).waitFor({state:'visible'});
     console.log("Disqualification Passed");
   }
}