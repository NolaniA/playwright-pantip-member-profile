import { test, expect } from '../../../fixtures/files.fixture';
import { 
  dialogErrorUploadLargeFile, 
  dialogConfirmDeleteImage, 
  deleteProfileImage, 
  dialogErrorDeleteImageFail, 
  setupProfileImage, 
  verifyProfileImage, 
  uploadProfileImage, 
  dialogErrorUploadInvalidFile, 
  dialogSaveProfileImageFail,
  confirmUploadImage,
  clickSaveImage,
  uploadImage,
  dialogModifyProfileImageRotate,
  dialogModifyProfileImageZoom
} from '../../../helpers/profile.avatar.helper';

test.setTimeout(15000);

test.describe('Profile Avatar', () => {

  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' } );
    await expect(page).toHaveURL(/\/settings\/profile/);
  });
  


  test('delete image profile with offline', async ({ page, context, validFile }) => {

    // setup - upload image first
    const avatar = await setupProfileImage(page, validFile);

    // simulate offline mode
    await context.setOffline(true);
    
    // delete image and confirm delete
    await deleteProfileImage(page);
    await dialogConfirmDeleteImage(page, false, true, false);
    await dialogErrorDeleteImageFail(page);
    
    // restore online mode
    await context.setOffline(false);

    // verify image still exist
    await verifyProfileImage(page, avatar);

  });


  test('delete image profile and cancel', async ({ page, validFile }) => {


    // setup - upload image first
    const avatar = await setupProfileImage(page, validFile);

    // delete image and cancel delete
    await deleteProfileImage(page);
    await dialogConfirmDeleteImage(page, true, false, false);

    // verify image still exist
    await verifyProfileImage(page, avatar);
    
  });


  test('delete image profile successfully', async ({ page, validFile }) => {


    // setup - upload image first
    await setupProfileImage(page, validFile);

    // delete image and confirm delete
    await deleteProfileImage(page);
    const avatar = await dialogConfirmDeleteImage(page, false, true, true);

    // verify image is deleted
    await verifyProfileImage(page, avatar);

  });

  test('upload image profile with large file', async ({ page, largeFile, validFile }) => {
    

    // setup - upload image first
    const avatar = await setupProfileImage(page, validFile);

    // try to upload image with large file
    await uploadProfileImage(page, largeFile);
    await dialogErrorUploadLargeFile(page, true);


    // verify image is not changed
    await verifyProfileImage(page, avatar);

  });


  test('upload image profile with invalid file', async ({ page, validFile, invalidFile }) => {

    // setup - upload image first
    const avatar = await setupProfileImage(page, validFile);
    

    // try to upload image with invalid file
    await uploadProfileImage(page, invalidFile);
    await dialogErrorUploadInvalidFile(page, true);
    



    // verify image is not changed
    await verifyProfileImage(page, avatar);
  });


  test('upload image profile with offline', async ({ page, validFile }) => {


    // setup - upload image first
    const avatar = await setupProfileImage(page, validFile);

    // simulate offline mode
    await page.context().setOffline(true);

    // try to upload image
    await uploadProfileImage(page, validFile);
    await clickSaveImage(page);
    await dialogSaveProfileImageFail(page);


    // restore online mode
    await page.context().setOffline(false);

    // verify image is uploaded successfully
    await verifyProfileImage(page, avatar);

  });

  test('upload image profile with valid file', async ({ page, validFile }) => {


    for (const file of validFile) {
      await uploadImage(page, file);
      await dialogModifyProfileImageZoom(page);
      await dialogModifyProfileImageRotate(page);
      const avatar = await confirmUploadImage(page);
      await verifyProfileImage(page, avatar);
    }
    
  });

});


