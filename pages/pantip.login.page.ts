import {
  Page,
  Locator,
  expect,
} from '@playwright/test';


import { AuthResponse } from '../types/auth.type';

export class PantipLoginPage {

  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {

    this.page = page;

    this.usernameInput =
      page.getByPlaceholder(
        'ชื่อผู้ใช้ / อีเมล'
      );

    this.passwordInput =
      page.getByRole('textbox', {
        name: 'visibility_off'
      });

    this.submitButton =
      page.locator(
        'button[type="submit"]'
      );

  }

  async loginUser(
    user: string,
    pass: string
  ) {

    await this.page.goto(
      '/login',
      {
        waitUntil:
          'domcontentloaded'
      }
    );

    await this.usernameInput
      .fill(user);

    await this.passwordInput
      .fill(pass);

    const [response] = 
      await Promise.all([

        this.page.waitForResponse('**/nimda/firebase_auth_token**'),

        this.submitButton.click()

      ]);


    await expect(this.page)
      .not.toHaveURL(
        /\/login/
      );

    expect(response.status()).toBe(200);
    
    const body:AuthResponse = await response.json();

    return  {

      memberId: body.mid,

      pantipToken: body.token

    }


  }

}