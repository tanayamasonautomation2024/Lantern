const { chromium } = require('playwright');
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home_page';
import { SignInPage } from '../pages/signin_page';

import { CreateAccountPage } from '../pages/createAccount_page';

import { allure } from 'allure-playwright';
import { sign } from 'crypto';


const homepage_data = JSON.parse(JSON.stringify(require('../test_data/home_page_data.json')));


test.describe("Create Account Scenarios", () => {

  test.beforeEach(async ({ page, isMobile }, testInfo) => {
    test.slow();
    try {
      await page.goto(process.env.WEB_URL);
      //await page.waitForLoadState('networkidle');
      if (isMobile == true) {
        const signinPage = new SignInPage(page);
        await signinPage.clickSignInImage();
        await signinPage.clickSignIn();
      } else {
        const homePage = new HomePage(page);
        await homePage.clickOnHomePageSignIn();

      }
    } catch (error) {
      // Handle the error here
      console.error("An error occurred in test.beforeEach:", error);
    }

  })


  //SB-LOGREG044
  test("Account - Create Account - Validate generation of Create Account Drawer for Guest Users ", async ({ page }) => {
    //test.slow();
    // const homePage = new HomePage(page);
    // await homePage.clickOnHomePageSignIn();
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await signinPage.clickCreateAnAccount();
    //await page.waitForLoadState('networkidle');
    await createAccountPage.validateCreateAccountHeader();

  })

  //SB-LOGREG047
  test("Account - Create Account - Validate the fields of Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await signinPage.clickCreateAnAccount();
    await createAccountPage.validateCreateAccountDrawer();
  })

  //SB-LOGREG051
  test("Account - Create Account - Validate the Password Hide/Show in Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await signinPage.clickCreateAnAccount();
    const password = [...Array(6)].map(() => String.fromCharCode(Math.random() * 26 + 97 | 0)).join('') + String.fromCharCode(Math.random() * 26 + 65 | 0) + (Math.random() * 10 | 0);
    await createAccountPage.enterPasswordOnCreateAccountPage(password);
    await createAccountPage.validatePasswordShowLinkIsVisible();
    await createAccountPage.clickOnShowPassword();
    await createAccountPage.validatePasswordIsShown();
    await createAccountPage.readPasswordFromTextboxAndValidate(password);
    await createAccountPage.validatePasswordHideLinkIsVisible();
    await createAccountPage.clickOnHidePassword();
    await createAccountPage.validatePasswordIsHidden();

  })


  //SB-LOGREG052
  test("Account - Create Account - Validate the Password Criteria in Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await signinPage.clickCreateAnAccount();
    const password = [...Array(6)].map(() => String.fromCharCode(Math.random() * 26 + 97 | 0)).join('') + String.fromCharCode(Math.random() * 26 + 65 | 0) + (Math.random() * 10 | 0);
    await createAccountPage.enterPasswordOnCreateAccountPage(password);
    await createAccountPage.validatePasswordShowLinkIsVisible();
    await createAccountPage.clickOnShowPassword();
    await createAccountPage.validateThePasswordCriteria();

  })

  //SB-LOGREG054
  test("Account - Create Account - Validate the default check of Email Update checkbox in Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await signinPage.clickCreateAnAccount();
    await createAccountPage.validateDefaulCheckofEmailUpdate();


  })

  //SB-LOGREG053
  test("Account - Create Account - Validate the mandatory Fields in Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    const email = [...Array(6)].map(() => String.fromCharCode(Math.random() * 26 + 97 | 0)).join('') + String.fromCharCode(Math.random() * 26 + 65 | 0) + (Math.random() * 10 | 0);
    await signinPage.clickCreateAnAccount();
    await createAccountPage.clickOnCreateAccount();
    await createAccountPage.validateMandatoryFieldsCriteria(email);
  })

  //SB-LOGREG055
  test("Account - Create Account - Validate the account Creation in Create Account Page for Guest Users ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    const firstname = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + [...Array(9)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    const lastname = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + [...Array(9)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    const email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}@automation.com`;
    const password = [...Array(6)].map(() => String.fromCharCode(Math.random() * 26 + 97 | 0)).join('') + String.fromCharCode(Math.random() * 26 + 65 | 0) + (Math.random() * 10 | 0);
    await signinPage.clickCreateAnAccount();
    await createAccountPage.clickOnCreateAccount();
    await createAccountPage.enterNameDetailsOnCreateAccountPage(firstname, lastname);
    await createAccountPage.enterEmailOnAccountPage(email);
    await createAccountPage.enterPasswordOnCreateAccountPage(password);
    await createAccountPage.clickOnCreateAccount();
    await createAccountPage.accountCreationSuccessMessage();
  })

  //SB-LOGREG066 //SB-LOGREG056
  test("Account - Create Account - Validate the User is redirected to Account Dashboard after account creation from Create Account Page ", async ({ page }) => {
    const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    const firstname = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + [...Array(9)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    const lastname = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + [...Array(9)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    const email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}@automation.com`;
    const password = [...Array(6)].map(() => String.fromCharCode(Math.random() * 26 + 97 | 0)).join('') + String.fromCharCode(Math.random() * 26 + 65 | 0) + (Math.random() * 10 | 0);
    await signinPage.clickCreateAnAccount();
    await createAccountPage.clickOnCreateAccount();
    await createAccountPage.enterNameDetailsOnCreateAccountPage(firstname, lastname);
    await createAccountPage.enterEmailOnAccountPage(email);
    await createAccountPage.enterPasswordOnCreateAccountPage(password);
    await createAccountPage.clickOnCreateAccount();
    await createAccountPage.validateDashboardNavigation(firstname, process.env.DASHBOARD_URL);

  })

  //SB-MYACCTD001
  test("Account - Sign In (Drawer)/Sign In Page - Validate the Account Drawer for Guest User ", async ({ page }) => {
    //const signinPage = new SignInPage(page);
    const createAccountPage = new CreateAccountPage(page);
    await createAccountPage.validateAccountDrawer();


  })
  test.afterEach(async ({ page }) => {
    try {
      const screenshotPath = `screenshots/CreateAccount-Screenshoot-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      allure.attachment('Full Page Screenshot', Buffer.from(await page.screenshot({ fullPage: true })), 'image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  });

})