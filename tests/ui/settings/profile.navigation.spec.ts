import { test, expect } from '../../../fixtures/auth.fixture';

test.setTimeout(15000);

test('go to settings/profile from button edit profile', async ({ page, memberId }) => {
  await page.goto(`/profile/${memberId}`, { waitUntil: "domcontentloaded" });

  const buttonEditProfile = page.getByRole('button', { name: 'แก้ไขโปรไฟล์' });
  await buttonEditProfile.waitFor( { state: 'attached' } );
  await buttonEditProfile.click();

  await expect(page).toHaveURL(/\/settings\/profile/);
});


test('go to settings/profile from direct url', async ({ page, memberId }) => {
  await page.goto(`/profile/${memberId}`, { waitUntil: "domcontentloaded" });
  await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
  await expect(page).toHaveURL(/\/settings\/profile/);

});

