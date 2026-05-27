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


export async function uploadProfileImage(page: Page, filePath: string) {
	const inputFile = page.locator(`${prefixSelectorImage} input#browse-img[type="file"]`);
	await inputFile.setInputFiles(filePath);	

}