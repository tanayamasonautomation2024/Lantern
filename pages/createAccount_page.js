import { type } from 'os';
import test, { expect } from 'playwright/test';
const createAccount_locator =JSON.parse(JSON.stringify(require('../object_repositories/mason_createAccount_page_repo.json')));
const createAccountpage_data =JSON.parse(JSON.stringify(require('../test_data/mason_createAccount_page_data.json')));


exports.CreateAccountPage = class CreateAccountPage{
    constructor(page){
        this.page=page;
        this.create_account_header=page.getByRole(createAccount_locator.create_account_header);
        this.create_account_firstname_textbox = page.getByLabel(createAccount_locator.create_account_firstname_textbox);
        this.create_account_password_show_link=page.getByRole('link', { name: createAccount_locator.create_account_password_show_link });
        this.create_account_password_hide_link=page.getByRole('link', { name: createAccount_locator.create_account_password_hide_link });
        this.create_account_email_textbox=page.getByLabel(createAccount_locator.create_account_email_textbox);
        //this.create_account_password_textbox=page.getByLabel(createAccount_locator.create_account_password_textbox);
        this.create_account_password_textbox=page.locator(createAccount_locator.create_account_password_textbox);
        this.create_account_password_info=page.getByLabel(createAccount_locator.create_account_password_info);
        this.create_an_account_button=page.getByRole('button',{name: createAccount_locator.create_an_account_button});

        this.create_accountLastname_textbox=page.locator(createAccount_locator.create_accountLastname_id);
        this.xpath_of_password_criteria1=page.locator(createAccount_locator.xpath_of_password_criteria1);
        this.enter_password_text = page.getByText(createAccountpage_data.enter_password_text);
        this.password_criteria_text=page.getByText(createAccountpage_data.password_criteria_text);
        this.password_criteria1=(page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.password_criteria1) }).first());
        this.password_criteria2=(page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.password_criteria2) }).first());
        this.password_criteria3=(page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.password_criteria3) }).first());

        this.email_missing=page.getByText(createAccountpage_data.email_missing);
        this.password_missing=page.getByText(createAccountpage_data.password_missing);
        this.firstname_missing=page.getByText(createAccountpage_data.firstname_missing);
        this.lastname_missing=page.getByText(createAccountpage_data.lastname_missing);
        this.invalid_email=page.getByText(createAccountpage_data.invalid_email);
        this.account_creation_success=this.page.getByText(createAccountpage_data.account_creation_success);

        this.account_drawer_header=this.page.getByText(createAccount_locator.account_drawer_header);
        this.account_drawer_credit_button=page.getByRole('link', { name: createAccount_locator.account_drawer_credit_button }); 
        this.account_drawer_make_payment_button=page.getByRole('link', { name: createAccount_locator.account_drawer_make_payment_button }); 

        this.account_drawer_order_link=page.getByRole('link', { name: createAccount_locator.account_drawer_order_link }); 
         
        this.account_drawer_wishlist_link=page.getByRole('link', { name: createAccount_locator.account_drawer_wishlist_link }); 
        this.account_drawer_needHelp_link=page.getByRole('link', { name: createAccount_locator.account_drawer_needHelp_link });
             
        this.account_drawer_create_an_account_button=page.getByRole('button', { name: createAccount_locator.account_drawer_sign_in_button});
        this.account_drawer_sign_in_button=page.getByRole('button', { name: createAccount_locator.account_drawer_sign_in_button,exact:true });

        //this.myaccount_orderStatus_link=page.getByRole('link', { name: 'Order Status' });
    
    }

    async validateCreateAccountHeader(){
        await expect(this.create_account_header).toContainText(createAccountpage_data.create_account_header_text);
    }

    async clickOnCreateAccount(){
        await this.create_an_account_button.click();
    }

    async validateCreateAccountDrawer(){
        const no_account_text = await (this.page.locator(createAccount_locator.create_account_dialog)).innerText();
        //.toContainText(createAccountpage_data.create_account_if_no_existing_account_text);
        await expect(this.create_account_firstname_textbox).toBeVisible();
        await expect(this.create_accountLastname_textbox).toBeVisible();
        await expect(this.create_account_email_textbox).toBeVisible();
        await expect(this.create_account_password_textbox).toBeVisible();
        await expect(this.create_account_password_info.first()).toBeVisible();
        await expect(this.create_an_account_button).toBeVisible();
        await expect(this.page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.create_account_send_email_updates_text) })).toBeVisible();
        await expect(this.page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.create_account_keepMe_signed_text) })).toBeVisible();
        if (no_account_text.includes(createAccountpage_data.create_account_if_no_existing_account_text)) {
            console.log(no_account_text);
            //console.log(info_icon_text_extracted);
            return true;
        } else {
            console.log(no_account_text);
            //console.log(info_icon_text_extracted);
            return false;
        }

    }

    async validatePasswordShowLinkIsVisible(){
        await expect(this.create_account_password_show_link).toBeVisible();
    }

    async validatePasswordHideLinkIsVisible(){
        await expect(this.create_account_password_hide_link).toBeVisible();
    }

    async enterPasswordOnCreateAccountPage(password){
       // this.create_account_password_textbox.click({ timeout: 10000 });
        //this.create_account_password_textbox.fill(password);
        await this.page.waitForSelector('input#password', { state: 'visible' });

// Fill the password input field
        await this.page.fill('input#password', password);
}

    async readPasswordFromTextboxAndValidate(password){
        await expect(this.create_account_password_textbox).toHaveValue(password);
    }

    async clickOnShowPassword(){
        await this.create_account_password_show_link.click();
    }

    async clickOnHidePassword(){
        await this.create_account_password_hide_link.click();
    }

    async validatePasswordIsHidden() {
        const passwordTextbox = this.page.locator('input#password');
        
        // Await the result of getAttribute to get the type value as a string
        const typeAttribute = await passwordTextbox.getAttribute('type');
        
        // Trim any extra whitespace and compare to 'password'
        const hidden_password = typeAttribute.trim() === 'password';
        
        // Assert that the password is hidden (type should be 'password')
        expect(hidden_password).toBe(true);
    }
    

    async validatePasswordIsShown() {
        const passwordTextbox = this.page.locator('input#password');
        await passwordTextbox.waitFor({ state: 'visible' });
        // Await the result of getAttribute() and compare
        const typeAttribute = await passwordTextbox.getAttribute('type');
        console.log('Password type:', typeAttribute);
        const shown_password = typeAttribute.trim() === 'text'; // Check if the type is 'text'
        
        console.log(typeAttribute);  // Log the value of the type attribute for debugging
        expect(typeAttribute === 'text').toBe(true);  // Assert that the password is shown as text
    }
    

    async validateThePasswordCriteria(){
        await expect(this.password_criteria_text).toBeVisible();
        await expect(this.password_criteria1).toBeVisible();
        console.log(this.password_criteria_text);
        await expect(this.password_criteria2).toBeVisible();
        await expect(this.password_criteria3).toBeVisible();
        const criteriaData = {
            password_criteria1: createAccountpage_data.password_criteria1,
            password_criteria2: createAccountpage_data.password_criteria2,
            password_criteria3: createAccountpage_data.password_criteria3
        };
        
        for (const key in criteriaData) {
            const input = criteriaData[key];
            const extractedText = input.match(/^\^(.*?)\$$/)[1];
            //console.log(`Input for ${key}:`, input);
            const section = await this.page.locator(`//section[text()="${extractedText}"]`);
            const classAttributeValue = await section.getAttribute('class');
        
            if (classAttributeValue.includes('text-forestGreen')) {
                console.log(`The section for ${key} - ${input} contains the class 'text-forestGreen'.`);
            } else {
                console.log(`The section for ${key} - ${input} does not contain the class 'text-forestGreen'.`);
            }
        }
        
        
    }

    async validateDefaulCheckofEmailUpdate(){
        await expect(this.page.locator('section').filter({ hasText: new RegExp(createAccountpage_data.create_account_send_email_updates_text) })).toBeVisible();
        const emailUpdatesButton = this.page.locator(createAccount_locator.keep_me_signed_in_checkox_xpath);
        // Check if the button is checked
        const isChecked = await emailUpdatesButton.getAttribute('data-state');
        expect (isChecked === 'checked').toBe(true);
  } 

  async validateMandatoryFieldsCriteria(email){
    await expect(this.email_missing).toBeVisible();
    await expect(this.password_missing).toBeVisible();
    await expect(this.firstname_missing).toBeVisible();
    await expect(this.lastname_missing).toBeVisible();
    await this.create_account_email_textbox.click();
    await this.create_account_email_textbox.fill(email);
    await expect(this.invalid_email).toBeVisible();
  }

  async enterNameDetailsOnCreateAccountPage(firstname,lastname){
    await this.create_account_firstname_textbox.click();
    await this.create_account_firstname_textbox.fill(firstname);
    await this.create_accountLastname_textbox.click();
    await this.create_accountLastname_textbox.fill(lastname);

  }

  async enterEmailOnAccountPage(email){
    await this.create_account_email_textbox.click();
    await this.create_account_email_textbox.fill(email);
  }

  async accountCreationSuccessMessage(){
    await this.account_creation_success.waitFor({state:'visible'});
    await expect(this.account_creation_success).toBeVisible();
  }

  async validateDashboardNavigation(firstName, dashboard_url){
    //await expect(this.page).toHaveURL(/.*dashboard/);
    //await new Promise(resolve => setTimeout(resolve, 3000)).then(() => expect(this.page).toHaveURL(/.*dashboard/));
    await this.page.waitForURL(/.*dashboard/);
   //await this.page.waitForURL(dashboard_url);
    await expect(this.page.getByText(`Hi, ${firstName}!`).first()).toBeVisible();
    const currentURL = await this.page.url();
    expect(currentURL).toContain(dashboard_url);
    
    // console.log(currentURL);
    // console.log(dashboard_url);
    
  }

  async validateAccountDrawer(){
    await expect(this.account_drawer_sign_in_button).toBeVisible();
    await expect(this.account_drawer_create_an_account_button).toBeVisible();
    await expect(this.account_drawer_credit_button).toBeVisible();
    await expect(this.account_drawer_make_payment_button).toBeVisible();
    await expect(this.account_drawer_order_link).toBeVisible();
    await expect(this.account_drawer_wishlist_link).toBeVisible();
    await expect(this.account_drawer_needHelp_link).toBeVisible();
    await expect(this.account_drawer_header).toBeVisible();
    await expect(this.page.getByRole('link').nth(4)).toBeVisible();
    

}
    
}


