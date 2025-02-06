
import { chromium } from '@playwright/test';
import {test as setup,  expect } from 'playwright/test';
import fs from 'fs';
require('dotenv').config();
import { HomePageNew } from '../pages/mason_home_page1';
import { SignInPageNew } from '../pages/mason_signin_page1';
import { MyAccountPage } from '../pages/mason_myaccount_page';

const homepage_data = JSON.parse(JSON.stringify(require('../test_data/mason_sb_home_page_data.json')));
const signinpage_data = JSON.parse(JSON.stringify(require('../test_data/mason_signin_page_data.json')));
const signoutpage_data = JSON.parse(JSON.stringify(require('../test_data/mason_signout_page_data.json')));
const myaccountpage_data = JSON.parse(JSON.stringify(require('../test_data/mason_sb_myaccount_page_data.json')));

const creditUserFile = './credituser.json';
const nonCreditUserFile = './noncredituser.json';
const newUserFile = './newuser.json';
const paymentUserFile = './paymentuser.json';
const profileUserFile = './profileuser.json';
const globalUser1File = './globaluser1.json';
const globalUser2File = './globaluser2.json';
const orderDetailsCancelOrderFile = './orderdetailscancelorder.json';
const shipAddressNoCardUser = './shipAddressNoCardUser.json';
const savedCardUser = './savedCardUser.json';
const creditUser2 = './creditUser2.json';
const creditUser3 = './creditUser3.json';
const creditUser4 = './creditUser4.json';
const creditUser5 = './creditUser5.json';
const creditUser6 = './creditUser6.json';
const creditUser7 = './creditUser7.json';
const downPaymentUser = './dpUser.json';
const nonCreditUserFile1 = './noncredituser1.json';
const nonCreditUserFile2 = './noncredituser2.json';
const nonCreditUserFile3 = './noncredituser3.json';
const nonCreditUserFile4 = './noncredituser4.json';
const savedCardUser2 = './savedCardUser2.json';

async function globalSetup(config) {
  const browser = await chromium.launch();
  //const page = await browser.newPage();

  // Authenticate as user1
  const page1 = await browser.newPage();
  await authenticateUser(page1, process.env.CREDIT_USER_5, creditUser5);
  await page1.close();

  // Authenticate as user2
  const page2 = await browser.newPage();
  await authenticateUser(page2, process.env.CREDIT_USER_6, creditUser6);
  await page2.close();

  // Authenticate as user2
  const page3 = await browser.newPage();
  await authenticateUser(page3, process.env.CREDIT_USER_7, creditUser7);
  await page3.close();

  // // Authenticate as user2
  // const page4 = await browser.newPage();
  // await authenticateUser(page4, process.env.NON_CREDIT_USER4, nonCreditUserFile4);
  // await page4.close();
  // // Authenticate as user2
  // const page5 = await browser.newPage();
  // await authenticateUser(page5, process.env.SAVE_CC_USER1, savedCardUser2);
  // await page5.close();

  await browser.close();
}

async function authenticateUser(page, userEmail, storageFile) {
  try {
    await page.goto(process.env.WEB_URL);
    //await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'My Account Sign In' }).waitFor({state:'visible'});
    await page.getByRole('button', { name: 'My Account Sign In' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByLabel('*Email Address').click();
    await page.getByLabel('*Email Address').fill(userEmail);
    await page.getByLabel('*Password').click();
    await page.getByLabel('*Password').fill(process.env.CREDIT_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click({ timeout: 10000 });
    await page.waitForURL('**/account/dashboard/');
    //await page.goto('https://www-stg2.stoneberry.com/account/dashboard/');
    const signinPage = new SignInPageNew(page);
    await signinPage.waitForMyAccountDashboardLoad();
    await signinPage.validateSignInMessage(signinpage_data.signin_success_text);
    //await page.waitForLoadState('networkidle');
    await page.context().storageState({ path: storageFile });
  } catch (error) {
    console.error(`Authentication failed for ${userEmail}:`, error);
  }
}

export default globalSetup;