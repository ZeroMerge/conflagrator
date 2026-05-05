import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

type PendingItem = {
    publicId: string;
    secureUrl: string;
    resourceType: 'image' | 'video';
    format?: string;
    bytes?: number;
    createdAt?: string;
};

const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
};

const LOCAL_ADMIN_SESSION_KEY = 'admin-session-local';

const Admin: React.FC = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    useEffect(() => {
        const verifySession = async () => {
            const localSession = sessionStorage.getItem(LOCAL_ADMIN_SESSION_KEY) === '1';

            if (localSession) {
                setAuthorized(true);
                setCheckingSession(false);
                return;
            }

            try {
                const response = await fetch('/api/admin/session', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    setAuthorized(false);
                    navigate('/', { replace: true });
                    return;
                }

                setAuthorized(true);
            } catch {
                if (sessionStorage.getItem(LOCAL_ADMIN_SESSION_KEY) === '1') {
                    setAuthorized(true);
                    return;
                }

                setAuthorized(false);
                navigate('/', { replace: true });
            } finally {
                setCheckingSession(false);
            }
        };

        verifySession();
    }, [navigate]);

    const fetchPending = async () => {
        if (!authorized) return;

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await fetch('/api/personal/pending', {
                credentials: 'include',
            });

            if (!response.ok) {
                // Try to parse JSON error body, but fall back to text if it's not JSON
                const body = await response.json().catch(async () => {
                    const txt = await response.text().catch(() => '');
                    return { message: txt };
                });
                throw new Error(body?.message || 'Failed to load pending uploads');
            }

            // Response is OK; attempt to parse JSON, but if the endpoint returns non-JSON
            // (for example when the dev server is serving source files instead of running
            // the API handler) present the raw text to help debugging.
            let body: any;
            try {
                body = await response.json();
            } catch (e) {
                const txt = await response.text().catch(() => '(no body)');
                throw new Error(`Non-JSON response from /api/personal/pending: ${txt.slice(0, 200)}`);
            }

            setItems(Array.isArray(body.items) ? body.items : []);
        } catch (err) {
            // If it's likely a dev-server issue, give an actionable hint
            const msg = err instanceof Error ? err.message : 'Failed to load pending uploads';
            const hint = msg.includes('Non-JSON response') || msg.includes('import {')
                ? 'Make sure the Vercel Postgres integration is attached to this project and that the API routes are deployed. The admin queue now reads from Postgres, not Cloudinary search.'
                : '';
            setError([msg, hint].filter(Boolean).join(' — '));
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authorized) {
            fetchPending();
        }
    }, [authorized]);

    const handleLogout = async () => {
        try {
            sessionStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
            await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            navigate('/', { replace: true });
        }
    };

    const approveItem = async (item: PendingItem) => {
        setApprovingId(item.publicId);
        setError(null);
        setMessage(null);

        try {
            const response = await fetch('/api/personal/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    publicId: item.publicId,
                    secureUrl: item.secureUrl,
                    resourceType: item.resourceType,
                    format: item.format,
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body?.message || 'Approval failed');
            }

            const body = await response.json();
            setItems(prev => prev.filter(entry => entry.publicId !== item.publicId));
            setMessage(`Approved and added to carousel as ${body.filename}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Approval failed');
        } finally {
            setApprovingId(null);
        }
    };

    if (checkingSession) {
        return (
            <section className="min-h-screen bg-deep-black text-off-white px-6 md:px-16 lg:px-24 py-24">
                <div className="max-w-6xl mx-auto font-dm text-white/60 text-sm">Checking admin session...</div>
            </section>
        );
    }

    if (!authorized) {
        return null;
    }

    return (
        <section className="min-h-screen bg-deep-black text-off-white px-6 md:px-16 lg:px-24 py-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <h1 className="font-dm font-black text-4xl md:text-6xl tracking-tighter leading-[0.9]">
                        PERSONAL UPLOAD<br />
                        <span className="text-conflagrator-red">ADMIN</span>
                    </h1>
                    <button
                        onClick={fetchPending}
                        disabled={loading}
                        className="h-11 px-5 border border-white/20 hover:border-white/40 disabled:opacity-40 text-xs uppercase tracking-widest font-dm"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="h-11 px-5 border border-conflagrator-red/50 text-conflagrator-red hover:bg-conflagrator-red/10 text-xs uppercase tracking-widest font-dm"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="border border-conflagrator-red/40 bg-conflagrator-red/10 p-4 mb-6 font-dm text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="border border-teal/40 bg-teal/10 p-4 mb-6 font-dm text-sm text-teal">
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="font-dm text-white/60 text-sm">Loading pending uploads...</div>
                )}

                {!loading && items.length === 0 && (
                    <div className="font-dm text-white/50 text-sm border border-white/10 p-6">
                        No pending uploads right now.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map(item => (
                        <article key={item.publicId} className="border border-white/10 bg-surface-black/40">
                            <div className="aspect-video bg-black/70 overflow-hidden">
                                {item.resourceType === 'video' ? (
                                    <video src={item.secureUrl} controls className="w-full h-full object-cover" />
                                ) : (
                                    <img src={item.secureUrl} alt={item.publicId} className="w-full h-full object-cover" loading="lazy" />
                                )}
                            </div>
                            <div className="p-4">
                                <p className="font-dm text-xs text-white/70 break-all">{item.publicId}</p>
                                <p className="font-dm text-[11px] text-white/45 mt-2">
                                    {item.resourceType.toUpperCase()} • {formatSize(item.bytes)}
                                </p>
                                <button
                                    onClick={() => approveItem(item)}
                                    disabled={approvingId === item.publicId}
                                    className="mt-4 w-full h-10 bg-conflagrator-red hover:bg-conflagrator-red/90 disabled:opacity-50 text-[11px] uppercase tracking-widest font-dm"
                                >
                                    {approvingId === item.publicId ? 'Approving...' : 'Approve to Carousel'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Admin;