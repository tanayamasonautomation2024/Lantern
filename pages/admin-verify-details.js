import { expect } from '@playwright/test';
import fs from 'fs';
const path = require('path');
const AdmZip = require('adm-zip');

export class AdminPageVerifyDetails {
  constructor(page) {
    this.page = page;

    // Locators
    this.primaryPhoneLocator = this.page.locator('.lmate-key-value-pair:has-text("Primary Phone:") .value .ellipsed-text');
    this.primaryEmailLocator = this.page.locator('.lmate-key-value-pair:has-text("Primary Email:") .ellipsed-text');
    this.primaryAddressLocator = this.page.locator('.lmate-key-value-pair:has-text("Primary Address:") .ellipsed-text');
    this.phoneNumbersSection = this.page.locator('.profile-infos:has-text("Phone Numbers")');
    this.emailSection = this.page.locator('.profile-infos:has-text("Emails")');
    this.addressSection = this.page.locator('.profile-infos:has-text("Addresses")');

    this.editCommunicationPreferanceButton = page.getByRole('heading', { name: 'Marketing Preferences' }).getByRole('button');
  }

  async verifyClaimantDetails() {
    const myAccountData = JSON.parse(JSON.stringify(require('../test_data/my_account.json')));
    const expectedPhone = myAccountData.expected_phone;
    const newStreet1 = myAccountData.addressline1;
    const emailFilePath = 'test-email.txt';
    const expectedEmail = fs.readFileSync(emailFilePath, 'utf8').trim();

    const phoneText = await this.primaryPhoneLocator.innerText();
    let formattedPhoneText = phoneText.replace(/\D/g, '');
    let formattedExpectedPhone = expectedPhone.replace(/\D/g, '');
    if (formattedPhoneText.startsWith('1') && formattedPhoneText.length > formattedExpectedPhone.length) {
        formattedPhoneText = formattedPhoneText.substring(1);
    }
    await expect(formattedPhoneText).toBe(formattedExpectedPhone);
    console.log(`✔ Phone number matched ✅`);

    const extractedEmail = await this.primaryEmailLocator.innerText();
    await expect(this.primaryEmailLocator).toHaveText(expectedEmail);
    console.log(`✔ Email matched ✅`);

    await expect(this.primaryAddressLocator).toContainText(newStreet1);
    console.log(`✔ Address matched ✅`);
  }

  async verifyPersonalInformation() {
    const myAccountData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
    const expectedPrimaryPhone = myAccountData.primary_phone;
    const expectedSecondaryPhone = myAccountData.secondary_phone;
    const expectedPrimaryAddress = myAccountData.primary_address;
    const expectedSecondaryAddress = myAccountData.secondary_address;
    const expectedPrimaryEmail = fs.readFileSync('test-email.txt', 'utf8').trim();
    const expectedSecondaryEmail = fs.readFileSync('account-email.txt', 'utf8').trim();

    const primaryPhoneLocator = this.phoneNumbersSection.locator(`.profile-items.starred:has-text("${expectedPrimaryPhone.slice(-8)}")`);
    await expect(primaryPhoneLocator).toHaveCount(1);
    const formattedPrimaryPhone = (await primaryPhoneLocator.innerText()).replace(/\D/g, '').replace(/^1/, '');
    await expect(formattedPrimaryPhone).toBe(expectedPrimaryPhone.replace(/\D/g, '').replace(/^1/, ''));
    console.log(`✔ Primary Phone number matched ✅`);

    const secondaryPhoneLocator = this.phoneNumbersSection.locator(`.profile-items:has-text("${expectedSecondaryPhone.slice(-8)}")`);
    await expect(secondaryPhoneLocator).toHaveCount(1);
    console.log(`✔ Secondary Phone number matched ✅`);

    const primaryEmailLocator = this.emailSection.locator(`.profile-items.starred:has-text("${expectedPrimaryEmail}")`);
    await expect(primaryEmailLocator).toHaveCount(1);
    console.log(`✔ Primary Email matched ✅`);

    const secondaryEmailLocator = this.emailSection.locator(`.profile-items:has-text("${expectedSecondaryEmail}")`);
    await expect(secondaryEmailLocator).toHaveCount(1);
    console.log(`✔ Secondary Email matched ✅`);

    const primaryAddressLocator = this.addressSection.locator(`.profile-items.starred:has-text("${expectedPrimaryAddress.slice(0, 10)}")`).first();
    await expect(primaryAddressLocator).toHaveCount(1);
    console.log(`✔ Primary Address matched ✅`);

    const secondaryAddressLocator = this.addressSection.locator(`.profile-items:has-text("${expectedSecondaryAddress.slice(0, 10)}")`).first();
    await expect(secondaryAddressLocator).toHaveCount(1);
    console.log(`✔ Secondary Address matched ✅`);
  }

  async verifyPrimaryIndicators() {
    const myAccountData = JSON.parse(JSON.stringify(require('../test_data/admin_details.json')));
    const expectedPrimaryValues = {
      phone: myAccountData.primary_phone.slice(-8),
      address: myAccountData.primary_address,
      email: fs.readFileSync('test-email.txt', 'utf8').trim()
    };

    const primaryPhone = this.phoneNumbersSection.locator(`.profile-items.starred:has-text("${expectedPrimaryValues.phone}")`);
    await expect(primaryPhone).toHaveCount(1);
    console.log('✅ Primary phone indicator is correct.');

    const primaryAddress = this.addressSection.locator(`.profile-items.starred:has-text("${expectedPrimaryValues.address}")`);
    await expect(primaryAddress).toHaveCount(1);
    console.log('✅ Primary address indicator is correct.');

    const primaryEmail = this.emailSection.locator(`.profile-items.starred:has-text("${expectedPrimaryValues.email}")`);
    await expect(primaryEmail).toHaveCount(1);
    console.log('✅ Primary email indicator is correct.');
  }

  async verifyMarketingAndCommunicationPreferences() {
    await this.editCommunicationPreferanceButton.click();
    const industryAlertsEnable = this.page.getByTitle('Enable').first();
    const marketingEmailsEnable = this.page.getByTitle('Enable').nth(1);
    const newsletterDisable = this.page.getByTitle('Disable');
    const emailEnable = this.page.getByTitle('Enable').nth(2);
    const smsEnable = this.page.getByTitle('Enable').nth(3);

    await expect(industryAlertsEnable).toBeVisible();
    await expect(marketingEmailsEnable).toBeVisible();
    await expect(newsletterDisable).toBeVisible();
    await expect(emailEnable).toBeVisible();
    await expect(smsEnable).toBeVisible();
    console.log('✅ Preferences verified successfully.');
  }

  async clearDownloadFolders() {
    const directoriesToClear = [
        path.join(process.cwd(), 'downloads'),
        path.join(process.cwd(), 'release-document'),
        path.join(process.cwd(), 'aca-document'),
        path.join(process.cwd(), 'reference-document')
    ];

    for (const dir of directoriesToClear) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📂 Created directory: ${dir}`);
                continue;
            }

            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑 Deleted: ${filePath}`);
                }
            }
        } catch (error) {
            console.error(`⚠ Error clearing ${dir}:`, error);
        }
    }
}
}
