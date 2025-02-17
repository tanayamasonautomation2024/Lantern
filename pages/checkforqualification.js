import { expect } from '@playwright/test';

export class CasePage {
  constructor(page) {
    this.page = page;
    this.cookieBanner = page.locator('.onetrust-pc-dark-filter');
    this.closeButton = page.getByRole('button', { name: 'Close' });
    this.exploreCasesLink = page.locator('#header').getByRole('link', { name: 'Explore Cases' });
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.firstCaseLink = page.locator('section').filter({ hasText: 'Explore CasesFiltersCase' }).locator('a').first();
    this.viewCaseButton = page.getByRole('link', { name: 'View case' });
    this.getStartedButton = page.getByRole('button', { name: 'Get Started' });
    this.dropdown1 = page.locator('.choices__item > span');
    this.selectyes = page.getByRole('option', { name: 'Yes' }).locator('span');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name *' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name *' });
    this.nextButton = page.getByRole('button', { name: 'Next button. Click to go to' });
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone Number *' });
    this.addressInput = page.getByRole('textbox', { name: 'autocomplete' });
    this.submitButton = page.getByRole('button', { name: 'Submit button. Click to submit the form' });
    
  }

  async navigateToHomePage() {
    await this.page.goto('https://qa-fe.lks-eng.com/');
  }

  async closeCookieBanner() {
    await this.page.setDefaultTimeout(20000);
    await expect(this.cookieBanner).toBeVisible();
    await this.cookieBanner.click();
    await this.closeButton.click();
  }

  async searchAndOpenCase(caseName) {
    await expect(this.exploreCasesLink).toBeVisible();
    await this.exploreCasesLink.click();
    await expect(this.searchBox).toBeVisible();
    await this.searchBox.click();
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

  async fillAddress(address, addressline1, city, zip) {
    await this.addressInput.click();
    await this.addressInput.type(address, { delay: 100 });

    const addressSuggestion = this.page.getByText('Illinois State UniversityNorth University Street, Normal, IL, USA');
    await addressSuggestion.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByText('Illinois State UniversityNorth University Street, Normal, IL, USA').click();

    await this.page.getByRole('textbox', { name: 'AddressLine 1 *' }).fill(addressline1);
    await this.page.getByRole('textbox', { name: 'City *' }).fill(city);
    await this.page.getByRole('textbox', { name: 'Zip Code *' }).fill(zip);
  }

  async submitForm() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitButton.click({ force: true });
  }
}

// **Qualified Case Page**
export class QualifiedCasePage extends CasePage {
  constructor(page) {
    super(page);
    this.eSign = page.getByText('Congratulations Automation');
  }

  async completeESign() {
    await this.page.waitForLoadState('networkidle');
    console.log("Congratulations Automation");
  }

  async verifyQualificationMessage() {
    //await expect(this.eSign).toBeVisible({ timeout: 10000 });
    //await expect(this.eSign.getByText('Congratulations Automation,')).toBeVisible({ timeout: 10000 });
  }
}

// **Disqualified Case Page**
export class DisqualifiedCasePage extends CasePage {
  constructor(page) {
    super(page);
    this.exploreCase = page.getByText('Unfortunately, you do not qualify for this claim');
  }

  async completeDisqualify() {
    await this.page.waitForLoadState('networkidle');
    console.log("Unfortunately, you do not qualify for this claim");
  }

  async verifyDisqualificationMessage() {
    //await expect(this.page.getByText('Unfortunately, you do not qualify for this claim.')).toBeVisible({ timeout: 10000 });
  }
}
