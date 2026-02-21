import { Auth0Client } from '@auth0/nextjs-auth0/server';

const auth0Audience = process.env.AUTH0_AUDIENCE ?? "https://eurotrans.api";
const auth0Scope = process.env.AUTH0_SCOPE
    ?? "openid profile email offline_access read:shipments write:shipments read:trucks write:trucks read:employees write:employees";

export const auth0 = new Auth0Client({
    authorizationParameters: {
        audience: auth0Audience,
        scope: auth0Scope
    }
});

