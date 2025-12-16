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

export default function Login({}: PageProps) {
    const { flash, errors } = usePage().props as { flash?: FlashBag; errors: Record<string, string> };
    const form = useForm({ phone: '', password: '', remember: false });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/login', { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <Head title="ورود" />
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">سیستم حضور و غیاب</p>
                    <h1 className="text-2xl font-black text-gray-900">ورود به حساب</h1>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <FlashMessage flash={flash} />

                    {Object.values(errors || {}).length > 0 && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {Object.values(errors).map((err) => (
                                <div key={err}>{err}</div>
                            ))}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={submit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">شماره تلفن</label>
                            <input
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                dir="ltr"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">رمز عبور</label>
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            مرا به خاطر بسپار
                        </label>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white font-semibold shadow-sm transition hover:bg-blue-600 disabled:opacity-50"
                        >
                            ورود
                        </button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        حساب ندارید؟{' '}
                        <Link href="/register" className="text-blue-700 font-semibold hover:text-blue-900">
                            ثبت نام
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
