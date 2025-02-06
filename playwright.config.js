import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

if (process.env.ENV === 'stage'){
  require('dotenv').config({path: '.env'});
}

config();

// dotenv.config({
//   path: `../utils/.env`,
// });


export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: 'tests',
  outputDir: 'test-results',
  //globalSetup: 'utils/globalSetup.js',

  
  // Run all tests in parallel.
  fullyParallel: true,
  workers: 3,

  // Fail the build on CI if you accidentally left test.only in the source code.
  //forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 1 : 1,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 3 : 3,

  // Reporter to use
  //reporter: 'html',
  
  reporter: [
    [
      "allure-playwright",
      
    ],
  ],
  
  // expect: {
  //   timeout: 30 * 1000,
  // },

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    //baseURL: 'https://dev-portal-stage.artandwriting.org/',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    //video: 'retain-on-failure',
    acceptDownloads: true,
    },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'Lantern',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        //viewport: { width: 1920, height: 1080 },
        // launchOptions: {
        // args: ['--start-maximized']}
      },
    },
    // {
    //   name: 'Mason Commerce Tool Site - Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or 'msedge-dev'
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: {...devices['iPhone 14 Pro Max'],browserName: 'chromium'},
    // },
    // {
    //   name: "chromium@Samsung Galaxy S23 Ultra:@browserstack-mobile",
    //   use: {
    //     baseURL: "https://www.bstackdemo.com/",
    //     browserName: "chromium",
    //     channel: "chrome",
    //   },
    // },
    
  ],
  // Run your local dev server before starting the tests.
//   webServer: {
//     command: 'npm run start',
//     url: 'http://127.0.0.1:3000',
//     reuseExistingServer: !process.env.CI,
//   },
});