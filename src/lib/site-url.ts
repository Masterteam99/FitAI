// URL pubblico dell'app: stessa catena di fallback di lib/email.ts
export const SITE_URL = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
