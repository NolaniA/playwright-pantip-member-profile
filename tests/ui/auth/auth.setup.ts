import { test as setup } from '@playwright/test';
import { PantipLoginPage } from '../../../pages/pantip.login.page';
import fs from 'fs';

setup('authenticate', async ({ page }) => {

  const pantipLoginPage = new PantipLoginPage(page);
  const authData = await pantipLoginPage.loginUser(process.env.LOGIN_USER!, process.env.LOGIN_PASS!);

  await page.context().storageState({
    path: 'auth.json'
  });

  fs.writeFileSync('auth.data.json', JSON.stringify(authData, null, 2));

});