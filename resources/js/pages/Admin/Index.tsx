import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

type Worker = {
    id: number;
    name: string;
    code?: string | null;
    created_at?: string;
};

type FlashBag = {
    message?: string | null;
    success?: string | null;
    status?: string | null;
};

type PageProps = {
    workers: Worker[];
    flash?: FlashBag;
};

export default function AdminIndex({ workers }: PageProps) {
    const { flash } = usePage().props as { flash?: FlashBag };
    const form = useForm({ name: '', password: '' });
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const editForm = useForm({ name: '', password: '' });
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const submitWorker = (e: FormEvent) => {
        e.preventDefault();
        form.post('/workers', { preserveScroll: true, onSuccess: () => form.reset('name', 'password') });
    };

    const removeWorker = (id: number, name: string) => {
        if (!window.confirm(`آیا از حذف «${name}» مطمئن هستید؟`)) return;
        router.delete(`/workers/${id}`, { preserveScroll: true });
    };

    const openEdit = (worker: Worker) => {
        setEditingWorkerId(worker.id);
        editForm.setData('name', worker.name);
        editForm.setData('password', '');
        setShowEditModal(true);
    };

    const closeEdit = () => {
        setShowEditModal(false);
        setEditingWorkerId(null);
        editForm.reset('name', 'password');
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingWorkerId) return;
        editForm.put(`/workers/${editingWorkerId}`, { preserveScroll: true, onSuccess: () => closeEdit() });
    };

    const formatDate = (value?: string) => {
        if (!value) return '';
        return moment(value).locale('fa').format('jYYYY/jMM/jDD');
    };

    const getRelativeTime = (value?: string) => {
        if (!value) return '';
        const date = new Date(value);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMinutes < 1) return 'همین الان';
        if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
        if (diffHours < 24) return `${diffHours} ساعت پیش`;
        if (diffDays < 7) return `${diffDays} روز پیش`;
        return formatDate(value);
    };

    return (
        <>
            <Head title="مدیریت نیروهای کاری - الف شاپ" />

            <div className="min-h-screen" style={{ background: '#050a12' }}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(20,184,166,0.05)] backdrop-blur-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center justify-between lg:block">
                                <div>
                                    <p className="text-xs text-teal-400/70 mb-1">الف شاپ</p>
                                    <h1 className="text-2xl font-black text-white md:text-3xl">مدیریت پرسنل</h1>
                                    <p className="hidden text-sm text-slate-400 lg:block mt-1">مدیریت، ویرایش و مشاهده گزارش‌های پرسنل</p>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2.5 transition-all duration-200 hover:border-teal-500/50 lg:hidden"
                                    onClick={() => setShowMobileMenu((s) => !s)}
                                >
                                    <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Desktop Nav */}
                            <div className="hidden items-center gap-3 lg:flex">
                                <Link href="/finance/list" className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm font-bold text-purple-300 transition-all duration-200 hover:bg-purple-500/20 hover:border-purple-400/50">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    امور مالی
                                </Link>
                                <Link href="/attendance-list" className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-bold text-blue-300 transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-400/50">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    گزارش روزانه
                                </Link>
                                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-5 py-2.5 text-sm font-bold text-teal-300 transition-all duration-200 hover:bg-teal-500/20 hover:border-teal-400/50">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                                    </svg>
                                    ورود و خروج
                                </Link>
                                <form method="POST" action="/logout" className="inline-block">
                                    <input type="hidden" name="_token" value={(window as any).csrf_token} />
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-300 transition-all duration-200 hover:bg-rose-500/20">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        خروج
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {showMobileMenu && (
                            <div className="animate-fadeIn mt-5 border-t border-slate-700/50 pt-5 lg:hidden">
                                <div className="space-y-2">
                                    {[
                                        { href: '/finance/list', label: 'امور مالی', color: 'purple' },
                                        { href: '/attendance-list', label: 'گزارش روزانه', color: 'blue' },
                                        { href: '/', label: 'ورود و خروج', color: 'teal' },
                                    ].map(({ href, label, color }) => (
                                        <Link key={href} href={href} onClick={() => setShowMobileMenu(false)}
                                            className={`flex w-full items-center justify-between rounded-xl border border-${color}-500/30 bg-${color}-500/10 px-4 py-3 font-bold text-${color}-300 transition-all duration-200 hover:bg-${color}-500/20`}
                                        >
                                            <span>{label}</span>
                                        </Link>
                                    ))}
                                    <form method="POST" action="/logout" className="w-full">
                                        <input type="hidden" name="_token" value={(window as any).csrf_token} />
                                        <button type="submit" onClick={() => setShowMobileMenu(false)} className="flex w-full items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-bold text-rose-300 transition-all duration-200 hover:bg-rose-500/20">
                                            <span>خروج</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Flash */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="animate-fadeIn mb-6 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {flash?.message || flash?.success}
                                </div>
                                <button onClick={() => setShowSuccessMessage(false)} className="text-teal-500 hover:text-teal-300">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Worker Form */}
                    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                        <h2 className="mb-5 pb-4 border-b border-slate-700/50 text-lg font-bold text-white">
                            افزودن پرسنل جدید
                        </h2>
                        <form onSubmit={submitWorker} className="space-y-4 md:flex md:gap-4 md:space-y-0 md:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-400">نام کامل پرسنل</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="مثال: علی محمدی"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-400">رمز عبور</label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="رمز عبور پرسنل"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-7 py-3 font-bold text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-200 hover:bg-teal-400 hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 md:w-auto"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    افزودن
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Workers List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">لیست پرسنل</h2>
                            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                                {workers.length} نفر
                            </span>
                        </div>

                        <div className="p-5">
                            {workers.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-4 inline-flex rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                                        <svg className="h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400 font-medium">پرسنلی ثبت نشده است</p>
                                    <p className="text-sm text-slate-600 mt-1">از فرم بالا پرسنل جدید اضافه کنید</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                    {workers.map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="group relative rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 transition-all duration-300 hover:border-teal-500/30 hover:bg-slate-800/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(20,184,166,0.08)]"
                                        >
                                            <Link href={`/workers/${worker.id}/report`} className="block mb-4">
                                                <h3 className="text-base font-bold text-slate-100 transition-colors group-hover:text-teal-400">
                                                    {worker.name}
                                                </h3>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                                                        شناسه: {worker.id}
                                                    </span>
                                                    {worker.code && (
                                                        <span className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs text-teal-400">
                                                            کد: {worker.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {getRelativeTime(worker.created_at)}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(worker)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/20"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        ویرایش
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWorker(worker.id, worker.name)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-all duration-200 hover:bg-rose-500/20"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        حذف
                                                    </button>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/workers/${worker.id}/report`}
                                                className="absolute bottom-4 left-4 flex items-center gap-1 text-xs font-semibold text-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            >
                                                مشاهده گزارش
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {showEditModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                            <div className="animate-fadeIn w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(20,184,166,0.1)]">
                                <div className="mb-5 flex items-center justify-between border-b border-slate-700/50 pb-4">
                                    <h3 className="text-lg font-bold text-white">ویرایش پرسنل</h3>
                                    <button type="button" onClick={closeEdit} className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={submitEdit} className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-400">نام پرسنل</label>
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            placeholder="نام پرسنل"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-400">
                                            رمز عبور جدید
                                            <span className="mr-2 text-xs text-slate-600">(اختیاری)</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            placeholder="رمز عبور جدید"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                        <p className="mt-2 text-xs text-slate-600">در صورت عدم نیاز به تغییر، خالی بگذارید.</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={closeEdit} className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:text-slate-100">
                                            انصراف
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editForm.processing}
                                            className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-200 hover:bg-teal-400 disabled:opacity-50"
                                        >
                                            {editForm.processing ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    در حال ذخیره...
                                                </span>
                                            ) : 'ذخیره تغییرات'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
