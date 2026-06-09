import { test, expect } from '@playwright/test';
import { setupGender } from '../../../helpers/profile.gender.helper';


test.setTimeout(15000);

test.describe('Profile Gender', () => {

  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
    await expect(page).toHaveURL(/\/settings\/profile/);
  });

  test('men', async ({ page }) => {
    await setupGender(page);

  });
 





});