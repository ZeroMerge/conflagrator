import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// All config from env vars directly — no fs/file reading on Vercel
const SESSION_SECRET = () =>
    process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'replace-this-in-production';
const SESSION_COOKIE = () => process.env.SESSION_COOKIE || 'admin_session';
const SESSION_TTL = 60 * 60 * 12;

const b64Encode = (v: string) => Buffer.from(v).toString('base64url');
const b64Decode = (v: string) => Buffer.from(v, 'base64url').toString('utf8');
const sign = (data: string) =>
    crypto.createHmac('sha256', SESSION_SECRET()).update(data).digest('base64url');

const parseCookies = (raw?: string): Record<string, string> => {
    if (!raw) return {};
    return raw.split(';').reduce<Record<string, string>>((acc, part) => {
        const [k, ...v] = part.trim().split('=');
        if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
        return acc;
    }, {});
};

export type AdminSession = { role: 'admin'; exp: number };

export const createAdminSessionToken = (): string => {
    const payload: AdminSession = { role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
    const encoded = b64Encode(JSON.stringify(payload));
    return `${encoded}.${sign(encoded)}`;
};

export const verifyAdminSessionToken = (token?: string | null): AdminSession | null => {
    if (!token) return null;
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expected = sign(encoded);
    const aBuf = Buffer.from(sig);
    const bBuf = Buffer.from(expected);
    if (aBuf.length !== bBuf.length || !crypto.timingSafeEqual(aBuf, bBuf)) return null;
    try {
        const payload = JSON.parse(b64Decode(encoded)) as AdminSession;
        if (payload.role !== 'admin') return null;
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
};

export const getAdminSession = (req: VercelRequest): AdminSession | null => {
    const cookies = parseCookies(req.headers.cookie as string | undefined);
    return verifyAdminSessionToken(cookies[SESSION_COOKIE()]);
};

export const setSessionCookie = (res: VercelResponse, token: string) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE()}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL}; SameSite=Lax${isProd ? '; Secure' : ''}`
    );
};

export const clearSessionCookie = (res: VercelResponse) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE()}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`
    );
};

export const requireAdmin = (req: VercelRequest, res: VercelResponse): AdminSession | null => {
    const session = getAdminSession(req);
    if (!session) {
        res.status(401).json({ message: 'Unauthorized' });
        return null;
    }
    return session;
};
