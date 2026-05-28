import { AvatarResponse } from '../types/avatar.type';
import { expect } from '../fixtures/files.fixture';
import type { Page } from 'playwright';

const prefixSelectorImage = 'div[data-test-id="setting-profile-image"]';
	
export async function setupProfileImage(page: Page, validFile: string[] = []) { 
  //upload image first
	const inputFile = page.locator(`${prefixSelectorImage} input#browse-img[type="file"]`);
	const randomIndex = Math.floor(Math.random() * validFile.length);
	const selectedFile = validFile[randomIndex];
	await inputFile.setInputFiles(selectedFile);

	// zoom in-out image
	await dialogModifyProfileImage(page);

	// save image and wait for response
	const [response] = 
		await Promise.all([

			page.waitForResponse('**/api/files-service/v1.0.0/image_upload/profile/upload**'),

			page.getByRole('button', { name: 'บันทึก' }).click()
		]);


	expect(response.status()).toBe(200); 
	const json = await response.json();
	const avatarJson: AvatarResponse = json.data;
	return avatarJson;
}

export async function dialogModifyProfileImage(page: Page, zoom_in: boolean = false, zoom_out: boolean = false) {	

	const dialog = page.locator('div[data-test-id="dialog-modify-profile-image"]');
	await dialog.waitFor({ state: 'attached' });
	const min = await dialog.locator('input#zoom-slider').getAttribute('min');
	const max = await dialog.locator('input#zoom-slider').getAttribute('max');
	const step = await dialog.locator('input#zoom-slider').getAttribute('step');	

	if (zoom_in) {
		for (let i = Number(min); i <= Number(max); i += Number(step)) {
			const zoom = String(i).replace('.0', '');	
			await dialog.locator('input#zoom-slider').fill(zoom);
			await expect(dialog.locator('input#zoom-slider')).toHaveAttribute('value', zoom);
		}
	}

	if (zoom_out) {
		for (let i = Number(max); i >= Number(min); i -= Number(step)) {
			const zoom = String(i).replace('.0', '');	
			await dialog.locator('input#zoom-slider').fill(zoom);
			await expect(dialog.locator('input#zoom-slider')).toHaveAttribute('value', zoom);
		}
	}
	
	// random zoom
	const randomZoom = (Math.random() * (Number(max) - Number(min)) + Number(min)).toFixed(1);
	const zoom = String(randomZoom).replace('.0', '');
	await dialog.locator('input#zoom-slider').fill(zoom);
	await expect(dialog.locator('input#zoom-slider')).toHaveAttribute('value', zoom);


}



export async function verifyProfileImage(page: Page, avatar: AvatarResponse) {

	const avatarUrlDefault: string = 'https://stg.ptcdn.info/images/avatar_member_default.png';

	// large avatar in profile page
	const image = page.locator(`${prefixSelectorImage} img`);
	await image.waitFor({ state: 'attached' });
	await expect(image).toHaveAttribute('src', avatar.avatar.large || avatarUrlDefault);

	// medium avatar in navbar
	const navbarImage = page.locator('a.gtm-main-nav li.pt-user__avatar img');
	await navbarImage.waitFor({ state: 'attached' });
	await expect(navbarImage).toHaveAttribute('src', avatar.avatar.medium || avatarUrlDefault);
}

export async function deleteProfileImage(page: Page) {
	const buttonDeleteImage = page.locator(`${prefixSelectorImage} button.pt-del-profile-img`);
	await buttonDeleteImage.waitFor({ state: 'attached' });
	await buttonDeleteImage.click();
}


export async function dialogConfirmDeleteImage(page: Page, close: boolean = false, confirm: boolean = false, wait_api_response: boolean = true) {

	const dialog = page.locator('div[data-test-id="dialog-confirm-delete-image"]');
	await dialog.waitFor({ state: 'attached' });
	await dialog.locator('div.pt-dialog__heading h5').innerText().then((text) => {
		expect(text).toBe('ยืนยันการลบ');
	});

	await dialog.locator('div.pt-dialog__content').innerText().then((text) => {
		expect(text).toBe('หากยืนยันดำเนินการนี้ รูปโปรไฟล์เดิมจะไม่แสดงในหน้าโปรไฟล์อีกต่อไป');
	});	

	await dialog.locator('div.pt-dialog__bottom button.btn-primary').innerText().then((text) => {
		expect(text).toBe('ตกลง');
	});

	await dialog.locator('div.pt-dialog__bottom button.btn-secondary').innerText().then((text) => {
		expect(text).toBe('ยกเลิก');
	});		

	if (close) {
		const closeOption = Math.floor(Math.random() * 3);		
		if (closeOption === 0) {
			await dialog.locator('div.pt-dialog__heading a i').click();
		} else if (closeOption === 1) {
			await dialog.locator('div.pt-dialog__bottom button.btn-secondary').click();
		} else {
			await page.keyboard.press('Escape');
		}		
	}

	if (confirm) {
		if (wait_api_response) {
			const [response] = await Promise.all([
				page.waitForResponse('**/api/files-service/v1.0.0/image_upload/profile/delete'),
				dialog.locator('div.pt-dialog__bottom button.btn-primary').click()
			]);
			expect(response.status()).toBe(200);
			const json = await response.json();
			const avatarJson: AvatarResponse = json.data;

			return avatarJson;

		}else {

			await dialog.locator('div.pt-dialog__bottom button.btn-primary').click();

		}
	}	
	await expect(dialog).toBeHidden();	

	return {
					avatar: {
						original: '',
						large: '',
						medium: '',
						small: ''
				}
			} as AvatarResponse;
}

		
		


export async function dialogErrorDeleteImageFail(page: Page, close: boolean = true) {

	const dialog = page.locator('div[data-test-id="dialog-error-delete-image-fail"]');
	await dialog.waitFor({ state: 'attached' });
	await dialog.locator('div.pt-dialog__heading h5').innerText().then((text) => {
		expect(text).toBe('ลบรูปไม่สำเร็จ');
	});
	await dialog.locator('div.pt-dialog__content').innerText().then((text) => {
		expect(text).toBe('ขออภัยมีบางอย่างผิดพลาด ทำให้ลบรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้งในภายหลัง');
	});

	await dialog.locator('div.pt-dialog__bottom button').innerText().then((text) => {
		expect(text).toBe('ตกลง');
	});

	if (close) {
		const closeOption = Math.floor(Math.random() * 3);		
		if (closeOption === 0) {
			await dialog.locator('div.pt-dialog__heading a i').click();
		} else if (closeOption === 1) {
			await dialog.locator('div.pt-dialog__bottom button').click();
		} else {
			await page.keyboard.press('Escape');
		}		
	}
	await expect(dialog).toBeHidden();


}


// export async function uploadProfileImage(page: Page, filePath: string) {
// 	const inputFile = page.locator(`${prefixSelectorImage} input#browse-img[type="file"]`);
// 	await inputFile.setInputFiles(filePath);	

// }

export async function dialogErrorUploadInvalidFile(page: Page, close:boolean = true) {
	const dialog = page.locator('div[data-test-id="dialog-error-not-allow-file"]');
	await	dialog.locator('div.pt-dialog__heading h5').innerText().then((text) => {
    expect(text).toBe('เกิดข้อผิดพลาด')
  });

	await	dialog.locator('div.pt-dialog__content').innerText().then((text) => {
    expect(text).toBe('ประเภทไฟล์ที่เลือกไม่ถูกต้อง ระบบรองรับเฉพาะไฟล์ประเภท .jpg, .jpeg, .png, .apng, .webp, .gif, .heic และ .heif เท่านั้น')
  });

  await dialog.locator('div.pt-dialog__bottom button').waitFor({ state:'attached' });
  await dialog.locator('div.pt-dialog__heading a').waitFor({ state:'attached' });

  if (!close)  return;


  const closeOption = Math.floor(Math.random() * 3);		
  if (closeOption === 0) {
    await dialog.locator('div.pt-dialog__bottom button').click();
  } else if (closeOption === 1) {
    await dialog.locator('div.pt-dialog__heading a').click();
  } else {
    await page.keyboard.press('Escape');
  }


	
}


export async function dialogErrorUploadLargeFile(page:Page, close:boolean = true) {
  
  await page.locator('div.pt-dialog__heading h5').innerText().then((text) =>{
    expect(text).toBe('ไม่สามารถเลือกไฟล์นี้ได้')
  });

  await page.locator('div.pt-dialog__content')
    .getByText('ไม่สามารถเลือกไฟล์นี้ได้ เนื่องจากมีขนาดใหญ่เกิน 20MB')
    .waitFor({ state:'attached'})

  await page.locator('div.pt-dialog__bottom button').waitFor({ state:'attached'})
  await page.locator('div.pt-dialog__heading a').waitFor({ state:'attached'})


  if (!close) return;

  const closeOption = Math.floor(Math.random() * 3);		
  if (closeOption === 0) {
    await page.locator('div.pt-dialog__bottom button').click();
  } else if (closeOption === 1) {
    await page.locator('div.pt-dialog__heading a').click();
  } else {
    await page.keyboard.press('Escape');
  }


}

export async function dialogEditProfileImage(page: Page, close:boolean = false, confirm:boolean = false, wait_api_response:boolean = true) {

  const dialog = page.locator('div[data-test-id="dialog-modify-profile-image"]');

  dialog.locator('div.pt-dialog__heading > h5').innerText().then((text) => {
    expect(text).toBe('เปลี่ยนภาพโปรไฟล์')
  });

  dialog.locator('div.pt-dialog__heading a.pt-sm-toggle-show i').innerText().then((text) => {
    expect(text).toBe('clear')
  });

  await dialog.locator('div.pt-dialog__heading a[title="ย้อนกลับ"]').waitFor({ state: 'attached' });
  await dialog.locator('div.pt-dialog__heading button[title="บันทึก"]').waitFor({ state: 'attached' });
  await dialog.locator('div.pt-dialog__content div.img-thumbnail').waitFor({ state: 'attached' });

  dialog.locator('div.pt-dialog__content div.pt-cuztomize_img_tool label[for="zoom-slider"]').innerText().then((text) => {
    expect(text).toBe('ขยาย');
  });

  const value = await dialog.locator('div.pt-dialog__content div.pt-cuztomize_img_tool input').getAttribute('value');
  await expect(dialog.locator('div.pt-dialog__content div.pt-cuztomize_img_tool input')).toHaveAttribute('outerHTML', `<input id="zoom-slider" type="range" min="0.8" max="3" step="0.1" value="${value}">`); 

  dialog.locator('a[title="หมุน 90˚"]').innerHTML().then((html) => {
    expect(html).toBe('<span><i class="material-icons">rotate_90_degrees_ccw</i></span><span class="caption">หมุน 90˚</span>');
  });

  await dialog.locator('div.pt-dialog__bottom button[title="บันทึก"]').waitFor({ state: 'attached' });  

  const viewportSize = await page.viewportSize();

  if (close) {  
    if (viewportSize && viewportSize.width > 575) {
      const closeOption = Math.floor(Math.random() * 2);
      if (closeOption === 0) {
        await page.keyboard.press('Escape');
      } else {
        await dialog.locator('div.pt-dialog__heading a.pt-sm-toggle-show i').click();
      } 
    } else {
      await dialog.locator('div.pt-dialog__heading a[title="ย้อนกลับ"]').click();
    }
  }

  if (!confirm) return; 

  let waitUpload: Promise<unknown> | null = null;

  if (wait_api_response) {
    waitUpload = page.waitForResponse('**/api/files-service/v1.0.0/image_upload/profile/upload**');
  } 
  
  if (viewportSize && viewportSize.width > 575) {
    await dialog.locator('div.pt-dialog__bottom button[title="บันทึก"]').click();
  } else {
    await dialog.locator('div.pt-dialog__heading button[title="บันทึก"]').click();
  } 


  if (waitUpload) {
    await waitUpload;
  } 
  await page.waitForSelector('button.loading_linear-circle', { state: 'detached', timeout: 120000 });

  
  
}

// Dialog Edit Profile Image
//     [Arguments]    ${close_dialog}=${False}    ${confirm_save}=${False}    ${wait_api_respone}=${True}
//     ${prefix_selector}    Set Variable    div[data-test-id="dialog-modify-profile-image"]

//     Get Property    ${prefix_selector} div.pt-dialog__heading > h5    
//         ...    innerText    
//         ...    equal    
//         ...    เปลี่ยนภาพโปรไฟล์

//     Get Property    ${prefix_selector} div.pt-dialog__heading a.pt-sm-toggle-show i    
//         ...    innerText    
//         ...    equal    
//         ...    clear

//     # mobile
//     Wait For Elements State    ${prefix_selector} div.pt-dialog__heading a[title="ย้อนกลับ"]    attached

//     Wait For Elements State    ${prefix_selector} div.pt-dialog__heading button[title="บันทึก"]    attached

//     Wait For Elements State    ${prefix_selector} div.pt-dialog__content div.img-thumbnail    attached

//     Get Property    ${prefix_selector} div.pt-dialog__content div.pt-cuztomize_img_tool label[for="zoom-slider"]
//         ...    innerText
//         ...    equal
//         ...    ขยาย


//     ${value}    Get Attribute    
//         ...    ${prefix_selector} div.pt-dialog__content div.pt-cuztomize_img_tool input     
//         ...    value    

//     Get Property    ${prefix_selector} div.pt-dialog__content div.pt-cuztomize_img_tool input    
//         ...    outerHTML    
//         ...    equal    
//         ...    <input id="zoom-slider" type="range" min="0.8" max="3" step="0.1" value="${value}">

//     Get Property    ${prefix_selector} a[title="หมุน 90˚"]    
//         ...    innerHTML    
//         ...    equal    
//         ...    <span><i class="material-icons">rotate_90_degrees_ccw</i></span><span class="caption">หมุน 90˚</span>

//     Wait For Elements State    ${prefix_selector} div.pt-dialog__bottom button[title="บันทึก"]    attached

//     ${width_screen}    Get Viewport Size    width

//     IF    ${close_dialog}
//         IF    ${width_screen} > ${575}
//             ${close}    Evaluate    random.randint(0,1)
//             Run Keyword If    ${close} == ${0}    
//                 ...    Keyboard Key    press    Escape
//             ...    ELSE    Click    ${prefix_selector} div.pt-dialog__heading a.pt-sm-toggle-show i
//         ELSE
//             Click    ${prefix_selector} div.pt-dialog__heading a[title="ย้อนกลับ"]
//         END
//     END

//     Return From Keyword If    not ${confirm_save}    
    

//     ${wait_upload}    Run Keyword If    ${wait_api_respone}
//     ...    Promise To    Wait For Response    **/api/files-service/v1.0.0/image_upload/profile/upload**

//     Run Keyword If    ${width_screen} > ${575}    
//         ...    Click    ${prefix_selector} div.pt-dialog__bottom button[title="บันทึก"]
//     ...    ELSE    Click    ${prefix_selector} div.pt-dialog__heading button[title="บันทึก"]

    
//     Wait Until Keyword Succeeds    2m    0.01s    Wait For Elements State    button.loading_linear-circle    detached


//     Set Test Variable    ${PROMISE_UPLOAD}    ${wait_upload}


export async function uploadProfileImage(page: Page, file:string[] = []) {
  const inputFile = page.locator(`${prefixSelectorImage} input#browse-img[type="file"]`);
  const randomIndex = Math.floor(Math.random() * file.length);
  const selectedFile = file[randomIndex];
  await inputFile.setInputFiles(selectedFile);

}



// Dialog Save Profile Image Fail
//     [Arguments]    ${close_dialog}=${True}    
//     ${prefix_selector}    Set Variable    div[data-test-id="dialog-upload-profile-image-fail"]

//     Get Property    ${prefix_selector} div.pt-dialog__heading h5    
//         ...    innerText    
//         ...    equal    
//         ...    อัปโหลดรูปไม่สำเร็จ

//     Wait For Elements State    ${prefix_selector} div.pt-dialog__content >> text=ขออภัยมีบางอย่างผิดพลาด ทำให้อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้งในภายหลัง    attached

//     # Get Property    div.pt-dialog__content    
//     #     ...    innerText    
//     #     ...    equal    
//     #     ...    ขออภัยมีบางอย่างผิดพลาด ทำให้อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้งในภายหลัง

//     Wait For Elements State    ${prefix_selector} div.pt-dialog__bottom button >> text=ตกลง    attached
//     Wait For Elements State    ${prefix_selector} div.pt-dialog__heading a i    attached

//     Return From Keyword If    not ${close_dialog}

//     # close dialog
//     ${width_screen}    Get Viewport Size    width
//     ${n}    Set Variable If    ${width_screen} > ${575}    
//         ...    2    1

//     ${close}    Evaluate    random.randint(0, ${n})

//     Run Keyword If    ${close} == ${0}
//         ...    Click    ${prefix_selector} div.pt-dialog__bottom button >> text=ตกลง
//     ...    ELSE IF    ${close} == ${1}    
//         ...    Click    ${prefix_selector} div.pt-dialog__heading a i
//     ...    ELSE
//         ...    Keyboard Key    press    Escape