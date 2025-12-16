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
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {!hideNav && (
                    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-500">{auth?.user?.name ? `سلام، ${auth.user.name}` : 'سیستم حضور و غیاب'}</p>
                            <h1 className="text-2xl font-black text-gray-900">{title}</h1>
                            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link className="px-4 py-2 text-sm font-medium rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50" href="/">
                                ورود / خروج
                            </Link>
                            <Link className="px-4 py-2 text-sm font-medium rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50" href="/attendance-list">
                                گزارش روزانه
                            </Link>
                            <Link className="px-4 py-2 text-sm font-medium rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50" href="/admin">
                                مدیریت نیروها
                            </Link>
                            {actions}
                            {auth?.user && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
                                >
                                    خروج
                                </button>
                            )}
                        </div>
                    </header>
                )}

                {children}
            </div>
        </div>
    );
}
