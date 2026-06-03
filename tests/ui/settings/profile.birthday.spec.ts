import { test, expect } from "../../../fixtures/time.fixture";
import { 
    setupProfileBirthday,
    verifyProfileBirthday,
    clickBirthdaySection,
    dialogEditBirthday,
    dialogSelectDayBirthday,
    dialogSelectMonthBirthday,
    dialogSelectYearBirthday,
    confirmSaveBirthday,
    dialogErrorSettingProfile

} from "../../../helpers/profile.birthday.spec";

test.setTimeout(15000);

test.describe('Profile Birthday', () => {

  test.describe.configure({ mode: 'default' });


  test.beforeEach(async ({ page }) => {
  await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
  await expect(page).toHaveURL(/\/settings\/profile/);
  });

  test('edit birthday with offline', async ({ page, context, randomPastTime }) => {
      // setup birthday
      const birthday = await setupProfileBirthday(page); 

      await context.setOffline(true);

      await clickBirthdaySection(page);
      await dialogEditBirthday(page);
      await dialogSelectDayBirthday(page, randomPastTime);
      await dialogSelectMonthBirthday(page, randomPastTime);
      await dialogSelectYearBirthday(page, randomPastTime);
      await confirmSaveBirthday(page, false);
      await dialogErrorSettingProfile(page, true);

      await context.setOffline(false);

      // verify birthday still the same
      await verifyProfileBirthday(page, birthday);
  });

});