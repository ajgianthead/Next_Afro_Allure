import { test, expect, type Page } from '@playwright/test';

test.describe("Register Business", () => {
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto("http://localhost:3000/register");
      });
    test("should register business successfully with incomplete onboarding", async ({ page }) => {
        await page.getByRole('textbox', { name: 'Business Name' }).click();
        await page.getByRole('textbox', { name: 'Business Name' }).fill('LadyPlutoLooks');
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill('abijah.nez@gmail.com');
        await page.getByRole('textbox', { name: 'Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Password' }).fill('Abijah14!');
        await page.getByRole('button', { name: 'Create an Account' }).click();
        // Wait for redirect URL
        await page.waitForURL('**/.stripe.com/setup/**');
        await page.locator('[data-test-id="return-to-platform-link"]').click();
        await page.waitForURL('http://localhost:3000/dashboard');
        await expect(page.getByText('To launch your booking site')).toBeVisible()
    })
    test("should register business successfully with onboarding completed", async ({ page }) => {
        await page.getByRole('textbox', { name: 'Business Name' }).click();
        await page.getByRole('textbox', { name: 'Business Name' }).fill('LadyPlutoLooks');
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill('abijah.nez@gmail.com');
        await page.getByRole('textbox', { name: 'Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Password' }).fill('Abijah14!');
        await page.getByRole('button', { name: 'Create an Account' }).click();
        // Wait for redirect URL
        await page.waitForURL('**/.stripe.com/setup/**');
        await page.locator('[data-test-id="return-to-platform-link"]').click();
        await page.waitForURL('http://localhost:3000/dashboard');
        await expect(page.getByText('To launch your booking site')).toBeVisible()
    })
})
test.describe("Log in Business", () => {
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto("http://localhost:3000/login");
      });
    test("should login business successfully and redirect to dashboard with onboarding incomplete", async ({ page }) => {
       // Login flow without onboarding complete
    })
    test("should login business successfully and redirect to dashboard with onboarding completed", async ({ page }) => {
        // Login flow with onboarding completed
     })
})
