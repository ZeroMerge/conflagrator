import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    const adminPw = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
    const sessionCookie = process.env.SESSION_COOKIE;

    // If we have a DB URL, try to actually connect
    let dbStatus = 'NOT SET ❌';
    let dbError = '';
    if (dbUrl) {
        try {
            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(dbUrl);
            await sql`SELECT 1`;
            dbStatus = 'Connected ✅';
        } catch (e: any) {
            dbStatus = 'URL set but connection FAILED ❌';
            dbError = e?.message || String(e);
        }
    }

    return res.status(200).json({
        DATABASE_URL: dbUrl ? 'SET ✅' : 'MISSING ❌',
        DATABASE_URL_prefix: dbUrl ? dbUrl.slice(0, 25) + '...' : 'n/a',
        db_connection: dbStatus,
        db_error: dbError || undefined,
        ADMIN_PASSWORD: adminPw ? 'SET ✅' : 'MISSING ❌',
        SESSION_SECRET: sessionSecret ? 'SET ✅' : 'MISSING ❌',
        SESSION_COOKIE: sessionCookie ? `SET: ${sessionCookie} ✅` : 'MISSING ❌',
    });
}
