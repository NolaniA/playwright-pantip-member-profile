import fs from 'fs';

import { test as base } from '@playwright/test';


type AuthFixture = {
    memberId: string;

    pantipToken: string;
};

const authData = JSON.parse( fs.readFileSync('auth.data.json', 'utf-8') );


export const test = base.extend<AuthFixture> ({
    memberId: async ( {}, use ) => {
        await use( authData.memberId );
    },
    pantipToken: async ( {}, use ) => {
        await use( authData.pantipToken );
    }
});

export const expect = test.expect;