import { Page, expect } from "@playwright/test";
import { IGenderResponse } from "../types/gender.type";

const prefixSelectorGenderSection = 'a[data-test-id="setting-profile-gender"]';

export async function setupGender(page: Page) {
    await clickGenderSection(page);
    await dialogSelectGender(page);
    const genderData = await confirmSaveGender(page);
    return genderData;
}


export async function clickGenderSection(page: Page) {
  const sectionGender = page.locator(prefixSelectorGenderSection);
  await sectionGender.waitFor({ state: 'attached' });
  await sectionGender.click();
}

export async function dialogSelectGender(page: Page, gender: 'm' | 'f' | 'l' | 'u'| null = null): Promise<string> {

    const dialog = page.locator('div[data-test-id="dialog-setting-gender"]');
    await dialog.waitFor({ state: 'attached' }); 

    // const availableValues = ['f', 'm', 'l', 'u'];

    // const mappingGender = {
    //     'm': 2, // หญิง
    //     'f': 3, // ชาย
    //     'l': 4, // lgbtq+
    //     'u': 5  // ไม่ระบุ
    // };
    type Gender = 'm' | 'f' | 'l' | 'u';

    const availableValues: Gender[] = ['f', 'm', 'l', 'u'];

    const mappingGender: Record<Gender, number> = {
        m: 2,
        f: 3,
        l: 4,
        u: 5
    };

    if (!gender) {
        const currentGender = await dialog.locator('label.pt-profile-setting-gender input[checked]').getAttribute('value');
        const candidateValues = availableValues.filter( v => v !== currentGender );
        const randomValue = candidateValues[
            Math.floor(Math.random() * candidateValues.length)
        ];

        await dialog.locator(`section:nth-child(${mappingGender[randomValue]}) > label.pt-profile-setting-gender`).click();
        return randomValue;

    } else {
        await dialog.locator(`section:nth-child(${mappingGender[gender]}) > label.pt-profile-setting-gender`).click();
        return gender;
    };

}

export async function confirmSaveGender(page: Page, wait_api_respone:boolean = true): Promise<IGenderResponse> {

    const dialog = page.locator('div[data-test-id="dialog-setting-gender"]');
    const buttonConfirm = dialog.locator('button[title="บันทึกข้อมูลเพศ"]');
    await buttonConfirm.waitFor({ state: 'attached' }); 
    
    if (!wait_api_respone) {
        await buttonConfirm.click();
        return {
            data: {
                is_show: false,
                description: '',
                gender_display: '',
                items: []
            } 
        } as IGenderResponse;

    }

    const [response] = await Promise.all([
        page.waitForResponse('**/api/profiles-service/v1.1.0/profile/gender/update**'),
        buttonConfirm.click(),
    ]);

    const responseBody = await response.json();
    return responseBody as IGenderResponse;
}
