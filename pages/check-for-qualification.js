import { expect } from '@playwright/test';
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
    this.dropdown1 = page.locator('.choices__item > span');
    this.dropdown2 = page.locator('choices form-group formio-choices');

    //this.dropdown3 = page.locator('l-emev3h6-areYou18OrOlder');
    //this.dropdown3 = page.locator('(//span[text()="Yes"])[3]');
    
    this.selectyes = page.getByRole('option', { name: 'Yes' }).locator('span');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name *' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name *' });
    this.nextButton = page.getByRole('button', { name: 'Next button' });
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone Number *' });
    this.addressInput = page.getByRole('textbox', { name: 'autocomplete' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async navigateToHomePage() {
    await this.page.goto('https://qa-fe.lks-eng.com/');
  }

  async closeCookieBanner() {
    await expect(this.cookieBanner).toBeVisible({ timeout: 5000 });
    await this.cookieBanner.click();
    await this.closeButton.click();
  }

  async searchAndOpenCase(caseName) {
    await expect(this.exploreCasesLink).toBeVisible();
    await this.exploreCasesLink.click();
    await expect(this.searchBox).toBeVisible();
    await this.searchBox.type(caseName);
    await this.firstCaseLink.click();
  }

  async startQualification() {
    await expect(this.viewCaseButton).toBeVisible();
    await this.viewCaseButton.click();
    await expect(this.getStartedButton).toBeVisible();
    await this.getStartedButton.click();
  }

  async fillPersonalDetails(firstName, lastName) {
    await this.dropdown1.first().click();
    await this.selectyes.click();

    await this.dropdown2.nth(1).click();
    await this.selectyes.click();

    await this.dropdown3.click();
    await this.selectyes.click();

    // Fill in the first name and last name
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.nextButton.click();
  }

  async fillContactInfo(email, phone) {
    await this.emailInput.fill(email);
    await this.page.getByText('Select CodeSelect CodeRemove').click();
    await this.page.getByText('+1', { exact: true }).click();
    await this.phoneInput.fill(phone);
    await this.nextButton.click();
  }

  async fillAddress(address, autosuggestadd, addressline1, city, zip) {
    await this.addressInput.click();
    await this.addressInput.type(address, { delay: 100 });

    // **Logging the test data manually (as requested)**
    console.log("Loaded testData:", testData);
    console.log("Autosuggest Address:", testData.autosuggestadd);

    const addressSuggestion = this.page.getByText(autosuggestadd);
    await addressSuggestion.waitFor({ state: 'visible', timeout: 5000 });
    await addressSuggestion.click();

    await this.page.getByRole('textbox', { name: 'AddressLine 1 *' }).fill(addressline1);
    await this.page.getByRole('textbox', { name: 'City *' }).fill(city);
    await this.page.getByRole('textbox', { name: 'Zip Code *' }).fill(zip);
  }

  async submitForm() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitButton.click();
  }

  async verifySuccessMessage() {
    await expect(this.page.locator('div').filter({ hasText: 'Continue to e-sign agreement' })).toBeVisible();
    console.log("Passed");
  }
}

// **Disqualified Case Page**
export class DisqualifiedCasePage extends CasePage {
  constructor(page) {
    super(page);

    this.disqualificationMessage = page.getByText('Unfortunately, you do not qualify for this claim');
  }

  async verifyDisqualificationMessage() {
    await expect(this.page.locator('div').filter({ hasText: 'Unfortunately, you do not qualify for this claim' })).toBeVisible();
    await expect(this.disqualificationMessage).toBeVisible({ timeout: 10000 });
    console.log("Disqualification Passed");
  }
}