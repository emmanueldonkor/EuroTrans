import { Auth0Client } from '@auth0/nextjs-auth0/server';

function normalizeEnvValue(value?: string): string | undefined {
    if (!value) return undefined;

    const trimmed = value.trim().replace(/\r/g, "").replace(/\n/g, "");
    if (!trimmed) return undefined;

    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1).trim();
    }

    return trimmed;
}

const auth0Audience = normalizeEnvValue(process.env.AUTH0_AUDIENCE) ?? "https://eurotrans.api";
const auth0Scope = normalizeEnvValue(process.env.AUTH0_SCOPE)
    ?? "openid profile email offline_access read:shipments write:shipments read:trucks write:trucks read:employees write:employees";
const appBaseUrl = normalizeEnvValue(process.env.APP_BASE_URL);

export const auth0 = new Auth0Client({
    appBaseUrl,
    authorizationParameters: {
        audience: auth0Audience,
        scope: auth0Scope
    }
});

