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
    dialogErrorSettingProfile,
    dialogSelectFormatBirthday,
    dialogSelectShowBirthday

} from "../../../helpers/profile.birthday.helper";

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
    await dialogSelectYearBirthday(page, randomPastTime);
    await dialogSelectMonthBirthday(page, randomPastTime);
    await dialogSelectDayBirthday(page, randomPastTime);
    await confirmSaveBirthday(page, false);
    await dialogErrorSettingProfile(page, true);
    await dialogEditBirthday(page, true);

    await context.setOffline(false);

    // verify birthday still the same
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with future date', async ({ page, previousYear, futureTime }) => {

    await clickBirthdaySection(page);

    // select future date setup    
    await dialogSelectYearBirthday(page, previousYear);
    await dialogSelectMonthBirthday(page, previousYear);
    await dialogSelectDayBirthday(page, previousYear);

    // confirm save birthday with future date
    await dialogSelectMonthBirthday(page, futureTime);
    await dialogSelectDayBirthday(page, futureTime);
    await dialogSelectYearBirthday(page, futureTime);
    await dialogEditBirthday(page, false, futureTime);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with past date', async ({ page, randomPastTime }) => {

    await clickBirthdaySection(page);
    // select past date setup    
    await dialogSelectYearBirthday(page, randomPastTime);
    await dialogSelectMonthBirthday(page, randomPastTime);
    await dialogSelectDayBirthday(page, randomPastTime);

    // confirm save birthday with past date
    await dialogEditBirthday(page, false, randomPastTime);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with not show', async ({ page }) => {

    await clickBirthdaySection(page);
    await dialogSelectFormatBirthday(page, false, false, false, true);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with format day month year', async ({ page, randomPastTime }) => {

    await clickBirthdaySection(page);
    await dialogSelectFormatBirthday(page, true, false, false, false);
    await dialogSelectYearBirthday(page, randomPastTime);
    await dialogSelectMonthBirthday(page, randomPastTime);
    await dialogSelectDayBirthday(page, randomPastTime);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with format day month', async ({ page, randomPastTime }) => { 
    await clickBirthdaySection(page);
    await dialogSelectFormatBirthday(page, false, true, false, false);
    await dialogSelectMonthBirthday(page, randomPastTime);
    await dialogSelectDayBirthday(page, randomPastTime);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });

  test('edit birthday with format year', async ({ page, randomPastTime }) => { 
    await clickBirthdaySection(page);
    await dialogSelectFormatBirthday(page, false, false, true, false);
    await dialogSelectYearBirthday(page, randomPastTime);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);  
  });

  test('edit birthday with not show in profile', async ({ page, randomPastTime }) => {
    await setupProfileBirthday(page);
    await clickBirthdaySection(page);
    await dialogSelectMonthBirthday(page, randomPastTime);
    await dialogSelectShowBirthday(page, false);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);
  });
  
  test('edit birthday with show in profile', async ({ page, randomPastTime }) => {
    await setupProfileBirthday(page);
    await clickBirthdaySection(page);
    await dialogSelectYearBirthday(page, randomPastTime);
    await dialogSelectShowBirthday(page, true);
    const birthday = await confirmSaveBirthday(page);    
    await verifyProfileBirthday(page, birthday);  
  });

});