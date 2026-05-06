import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
    const name = process.env.SESSION_COOKIE || 'admin_session';
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `${name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`);
    return res.status(200).json({ ok: true });
}
