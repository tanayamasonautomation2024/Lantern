import { expect } from '@playwright/test';
import testData from '../test_data/login.json';
import accountData from '../test_data/my_account.json'



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

    this.phone_numbers_header=page.getByRole('heading', { name: 'Phone Numbers' });
    this.add_phone_number_button=page.getByRole('button', { name: 'Add Phone Number' });
    this.second_phone_number=page.getByText('Phone 2');

    this.add_email_button=page.getByRole('button', { name: 'Add Email Address' });
    this.enter_email_textbox=page.getByRole('textbox', { name: 'Email Address 2' });

    this.notification_preferences_header=page.getByRole('heading', { name: 'Notification Preferences' });
    this.notification_type_header=page.getByRole('heading', { name: 'Notification Type' });
    this.preference_text=page.getByText('PREFERENCE TEXT');
    this.communication_preference_header=page.getByRole('heading', { name: 'Communication Preferences' });
    this.notification_text=page.getByText('NOTIFICATION TEXT');
    this.preference_updated_message=page.getByText('Your preferences have been');

    this.acceptButton = page.locator('#onetrust-accept-btn-handler');
    this.otpInput = page.locator('input[name="otp"]'); 
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.otpPageUrl = '';
   
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
    await this.page.waitForTimeout(2000);
    await this.primary_button_new.click();
    await this.save_button.click();
    await (this.details_saved_message).waitFor({state:'visible'});
  }



async clickPhoneNumber(){
  await this.phone_numbers_button.click();
  await (this.phone_numbers_header).waitFor({state:'visible'});
  await expect(this.edit_button).toBeVisible();
}

async validatePhoneNumberSection(){
  const phoneNumber = await this.page.$eval('input[name="phone.0.ContactNumber"]', el => el.value);
  const phoneType = await this.page.$eval('.select-options .selected-dropdown-item', el => el.textContent.trim());
  console.log(phoneNumber);
  // Validate that the extracted phone number, country, and phone type match the values from the test data
  expect(phoneNumber).toBe(accountData.expected_phone);
  expect(phoneType).toBe(accountData.phoneType);
}

async addPhoneNumber(){
  await this.edit_button.click();
  await expect(this.cancel_button).toBeVisible();
  await expect(this.save_button).toBeVisible();
  await expect(this.add_phone_number_button).toBeVisible();
  await this.add_phone_number_button.click();
  await expect(this.second_phone_number).toBeVisible();
  // await this.page.locator('input[type="tel"]').nth(1).click();
  // await this.page.locator('input[type="tel"]').nth(1).fill(accountData.new_phone);
  await this.page.getByRole('textbox').nth(1).click();
  await this.page.getByRole('textbox').nth(1).fill(accountData.new_phone);
  await this.page.locator('div').filter({ hasText: /^Mobile$/ }).click();
  await this.page.getByRole('listitem').filter({ hasText: 'Mobile' }).click();
  await this.page.waitForTimeout(2000);
  await this.page.getByRole('button', { name: 'Save' }).click();
  await (this.details_saved_message).waitFor({state:'visible'});
}

async clickEmailAddress(){
  await this.email_addresses_button.click();
  await (this.page.getByRole('heading', { name: 'Email Addresses' })).waitFor({state:'visible'});
  
}

async validateEmailAddress(expected_email){
  await expect(this.page.getByText('If you change the primary')).toBeVisible();
  await expect(this.edit_button).toBeVisible();
  await expect(this.page.locator('form')).toContainText(accountData.change_email_text);
   // Extract email address from the email input field
   const emailAddress = await this.page.$eval('input[name="email.0.EmailAddress"]', el => el.value);
   expect(emailAddress).toBe(expected_email); 
}

async addNewEmail(new_email){
  await this.edit_button.click();
  await expect(this.cancel_button).toBeVisible();
  await expect(this.save_button).toBeVisible();
  await expect(this.add_email_button).toBeVisible();  
  await this.add_email_button.click();
  await this.enter_email_textbox.click();
  await this.enter_email_textbox.fill(new_email);
  await this.save_button.click();
  this.otpPageUrl = this.page.url();
  console.log(this.otpPageUrl);
}

async validateUpdatedEmailText(){
  //need to enter the OTP before this message is displayed
  await (this.details_saved_message).waitFor({state:'visible'});
}

async clickNotificationPreferences(){
  await this.notification_preferences_button.click();
  await expect(this.notification_preferences_header).toBeVisible();
  
}

async validateNotificationPreferences(){
  await expect(this.edit_button).toBeVisible();
  await expect(this.notification_type_header).toBeVisible();
  await expect(this.preference_text).toBeVisible();
  await expect(this.page.getByText('Industry Alerts')).toBeVisible();
  await expect(this.page.getByText('Marketing Emails')).toBeVisible();
  await expect(this.page.getByText('Newsletter')).toBeVisible();

  await expect(this.communication_preference_header).toBeVisible();
  await expect(this.notification_text).toBeVisible();
  await expect(this.page.getByText('Email', { exact: true })).toBeVisible();
  await expect(this.page.getByText('SMS')).toBeVisible();
}

async validateNotificationPreferencesCheck() {
  for (const pref of accountData.notificationPreferences) {
    const checkbox = await this.page.$(`input[name="${pref}"]`);
    const label = await this.page.$(`label[for="${pref}"]`);

    // Validate the checkbox is disabled
    expect(await checkbox.isDisabled()).toBe(true, `${pref} should be disabled`);

    // Validate the checkbox is checked (since expected by default in test_data.json)
    expect(await checkbox.isChecked()).toBe(true, `${pref} should be checked by default`);

    // Validate the associated label text
  //  expect(await label.textContent()).toContain(pref, `Label text for ${pref} should be correct`);
  }
}

// Function to check the state of Communication Preferences (disabled and checked)
async validateCommunicationPreferences() {
  for (const pref of accountData.communicationPreferences) {
    const checkbox = await this.page.$(`input[name="${pref}"]`);
    const label = await this.page.$(`label[for="${pref}"]`);

    // Validate the checkbox is disabled
    expect(await checkbox.isDisabled()).toBe(true, `${pref} should be disabled`);

    // Validate the checkbox is checked (since expected by default in test_data.json)
    expect(await checkbox.isChecked()).toBe(true, `${pref} should be checked by default`);

    // Validate the associated label text
   // expect(await label.textContent()).toContain(pref, `Label text for ${pref} should be correct`);
  }
}

async validateEditFeatureOfNotifications() {
  // Click the "Edit" button to start editing
  await this.edit_button.click();
  
  // Wait for the preferences section to be visible before interacting
  await this.page.waitForSelector('.form-row'); // Adjust the selector based on your actual form structure
  
  // Iterate through all editable preferences
  for (const pref of accountData.editablePreferences) {
    // Find the label element containing the checkbox with the correct text
    const label = await this.page.locator('label').filter({ hasText: pref });
    
    // Wait for the label to be visible before interacting
    await label.waitFor({ state: 'visible' });

    if (label) {
      // Locate the checkbox inside the label
    //  const checkbox = await label.locator('input[type="checkbox"]');
      
      // Click the checkbox to toggle it (this should trigger the custom checkmark behavior)
      await label.locator('span').click()
    } else {
      console.error(`Label for checkbox with name "${pref}" not found`);
    }
  }

  // After making changes, click the "Save" button
  await this.save_button.click();
  
  // Wait for the success message to appear
  await this.preference_updated_message.waitFor({ state: 'visible' });
  
  // Validate that the checkboxes are unchecked after saving
  for (const pref of accountData.editablePreferences) {
    const checkbox = await this.page.locator(`input[name="${pref}"]`);
    
    // Ensure the checkbox is unchecked
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      throw new Error(`${pref} checkbox should be unchecked after saving.`);
    }
  }
}


async validateEmailCannotBeUnchecked() {
  // Click on the Edit button to allow the user to edit the preferences
  await this.edit_button.click();

  // Locate the label for the "Email" checkbox
  const label = await this.page.locator('label').filter({ hasText: /^Email$/ });

  // Wait for the label to be visible
  await label.waitFor({ state: 'visible' });

  // Verify if the "Email" checkbox is present and disabled
  const emailCheckbox = await this.page.locator('input[name="Email"]');
  
  // Ensure that the checkbox is disabled (you cannot interact with it)
  const isDisabled = await emailCheckbox.isDisabled();
  if (!isDisabled) {
    throw new Error('The Email checkbox should be disabled and unclickable.');
  }

  // Check if the "Email" checkbox is checked by default
  const isEmailChecked = await emailCheckbox.isChecked();
  if (!isEmailChecked) {
    throw new Error('The Email checkbox should be checked by default.');
  }

  // Save the changes (if any) made during editing
  await this.save_button.click();

  // Wait for the "preference updated" message to appear
  await this.preference_updated_message.waitFor({ state: 'visible' });

  // After saving, ensure the "Email" checkbox is still checked
  const isEmailStillChecked = await emailCheckbox.isChecked();
  if (!isEmailStillChecked) {
    throw new Error('The Email checkbox should remain checked after saving.');
  }

  console.log('Email checkbox is correctly checked, disabled, and cannot be unchecked.');
}


async goToMyAccountLink(){
  await this.page.goto(this.otpPageUrl);
  try {
    await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    if (await this.acceptButton.isVisible()) {
      await this.acceptButton.click();
    }
  } catch (error) {
    console.log('Consent popup not found, continuing...');
  }
}



  async submitOTP(otp) {
    await this.otpInput.waitFor({state:'visible'});
    await this.otpInput.fill(otp); 
    await this.submitButton.click();
      
  }


}

