import { expect } from '@playwright/test';
import testData from '../test_data/login.json';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.acceptButton = page.locator('#onetrust-accept-btn-handler');
    this.emailInput = page.locator('input[name="UserEmail"]');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.locator('button.createBtn');
    this.otpInput = page.locator('input[name="UserOTP"]'); 
    this.submitButton = page.locator('button[type="submit"].btn');
    this.lanternOtpPageUrl = '';
    this.popupLocator = page.locator('.claim-eula-popup');
    this.successMessage = page.locator(testData.successMessage);
    this.agreeButton = page.locator('button.btn', { hasText: "Ok, I agree" })
    this.claimBox = page.locator('.claimBox');
    this.cookieBanner = page.locator('.onetrust-pc-dark-filter');
    this.closeButton = page.getByRole('button', { name: 'Close' });
  }

  async closeCookieBanner() {
    await expect(this.cookieBanner).toBeVisible({ timeout: 5000 });
    await this.cookieBanner.click();
    await this.closeButton.click();
  }
  async goto() {
    await this.page.goto(process.env.LANTERN_SIGNIN_URL); 
  }

  async signin(email, password) {
    await this.page.waitForLoadState('domcontentloaded');
    try {
      await this.acceptButton.waitFor({ state: 'visible', timeout: 15000 });
      if (await this.acceptButton.isVisible()) {
        await this.acceptButton.click();
      }
    } catch (error) {
      console.log('Consent popup not found, continuing...');
    }
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(2000);
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(2000); 
    console.log("Clicking sign-in button...");
    await this.signInButton.click();
    
    console.log("Waiting for page navigation...");
    
    console.log("Checking OTP input visibility...");
    await this.page.waitForSelector('input[name="UserOTP"]', { state: 'visible', timeout: 30000 });
    
    console.log("OTP page loaded:", await this.page.url());
    this.lanternOtpPageUrl = this.page.url();
  }

  async submitOTP(otp) {
    await this.page.goto(this.lanternOtpPageUrl);
    try {
      await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.acceptButton.isVisible()) {
        await this.acceptButton.click();
      }
    } catch (error) {
      console.log('Consent popup not found, continuing...');
    }
    await this.otpInput.fill(otp); 
    await this.submitButton.click();
    await this.popupLocator.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
    
    await this.agreeButton.click();
    console.log("Successfully logged in!");    
  }

  async validateEULAandlogin(){
    await this.popupLocator.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
    
    await this.agreeButton.click();
    console.log("Successfully logged in!");  
  }

  async verifyRegisteredCase() {
    await expect(this.claimBox.first()).toBeVisible();
    console.log("ClaimBox found under 'My ongoing claims'!");
  }
}