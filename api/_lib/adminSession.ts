import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type AdminSessionPayload = {
    role: 'admin';
    exp: number;
};

const SESSION_COOKIE = process.env.SESSION_COOKIE || 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const loadLocalEnv = () => {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

        const [rawKey, ...rawValueParts] = trimmed.split('=');
        const key = rawKey.trim();
        const value = rawValueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

        if (!process.env[key] && key) {
            process.env[key] = value;
        }
    }
};

loadLocalEnv();

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'replace-this-in-production';

const base64UrlEncode = (value: string) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (data: string) => {
    return crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(data).digest('base64url');
};

const timingSafeEqual = (a: string, b: string) => {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
};

const parseCookies = (rawCookie?: string) => {
    if (!rawCookie) return {} as Record<string, string>;
    return rawCookie.split(';').reduce<Record<string, string>>((acc, token) => {
        const [key, ...rest] = token.trim().split('=');
        if (!key) return acc;
        acc[key] = decodeURIComponent(rest.join('='));
        return acc;
    }, {});
};

export const createAdminSessionToken = () => {
    const payload: AdminSessionPayload = {
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };

    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const signature = sign(payloadEncoded);
    return `${payloadEncoded}.${signature}`;
};

export const verifyAdminSessionToken = (token?: string | null): AdminSessionPayload | null => {
    if (!token) return null;

    const [payloadEncoded, signature] = token.split('.');
    if (!payloadEncoded || !signature) return null;

    const expectedSignature = sign(payloadEncoded);
    if (!timingSafeEqual(signature, expectedSignature)) return null;

    try {
        const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as AdminSessionPayload;
        if (payload.role !== 'admin') return null;
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
};

export const getAdminSessionFromRequest = (req: VercelRequest) => {
    const cookies = parseCookies(req.headers.cookie);
    return verifyAdminSessionToken(cookies[SESSION_COOKIE]);
};

export const setAdminSessionCookie = (res: VercelResponse, token: string) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${isProd ? '; Secure' : ''
        }`
    );
};

export const clearAdminSessionCookie = (res: VercelResponse) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`
    );
};

export const requireAdminSession = (req: VercelRequest, res: VercelResponse) => {
    const payload = getAdminSessionFromRequest(req);
    if (!payload) {
        res.status(401).json({ message: 'Unauthorized' });
        return null;
    }

    return payload;
};
