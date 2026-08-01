import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
    // Fallback to local Edge if Chromium binary is missing
    channel: 'msedge'
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      }
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }
      }
    }
  ]
});
