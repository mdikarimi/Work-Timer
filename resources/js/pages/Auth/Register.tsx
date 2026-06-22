import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FlashMessage from '../../components/FlashMessage';

type FlashBag = {
    message?: string | null;
    success?: string | null;
    status?: string | null;
};

type PageProps = {
    flash?: FlashBag;
};

export default function Register({}: PageProps) {
    const { flash, errors } = usePage().props as { flash?: FlashBag; errors: Record<string, string> };
    const form = useForm({ name: '', phone: '', password: '', password_confirmation: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/register', { preserveScroll: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#050a12' }}>
            <Head title="ثبت نام" />

            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 mb-4 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                        <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <p className="text-sm text-teal-400/70 mb-1">الف شاپ</p>
                    <h1 className="text-2xl font-black text-white">ایجاد حساب کاربری</h1>
                    <p className="text-sm text-slate-500 mt-1">برای شروع فرم زیر را پر کنید</p>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(20,184,166,0.08)] backdrop-blur-sm">
                    <FlashMessage flash={flash} />

                    {Object.values(errors || {}).length > 0 && (
                        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                            {Object.values(errors).map((err) => (
                                <div key={err}>{err}</div>
                            ))}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">نام کامل</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                placeholder="مثال: علی محمدی"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">شماره تلفن</label>
                            <input
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                dir="ltr"
                                placeholder="09xxxxxxxxx"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">رمز عبور</label>
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">تایید رمز عبور</label>
                            <input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full rounded-xl bg-teal-500 px-4 py-3 text-white font-bold shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-200 hover:bg-teal-400 hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {form.processing ? 'در حال ثبت...' : 'ثبت نام'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        حساب دارید؟{' '}
                        <Link href="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                            ورود
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
