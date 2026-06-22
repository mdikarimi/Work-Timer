import { Link, useForm, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';

type PageLayoutProps = PropsWithChildren<{
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    hideNav?: boolean;
}>;

type SharedProps = {
    auth?: {
        user?: {
            name?: string;
        } | null;
    };
};

export default function PageLayout({ title, subtitle, actions, hideNav = false, children }: PageLayoutProps) {
    const { auth } = usePage().props as SharedProps;
    const { post, processing } = useForm({});

    const handleLogout = () => {
        post('/logout', { preserveScroll: true });
    };

    return (
        <div className="min-h-screen" style={{ background: '#050a12' }}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                {!hideNav && (
                    <header className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 px-6 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                {auth?.user?.name && (
                                    <p className="text-xs text-teal-400 mb-1">سلام، {auth.user.name}</p>
                                )}
                                <h1 className="text-xl font-black text-white">{title}</h1>
                                {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/50 transition-all duration-200"
                                    href="/"
                                >
                                    ورود / خروج
                                </Link>
                                <Link
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/50 transition-all duration-200"
                                    href="/attendance-list"
                                >
                                    گزارش روزانه
                                </Link>
                                <Link
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/50 transition-all duration-200"
                                    href="/admin"
                                >
                                    مدیریت نیروها
                                </Link>
                                {actions}
                                {auth?.user && (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50 transition-all duration-200"
                                    >
                                        خروج
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>
                )}

                {children}
            </div>
        </div>
    );
}
