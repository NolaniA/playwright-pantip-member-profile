import { expect, thaiNow } from '../fixtures/time.fixture';
import type { Page } from 'playwright';
import { IBirthDayResponse } from '../types/birthday.type';
import dayjs from 'dayjs';

const currentTime = thaiNow();

const prefixSelectorBirthdaySection = 'a[data-test-id="setting-profile-birthday"]';

const fullThaiMonths = {
    "01":"มกราคม",
    "02":"กุมภาพันธ์",
    "03":"มีนาคม",
    "04":"เมษายน",
    "05":"พฤษภาคม",
    "06":"มิถุนายน",
    "07":"กรกฎาคม",
    "08":"สิงหาคม",
    "09":"กันยายน",
    "10":"ตุลาคม",
    "11":"พฤศจิกายน",
    "12":"ธันวาคม"
}



export async function verifyProfileBirthday(page: Page, birthday:IBirthDayResponse) {

  const birthdayShow = birthday.birthday.is_show;
  const birthdayDisplay = birthday.birthday.birthday_display
  const birthdayDescription = birthday.birthday.description

  const sectionBirthday = page.locator(prefixSelectorBirthdaySection);
  await sectionBirthday.waitFor({ state:'attached' });

  await sectionBirthday.locator('div.pt-title-field-edit-profile').innerText()
    .then((text) => {expect(text).toBe('วันเกิด')});

  expect( await sectionBirthday.locator('span.caption').innerText()).toBe(birthdayDescription);

  expect( await sectionBirthday.locator('h6.txt-secondary').innerText()).toBe(birthdayDisplay);


}


export async function setupProfileBirthday(page:Page): Promise<IBirthDayResponse> {
  await clickBirthdaySection(page);
  await dialogEditBirthday(page);
  await dialogSelectFormatBirthday(page);
  await dialogSelectShowBirthday(page);

  const birthdayData = await confirmSaveBirthday(page);

  return birthdayData;    
}

export async function clickBirthdaySection(page:Page) {
  await page.locator(prefixSelectorBirthdaySection).click();
}

export async function dialogEditBirthday(page:Page, 
  close:boolean = false, 
  expect_date: dayjs.Dayjs | null = null, 
  expect_show:boolean | null = null, 
  expect_format:'day_month_year' | 'day_month' | 'year' | 'not_show' | null = null) {

  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const dialog_title = dialog.locator('div.pt-dialog__heading');
  expect(await dialog_title.locator('h5').innerText()).toBe('วันเกิด');
  expect(await dialog_title.locator('a.pt-sm-toggle-hide i').innerText()).toBe('arrow_back');
  expect(await dialog_title.locator('a.pt-sm-toggle-show i').innerText()).toBe('clear');


  const dialog_content = dialog.locator('div.pt-dialog__content');
  await dialog_content.locator('text="วันเดือนปีเกิด"').waitFor({ state:'attached' });
  await dialog_content.locator('text="วัน"').waitFor({ state:'attached' });
  await dialog_content.locator('text="เดือน"').waitFor({ state:'attached' });
  await dialog_content.locator('text="ปี"').waitFor({ state:'attached' });
  await dialog_content.locator('text=แสดงวันเกิดในข้อมูลส่วนตัว').waitFor({ state:'attached' });

  await dialog.locator('button[title="บันทึกข้อมูลวันเกิด"]').waitFor({ state:'attached' }); 
  
  
  // await dialog.locator('form > div > section:nth-child(1) > label > select').locator('option[selected]').innerText()
  //   .then((text) => {expect(text).toBe('ไม่ระบุวันเกิด')});
  
  // await dialog.locator('div.row.pt-birthday-setting > div:nth-child(1) label.select').waitFor({ state:'attached' });
  // await dialog.locator('div.row.pt-birthday-setting > div:nth-child(2) label.select').waitFor({ state:'attached' });
  // await dialog.locator('div.row.pt-birthday-setting > div:nth-child(3) label.select').waitFor({ state:'attached' });
  // await dialog.locator('section:nth-child(3) > div.flexbox > div > label').waitFor({ state:'attached' });

  if (expect_format) {
    const value_format = expect_format === 'day_month_year' ? '1' : expect_format === 'day_month' ? '2' : expect_format === 'year' ? '4' : '3';
    await expect(dialog.locator('form > div > section:nth-child(1) select')).toHaveValue(value_format);
  }

  if (expect_date){
    const unixCurrentTime = currentTime.unix();
    const unixExpectTime = expect_date.unix();

    const displayTime = unixExpectTime > unixCurrentTime ? currentTime : expect_date;

    const yearDisplay = displayTime.year();
    const monthDisplay = displayTime.format('M');
    const dayDisplay = displayTime.date();
    console.log('yearDisplay', yearDisplay);
    console.log('monthDisplay', monthDisplay);
    console.log('dayDisplay', dayDisplay);

    expect(await page.getByLabel('-วัน-').inputValue()).toBe(dayDisplay.toString());
    expect(await page.getByLabel('-เดือน-').inputValue()).toBe(monthDisplay.toString());
    expect(await page.getByLabel('-ปี-').inputValue()).toBe(yearDisplay.toString()); 

  }

  if (expect_show !== null) {
    const isChecked = await dialog.locator('section:nth-child(3) > div.flexbox > div > label > input[type="checkbox"]').isChecked();
    expect(isChecked).toBe(expect_show);
  }

  if (!close) return;

  const width_screen = (await page.viewportSize())?.width ?? 0;
  const choice = Math.floor(Math.random() * 3);

  if (width_screen < 575) {
    await dialog.locator('div.pt-dialog__heading a.pt-sm-toggle-hide i').click();
  } else if (choice === 0) {
    await dialog.locator('div.pt-dialog__heading a.pt-sm-toggle-show i').click();
  } else {
    await page.keyboard.press('Escape');
  
  }
    
}

export async function confirmSaveBirthday(page:Page, wait_api_respone:boolean = true): Promise<IBirthDayResponse> {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');

  if(!wait_api_respone){
    await dialog.locator('button[title="บันทึกข้อมูลวันเกิด"]').click();
    return {
      birthday: {
        is_show: false,
        birthday_display: '',
        description: '',
        iso_date: '', 
        show_condition_items: []
      }
    } as IBirthDayResponse;
      
  }

  const [response] = await Promise.all([
    page.waitForResponse('**/api/profiles-service/v1.1.0/profile/birthday/update**'),
    dialog.locator('button[title="บันทึกข้อมูลวันเกิด"]').click()
  ]);

  return (await response.json()).data as IBirthDayResponse;

}


export async function dialogSelectFormatBirthday(
  page:Page, 
  day_month_year:boolean = false, 
  day_month:boolean = false, 
  year:boolean = false, 
  not_show:boolean = false) {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const select = dialog.locator('form > div > section:nth-child(1) select');

  const valueSelect = await select.inputValue();

  const availableValues = ['1', '2', '4'];
  // const availableValues = ['1', '2', '3', '4'];

  const candidateValues = availableValues.filter( v => v !== valueSelect );

  const randomValue = candidateValues[
      Math.floor(Math.random() * candidateValues.length)
    ];

  const value = day_month_year ? '1' : day_month ? '2' : year ? '4' : not_show ? '3' : randomValue;

  await select.selectOption({ value: value });
  await expect(select).toHaveValue(value);

  return value;


}

export async function dialogSelectShowBirthday(page:Page, show:boolean = false) {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const select = dialog.locator('form > div > section:nth-child(1) select');
  const valueSelect = await select.inputValue();

  if (valueSelect === '3') return;

  if (!show) return;

  const toggleShow = dialog.locator('input[data-test-id="show-birthday-status-selected"]');
  if (!(await toggleShow.isChecked())) {
    // await toggleShow.check();
    await toggleShow.click();
  }

  await expect(toggleShow).toBeChecked();

}

export async function dialogSelectDayBirthday(page:Page, target_date: dayjs.Dayjs) {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const selectDay = dialog.locator('div[data-test-id="day"] label.select > select');

  await selectDay.selectOption({ value: target_date.date().toString() });


}

export async function dialogSelectMonthBirthday(page:Page, target_date: dayjs.Dayjs) {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const selectDay = dialog.locator('div[data-test-id="month"] label.select > select');

  await selectDay.selectOption({ value: target_date.format('M').toString() });


}

export async function dialogSelectYearBirthday(page:Page, target_date: dayjs.Dayjs) {
  const dialog = page.locator('div[data-test-id="dialog-setting-birthday"]');
  await dialog.waitFor({ state:'attached' });

  const selectDay = dialog.locator('div[data-test-id="year"] label.select > select');

  await selectDay.selectOption({ value: target_date.year().toString() });


}

export async function dialogErrorSettingProfile(page:Page, close_dialog:boolean = false) {
  const dialog = page.locator('div[data-test-id$="-fail"]');
  await dialog.waitFor({ state:'attached' });

  expect(await dialog.locator('div.pt-dialog__heading h5').innerText()).toBe('เกิดข้อผิดพลาด');
  expect(await dialog.locator('div.pt-dialog__content').innerText()).toBe('ขออภัยไม่สามารถบันทึกได้ โปรดลองใหม่อีกครั้ง');

  await dialog.locator('div.pt-dialog__heading a i').waitFor({ state:'attached' });
  await dialog.locator('div.pt-dialog__bottom button >> text="ตกลง"').waitFor({ state:'attached' });

  if (!close_dialog) return;

  const width_screen = (await page.viewportSize())?.width ?? 0;
  const choice = Math.floor(Math.random() * 3);

  if (width_screen < 575) {
    await dialog.locator('div.pt-dialog__heading a.pt-sm-toggle-hide i').click();
  } else if (choice === 0) {
    await dialog.locator('div.pt-dialog__heading a i').click();
  } else if (choice === 1) {
    await dialog.locator('div.pt-dialog__bottom button >> text="ตกลง"').click();
  } else {
    await page.keyboard.press('Escape');
  }


}





// Dialog Edit Birthday
//     [Arguments]    ${close_dialog}=${False}    ${confirm_save}=${False}    ${wait_api_respone}=${True}

//     ${dialog_open}    Run Keyword And Return Status    
//         ...    Get Element Count    
//         ...    div.pt-dialog__heading h5 >> text="วันเกิด"   
//         ...     ==    1

//     Run Keyword If    not ${dialog_open}    Click    a[title="ข้อมูลวันเกิด"] h6.txt-ellipsis
    
//     Get Element Count    div.pt-dialog__heading h5 >> text="วันเกิด"    ==    1
//     # Get Property    div.pt-dialog__heading h5    innerText    equal    วันเกิด
//     Get Property    div.pt-dialog__heading a.pt-sm-toggle-hide i    innerText    equal    arrow_back
//     Get Property    div.pt-dialog__heading a.pt-sm-toggle-show i    innerText    equal    clear
//     Wait For Elements State    div.pt-dialog__content >> text="วันเดือนปีเกิด"    attached
//     Wait For Elements State    div.pt-dialog__content >> text="วัน"    attached
//     Wait For Elements State    div.pt-dialog__content >> text="เดือน"    attached
//     Wait For Elements State    div.pt-dialog__content >> text="ปี"    attached
//     Wait For Elements State    div.pt-dialog__content >> text="แสดงวันเกิดในข้อมูลส่วนตัว"    attached
//     Wait For Elements State    button[title="บันทึกข้อมูลวันเกิด"]    attached


//     # เพิ่มการเช็คข้อมูลจากapi

//     ${is_default}    Run Keyword And Return Status    
//         ...    Get Selected Options    
//         ...    form > div > section:nth-child(1) > label > select    
//         ...    label    
//         ...    equal    
//         ...    ไม่ระบุวันเกิด

//     # Log    2${is_default}    console=${True}

//     ${class}    Set Variable If    ${is_default}    .state-disabled    ${EMPTY}

//     Wait For Elements State    div.row.pt-birthday-setting > div:nth-child(1) label.select${class}    attached
//     Wait For Elements State    div.row.pt-birthday-setting > div:nth-child(2) label.select${class}    attached
//     Wait For Elements State    div.row.pt-birthday-setting > div:nth-child(3) label.select${class}    attached
//     Wait For Elements State    section:nth-child(3) > div.flexbox > div > label${class}    attached

//     IF    ${close_dialog}
        
//         ${width_screen}    Get Viewport Size    width
//         ${close}    Evaluate    random.randint(0, 1)

//         Run Keyword If    ${width_screen} < ${575}    
//             ...    Click    div.pt-dialog__heading a.pt-sm-toggle-hide i
//         ...    ELSE IF    ${close} == ${0}    
//             ...    Click    div.pt-dialog__heading a.pt-sm-toggle-show i
//         ...    ELSE    
//             ...    Keyboard Key    press    Escape
//     END
    
//     IF    ${confirm_save}
//         ${wait_update}    Run Keyword If    ${wait_api_respone}    
//             ...    Promise To    Wait For Response    **/api/profiles-service/v1.1.0/profile/birthday/update**
//         Click    button[title="บันทึกข้อมูลวันเกิด"]

//         Set Test Variable    ${PROMISE_BIRTHDAY}    ${wait_update}
//     END