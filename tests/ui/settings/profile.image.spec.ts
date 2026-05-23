import { test, expect } from '../../../fixtures/auth.fixture';

test.setTimeout(15000);

test('delete image profile with offline', async ({ page }) => {
  await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
  await expect(page).toHaveURL(/\/settings\/profile/);

});