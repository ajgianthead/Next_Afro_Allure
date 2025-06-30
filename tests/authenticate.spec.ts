import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_ROLE_SECRET_KEY

const supabase = createClient(SUPABASE_URL!, SUPABASE_ROLE_KEY!, {
    auth: { persistSession: false },
});

test.describe("Register Business", () => {
    const email = `test_user+${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const businessName = `test_user+${Date.now()}`
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto("/register");
    });
    test("should register business successfully with incomplete onboarding", async ({ page }) => {
        await page.locator("#isBusiness").click();
        await page.getByRole('textbox', { name: 'Business Name' }).click();
        await page.getByRole('textbox', { name: 'Business Name' }).fill(businessName);
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill(email);
        await page.getByRole('textbox', { name: 'Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Password' }).fill(password);
        await page.getByRole('button', { name: 'Create an Account' }).click();
        // Wait for redirect URL
        await page.waitForURL('http://localhost:3000/onboarding/**');
        await page.waitForURL('https://connect.stripe.com/setup/**');
        await page.locator('[data-test-id="return-to-platform-link"]').click();
        await page.waitForURL('http://localhost:3000/dashboard');
        await expect(page.getByText('Dashboard')).toBeVisible()
        const { data: userList } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1,
        });

        const user = userList?.users?.[0];
        if (user) {
            await supabase.auth.admin.deleteUser(user.id);
        }
    })
})
test.describe("Log in Business", () => {
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto("/login");
    });
    test("should login business successfully and redirect to dashboard with onboarding incomplete", async ({ page }) => {
        // Login flow without onboarding complete
        await page.getByRole('switch', { name: 'Business Account' }).click();
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill('test_user+1751296477358@example.com');
        await page.getByRole('textbox', { name: 'Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Password' }).fill('TestPassword123!');
        await page.getByRole('button', { name: 'Sign In' }).click();
        // Wait for redirect URL
        await page.waitForURL('http://localhost:3000/dashboard');
        await expect(page.getByText('Dashboard')).toBeVisible()
    })

})


