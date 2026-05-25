import { test, expect } from '../../../fixtures/files.fixture';
import { AvatarResponse } from '../../../types/avatar.type';

test.setTimeout(15000);

test('delete image profile with offline', async ({ page, context, validFile }) => {
  await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
  await expect(page).toHaveURL(/\/settings\/profile/);

  

  //setup
  const prefixSelectorImage = 'div[data-test-id="setting-profile-image"]';
  const buttonDeleteImage = page.locator(`${prefixSelectorImage} button.pt-del-profile-img.pt-block-invisible`);
  if (await buttonDeleteImage.count() != 0) {
    //upload image first
    const inputFile = page.locator(`${prefixSelectorImage} input#browse-img[type="file"]`);
    const randomIndex = Math.floor(Math.random() * validFile.length);
    const selectedFile = validFile[randomIndex];
    await inputFile.setInputFiles([selectedFile]);

    const [response] = 
      await Promise.all([

        page.waitForResponse('**/api/files-service/v1.0.0/image_upload/profile/upload**'),

        page.getByRole('button', { name: 'บันทึก' }).click()
      ]);


    expect(response.status()).toBe(200); 
    const avatarJson: AvatarResponse = await response.json() || {};

    


  }

  //test
  await context.setOffline(true);
  
  // Click    button.pt-del-profile-img
  //   Dialog Confirm Delete Image    confirm=${True}    wait_api_respone=${False}
  //   Dialog Error Delete Image Fail


  await context.setOffline(false);
});