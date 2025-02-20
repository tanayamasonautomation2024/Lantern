import { expect } from '@playwright/test';
import testData from '../test_data/login.json';
import accountData from '../test_data/qualification_case_details.json'

export class MyAccountPage {
  constructor(page) {
    this.page = page;
    this.my_account_link=page.getByRole('link', { name: 'My Account' });
    this.personal_details_button=page.getByRole('button', { name: 'Personal Details' });
    this.address_details_button=page.getByRole('button', { name: 'Address Details' });
    this.phone_numbers_button=page.getByRole('button', { name: 'Phone Numbers' });
    this.email_addresses_button=page.getByRole('button', { name: 'Email Addresses' });
    this.notification_preferences_button=page.getByRole('button', { name: 'Notification Preferences' });
    this.login_security_button=page.getByRole('button', { name: 'Login and Security' });

    this.first_name=page.locator('input[name="FirstName"]');
    this.last_name=page.locator('input[name="LastName"]');
    this.edit_button=page.getByRole('button', { name: 'Edit' });
    this.address_header=page.getByRole('heading', { name: 'Address Details' });
    this.cancel_button=page.getByRole('button', { name: 'Cancel' });
    this.save_button=page.getByRole('button', { name: 'Save' });
    this.add_address_button=page.getByRole('button', { name: 'Add Address' });
    this.details_saved_message=page.getByText('Your details have been');
    this.primary_button_new=page.getByText('Primary').nth(1);
   
  }

  async goToMyAccount(){
    await this.page.locator('#header').getByRole('img').nth(1).click();
    await this.my_account_link.click()
  }

  async validateMyAccountSections(){
    await (this.personal_details_button).waitFor({state:'visible'});
    await expect(this.address_details_button).toBeVisible();
    await expect(this.phone_numbers_button).toBeVisible();
    await expect(this.email_addresses_button).toBeVisible();
    await expect(this.notification_preferences_button).toBeVisible();
    await expect(this.login_security_button).toBeVisible();
  }

  async validatePersonalDetails(fname,lname){
    await (this.edit_button).waitFor({state:'visible'});
    // Fetch the values from the input fields
    const firstName = await this.first_name.inputValue();
    const lastName = await this.last_name.inputValue();

    console.log(firstName);
    console.log(lastName);
    // Validate the first name and last name
    expect(firstName).toBe(fname);
    expect(lastName).toBe(lname);
  }

  async clickAddressDetails(){
    await (this.address_details_button).click();
  }

  async validateAddressDetailSection(){
    await (this.address_header).waitFor({state:'visible'});
    await expect(this.edit_button).toBeVisible();

     // Extract the values from each input field
    const streetAddress1 = await this.page.locator('input[name="address\\.0\\.StreetAddress1"]').inputValue();
    const streetAddress2 = await this.page.locator('input[name="address\\.0\\.StreetAddress2"]').inputValue();
    const streetAddress3 = await this.page.locator('input[name="address\\.0\\.StreetAddress3"]').inputValue();
    const zipCode = await this.page.locator('input[name="address\\.0\\.PostCode"]').inputValue();
    const city = await this.page.locator('input[name="address\\.0\\.City"]').inputValue();
    const state = await this.page.locator('input[name="address\\.0\\.State"]').inputValue(); // Note: For state, we are using the field with name 'address.0.State'
    const country = await this.page.locator('input[name="address\\.0\\.Country"]').inputValue();

    // Log the values to the console (optional, for debugging)
    console.log('Street Address 1:', streetAddress1);
    console.log('Street Address 2:', streetAddress2);
    console.log('Street Address 3:', streetAddress3);
    console.log('Zip Code:', zipCode);
    console.log('City:', city);
    console.log('State:', state);
    console.log('Country:', country);

    // Expected values (you would replace these with your own expected values)
   

    // Validate the values
    expect(streetAddress1).toBe(accountData.addressline1);
    expect(streetAddress2).toBe(accountData.expectedStreetAddress2);
    expect(streetAddress3).toBe(accountData.expectedStreetAddress3);
    expect(zipCode).toBe(accountData.zip);
    expect(city).toBe(accountData.city);
    expect(state).toBe(accountData.state);
    expect(country).toBe(accountData.country); // Validate country field
    
  }

  async clickEditAddressButton(){
    await this.edit_button.click();
    await (this.cancel_button).waitFor({state:'visible'});
    await expect(this.save_button).toBeVisible();
    await expect(this.add_address_button).toBeVisible();
  }

  async addNewAddress(){
    await this.add_address_button.click();
    await expect(this.primary_button_new).toBeVisible();
    await this.page.locator('input[name="address\\.1\\.StreetAddress1"]').click();
    await this.page.locator('input[name="address\\.1\\.StreetAddress1"]').fill(accountData.new_street1);
    await this.page.locator('input[name="address\\.1\\.StreetAddress2"]').click();
    await this.page.locator('input[name="address\\.1\\.StreetAddress2"]').fill(accountData.new_street2);
    // await this.page.locator('div').filter({ hasText: /^Country$/ }).click();
    // await this.page.getByRole('listitem').filter({ hasText: /^US$/ }).click();
    await this.page.locator('input[name="address\\.1\\.PostCode"]').click();
    await this.page.locator('input[name="address\\.1\\.PostCode"]').fill(accountData.new_zip);
    await this.primary_button_new.click();
    await this.save_button.click();
    await (this.details_saved_message).waitFor({state:'visible'});
  }









}