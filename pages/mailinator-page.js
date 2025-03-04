import { expect } from '@playwright/test';
import testData from '../test_data/mailinator.json';

export class MailinatorPage {
  constructor(page) {
    this.page = page;
    this.mailinator_login = process.env.MAILINATOR_URL;
    this.mailinator_inbox = process.env.MAILINATOR_INBOX_URL;
    this.usernameField = page.locator('input[placeholder="Email"]');
    this.passwordField = page.locator('input[placeholder="Password"]');
    this.loginButton = page.locator('text=Log in');
    this.searchInboxField = page.locator('input#inbox_field');
    this.goButton = page.locator('button.primary-btn');
    this.emailLocatorVerification = page.locator(testData.emailLocatorVerification);
    this.emailLocatorOTP = page.locator(testData.emailLocatorOTP);
    this.iframeSelector = 'iframe[name="html_msg_body"]';
    this.verifyLinkLocator = 'a:has-text("Verify my email")';
    this.otpLocator = page.locator('strong');
    this.successMessage = page.locator(testData.successMessage);
    this.signinButton = page.locator('a.btn.createBtn.reset');

    this.resetPasswordLocator = page.locator(testData.resetPassword);
    this.resetLink = 'a:has-text("click here")';
  }

  async gotoLoginPage() {
    await this.page.goto(this.mailinator_login);
  }

  async gotoMailinatorInbox(){
    await this.page.goto(this.mailinator_inbox);
  }

  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(this.mailinator_inbox);
  }

  async searchEmail(testEmail) {
    const emailPrefix = testEmail.split('@')[0];
    await this.searchInboxField.fill(emailPrefix);
    await this.goButton.click();
    console.log(`Searched for inbox: ${emailPrefix}`);
}

  async openVerificationEmail() {
    await this.emailLocatorVerification.first().waitFor({ state: 'visible', timeout: 40000 });
    await this.emailLocatorVerification.first().click();
    console.log('Verification email opened.');
  }

  async clickVerificationLink() {
    const iframe = this.page.frameLocator(this.iframeSelector);
    await iframe.locator(this.verifyLinkLocator).waitFor({ state: 'visible', timeout: 40000 });
    const verificationLink = await iframe.locator(this.verifyLinkLocator).getAttribute('href');
    await this.page.goto(verificationLink);
    await this.successMessage.waitFor({ state: 'visible', timeout: 40000 });
    console.log('User account verified successfully.');
  }

  async openOTPEmail() {
    await this.emailLocatorOTP.first().waitFor({ state: 'visible', timeout: 40000 });
    await this.emailLocatorOTP.first().click();
    console.log('OTP email opened.');
  }

  async extractOTPFromIframe() {
    const frame = await this.page.frameLocator(this.iframeSelector);
    const otpLocator = frame.locator('h1 strong');
    await otpLocator.waitFor({ state: 'visible', timeout: 90000 });

    const otpText = await otpLocator.innerText();
    const otp = otpText.match(/\d{6}/);
    return otp[0];
  }

  async resetPasswordEmail() {
    await this.resetPasswordLocator.first().waitFor({ state: 'visible', timeout: 40000 });
    await this.resetPasswordLocator.first().click();

    const iframe = this.page.frameLocator(this.iframeSelector);
    await iframe.locator(this.resetLink).waitFor({ state: 'visible', timeout: 40000 });

    const resetLink = await iframe.locator(this.resetLink).getAttribute('href');
    if (!resetLink) throw new Error('Reset password link not found!');

    await this.page.goto(resetLink);
    console.log('Navigated to reset password page.');
  }
}