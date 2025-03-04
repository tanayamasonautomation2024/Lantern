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
    this.dropdownfield = '.choices.form-group.formio-choices';
    this.disqualificationMessage = page.getByText('Unfortunately, you do not qualify for this claim');
    this.selectyes = page.getByRole('option', { name: 'Yes' }).locator('span');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name *' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name *' });
    this.nextButton = page.getByRole('button', { name: 'Next button' });
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone Number *' });
    this.addressInput = page.getByRole('textbox', { name: 'autocomplete' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
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
    await this.firstCaseLink.click();
  }

  async startQualification() {
    await expect(this.viewCaseButton).toBeVisible();
    await this.viewCaseButton.click();
    await expect(this.getStartedButton).toBeVisible();
    await this.getStartedButton.click();
  }

  async fillPersonalDetails(firstName, lastName,selectOption) {
    await this.page.waitForTimeout(10000);


    // Locate all dropdowns by their class
  const dropdowns = await this.page.$$(this.dropdownfield);  // All dropdowns on the page

  // Loop through each dropdown and interact with them
  for (let dropdown of dropdowns) {
    // Click the dropdown to expand the options
    const dropdownControl = await dropdown.$('.form-control.ui.fluid.selection.dropdown');
    if (dropdownControl) {
      // Scroll the dropdown into view if it's not in the viewport
      await dropdownControl.scrollIntoViewIfNeeded();

      // Click to open the dropdown
      await dropdownControl.click();
    }

    // Wait for the dropdown options to appear
    const optionsList = await dropdown.$('.choices__list--dropdown');
    
    if (optionsList) {
      // Scroll the options list into view
      await optionsList.scrollIntoViewIfNeeded();
      
      // Find the option that matches the selectOption (e.g., "Yes" or "No")
      const option = await optionsList.$(`.choices__item[data-value="${selectOption.toLowerCase()}"]`);
      if (option) {
         // Get the class attribute of the option
         const classAttribute = await option.getAttribute('class');
        
         // Check if the 'is-selected' class is already present
         const isSelected = classAttribute && classAttribute.includes('is-selected');
        if (!isSelected) {
          // Scroll the option into view if needed
          await option.scrollIntoViewIfNeeded();
          
          // Click the option to select it
          await option.click();
        }
      } else {
        console.log(`Option "${selectOption}" not found in the dropdown.`);
      }
    } else {
      console.log('No dropdown options found.');
    }
  }
    // Fill in the first name and last name
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    //await this.nextButton.click();
  }

 

  async fillContactInfo(email, phone) {
    //this.testEmail = `automation${Math.floor(Math.random() * 1000) + 1}@lantern.throwemails.com`;
    const testemail = `automation_qual${Math.floor(Math.random() * 100000) + 1}@lantern.throwemails.com`;
    await this.emailInput.fill(testemail);
    await this.page.getByText('Select CodeSelect CodeRemove').click();
    await this.page.getByText('+1', { exact: true }).click();
    await this.phoneInput.fill(phone);
    return testemail;
  }

  async fillDetailsForLoggedInUser(selectOption, phone){
    await this.page.waitForTimeout(10000);


    // Locate all dropdowns by their class
  const dropdowns = await this.page.$$(this.dropdownfield);  // All dropdowns on the page

  // Loop through each dropdown and interact with them
  for (let dropdown of dropdowns) {
    // Click the dropdown to expand the options
    const dropdownControl = await dropdown.$('.form-control.ui.fluid.selection.dropdown');
    if (dropdownControl) {
      // Scroll the dropdown into view if it's not in the viewport
      await dropdownControl.scrollIntoViewIfNeeded();

      // Click to open the dropdown
      await dropdownControl.click();
    }

    // Wait for the dropdown options to appear
    const optionsList = await dropdown.$('.choices__list--dropdown');
    
    if (optionsList) {
      // Scroll the options list into view
      await optionsList.scrollIntoViewIfNeeded();
      
      // Find the option that matches the selectOption (e.g., "Yes" or "No")
      const option = await optionsList.$(`.choices__item[data-value="${selectOption.toLowerCase()}"]`);
      if (option) {
         // Get the class attribute of the option
         const classAttribute = await option.getAttribute('class');
        
         // Check if the 'is-selected' class is already present
         const isSelected = classAttribute && classAttribute.includes('is-selected');
        if (!isSelected) {
          // Scroll the option into view if needed
          await option.scrollIntoViewIfNeeded();
          
          // Click the option to select it
          await option.click();
        }
      } else {
        console.log(`Option "${selectOption}" not found in the dropdown.`);
      }
    } else {
      console.log('No dropdown options found.');
    }
  }

    await this.page.getByText('Select CodeSelect CodeRemove').click();
    await this.page.getByText('+1', { exact: true }).click();
    await this.phoneInput.fill(phone);
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
    await (this.page.locator('div').filter({ hasText: /^Continue to e-sign agreement$/ })).waitFor({state:'visible'});
    console.log("Passed");
  }




  async verifyDisqualificationMessage() {
   // await expect(this.page.locator('div').filter({ hasText: 'Unfortunately, you do not qualify for this claim' })).toBeVisible();
    await (this.disqualificationMessage).waitFor({state:'visible'});
    console.log("Disqualification Passed");
  }
}