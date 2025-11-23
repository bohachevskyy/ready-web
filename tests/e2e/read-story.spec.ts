import { test, expect } from '@playwright/test';

test.describe('Story Reading Flow', () => {
  test('should sign in and read a story', async ({ page }) => {
    // Navigate to the app (will redirect to /login if not authenticated)
    await page.goto('/');

    // Wait for login page to load
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();

    // Click "Continue with Email" button
    await page.getByRole('button', { name: /continue with email/i }).click();

    // Fill in email
    await page.getByLabel(/email/i).fill('test@gmail.com');

    // Fill in password
    await page.getByLabel(/^password$/i).fill('password123');

    // Click "Sign In" button
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Wait for redirect to mode selection page
    await expect(page).toHaveURL('/');
    await expect(page.getByText(/choose your learning mode/i)).toBeVisible({ timeout: 10000 });

    // Click "Read Stories" card
    await page.getByText(/read stories/i).click();

    // Wait for story category selection page
    await expect(page).toHaveURL('/story/category');
    await expect(page.getByText(/choose your story domain/i)).toBeVisible();

    // Click on "History & Archaeology" category
    await page.getByText(/history & archaeology/i).click();

    // Wait for redirect to story reader
    await expect(page).toHaveURL(/\/story\/history/);

    // Wait for story to load (it might take time to generate)
    await expect(page.getByText(/reading practice/i)).toBeVisible({ timeout: 30000 });

    // Verify story content is visible (there should be text in the story card)
    const storyCard = page.locator('.text-lg.leading-relaxed');
    await expect(storyCard).toBeVisible({ timeout: 30000 });

    // Verify the Finish button is visible
    await expect(page.getByRole('button', { name: /finish/i })).toBeVisible();
  });
});
