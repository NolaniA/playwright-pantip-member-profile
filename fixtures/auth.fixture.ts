import fs from 'fs';
import { test as base } from '@playwright/test';

type AuthFixture = {
    memberId: string;
    pantipToken: string;
};

const authDataPath = 'auth.data.json';

if (!fs.existsSync(authDataPath)) {
    throw new Error('auth.data.json not found');
}

const authData = JSON.parse(
    fs.readFileSync(authDataPath, 'utf-8')
);

export const test = base.extend<AuthFixture>({
    memberId: async ({}, use) => {
        await use(authData.memberId);
    },

    pantipToken: async ({}, use) => {
        await use(authData.pantipToken);
    }
});

export const expect = test.expect;