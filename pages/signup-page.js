import { expect } from '@playwright/test';
import testData from '../test_data/signup.json';

export class SignupPage {
  constructor(page) {
    this.page = page;
    this.url = process.env.LANTERN_URL;
    this.signupUrl = process.env.LANTERN_SIGNUP_URL;
    this.cookieBanner = page.locator('#onetrust-accept-btn-handler');
    this.createAccountLink = page.getByRole('link', { name: 'Create account' });
    this.firstNameInput = page.locator('input[name="FirstName"]');
    this.lastNameInput = page.locator('input[name="LastName"]');
    this.emailInput = page.locator('input[name="UserEmail"]');
    this.passwordInput = page.locator('input[name="Password"]');
    this.confirmPasswordInput = page.locator('input[name="ConfirmPassword"]');
    this.termsCheckbox = page.locator('input[type="checkbox"]');
    this.createAccountButton = page.locator('button[type="submit"]');
    this.successMessage = page.locator(testData.successMessage);

    this.testEmail = `automation${Math.floor(Math.random() * 100000) + 1}@lantern.throwemails.com`;
  }

  async goto() {
    await this.page.goto(this.url);

    await this.page.evaluate(() => {
      document.querySelectorAll('.onetrust-pc-dark-filter, #onetrust-consent-sdk').forEach(el => el.remove());
    });

    if (await this.cookieBanner.isVisible()) {
      await this.cookieBanner.click();
    }

    await this.page.waitForTimeout(1000);
    await this.createAccountLink.waitFor({ state: 'visible' });
    await this.createAccountLink.scrollIntoViewIfNeeded();
    await this.createAccountLink.click({ force: true });

    await expect(this.page).toHaveURL(this.signupUrl);
  }

  async fillSignupForm(firstName, lastName, password) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(this.testEmail);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async submitForm() {
    await this.createAccountButton.click();
  }

  async verifySignupSuccess() {
    await this.successMessage.waitFor({ state: "visible" });
  }
}