import { expect } from '@playwright/test';
export class MailinatorPage {
  constructor(page) {
    this.page = page;
    this.usernameField = page.locator('input[placeholder="Email"]');
    this.passwordField = page.locator('input[placeholder="Password"]');
    this.loginButton = page.locator('text=Log in');
    this.searchInboxField = page.locator('input#inbox_field');
    this.goButton = page.locator('button.primary-btn');
    this.emailLocatorVerification = page.locator('table tr').filter({ hasText: 'Welcome Email for Verification' });
    this.emailLocatorOTP = page.locator('table tr').filter({ hasText: 'Your Requested One Time Passcode' });
    this.iframeSelector = 'iframe[name="html_msg_body"]';
    this.verifyLinkLocator = 'a:has-text("Verify my email")';
    this.otpLocator = page.locator('strong');
    this.successMessage = page.locator('text=User account verified successfully');
    this.signinButton = page.locator('a.btn.createBtn.reset');
  }

  async gotoLoginPage() {
    await this.page.goto('https://www.mailinator.com/v4/login.jsp');
  }

  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL('https://www.mailinator.com/v4/private/inboxes.jsp');
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
    const frame = await this.page.frameLocator('iframe[name="html_msg_body"]');
    const otpLocator = frame.locator('h1 strong');
    await otpLocator.waitFor({ state: 'visible', timeout: 90000 });

    const otpText = await otpLocator.innerText();
    const otp = otpText.match(/\d{6}/);
    return otp[0];
  }
}