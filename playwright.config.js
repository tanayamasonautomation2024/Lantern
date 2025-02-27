import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
 
if (process.env.ENV === 'stage') {
  require('dotenv').config({ path: '.env' });
}
 
config();
 
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  fullyParallel: true,
  workers: 3,
  retries: process.env.CI ? 1 : 1,
  reporter: [['allure-playwright']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    acceptDownloads: true,
  },
  projects: [
    {
      name: 'Lantern Chrome Tests',
      use: {
        ...devices['Desktop Chrome'],
        //channel: 'msedge',
        viewport: { width: 1280, height: 1024 },
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'Edge Guest User Scenarios',
      // Explicitly match `guest-user-scenarios.spec.js` for Edge
      //testMatch: ['tests/guest-user-scenarios.spec.js'],
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],
});