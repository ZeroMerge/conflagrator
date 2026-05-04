import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const UNLOCK_KEY = 'admin-login-unlocked';
const LOCAL_ADMIN_SESSION_KEY = 'admin-session-local';
const LOCAL_ADMIN_PASSWORD = 'oreoluwa123';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unlocked = sessionStorage.getItem(UNLOCK_KEY) === '1';
        if (!unlocked) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const typedPassword = password.trim();

        try {
            if (typedPassword === LOCAL_ADMIN_PASSWORD) {
                sessionStorage.setItem(LOCAL_ADMIN_SESSION_KEY, '1');
                sessionStorage.removeItem(UNLOCK_KEY);
                navigate('/admin', { replace: true });
                return;
            }

            throw new Error('Login failed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen bg-deep-black text-off-white px-6 py-24 flex items-center justify-center">
            <form onSubmit={handleLogin} className="w-full max-w-md border border-white/10 bg-surface-black/50 p-6 md:p-8">
                <h1 className="font-dm font-black text-3xl tracking-tighter mb-2">ADMIN LOGIN</h1>
                <p className="font-dm text-xs uppercase tracking-widest text-white/40 mb-6">
                    Restricted access
                </p>

                <label htmlFor="admin-password" className="font-dm text-[11px] uppercase tracking-widest text-white/50">
                    Password
                </label>
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-2 w-full h-11 bg-black/40 border border-white/20 px-3 text-sm font-dm outline-none focus:border-conflagrator-red"
                    autoComplete="current-password"
                    required
                />

                {error && <p className="mt-3 text-sm font-dm text-conflagrator-red">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full h-11 bg-conflagrator-red text-off-white font-dm text-xs uppercase tracking-widest disabled:opacity-60"
                >
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </section>
    );
};

export default AdminLogin;