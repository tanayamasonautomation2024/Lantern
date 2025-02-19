import { expect } from '@playwright/test';
import testData from '../test_data/login.json';

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
    // Fetch the values from the input fields
    const firstName = await this.first_name.inputValue();
    const lastName = await this.last_name.inputValue();


    // Validate the first name and last name
    expect(firstName).toBe(fname);
    expect(lastName).toBe(lname);
  }



}