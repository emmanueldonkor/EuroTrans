import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
    authorizationParameters: {
        audience: 'https://eurotrans.api',
        scope: 'openid profile email offline_access read:shipments write:shipments read:trucks write:trucks read:employees write:employees'
    }
});

