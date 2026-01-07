import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const submitWorker = (e: FormEvent) => {
        e.preventDefault();
        form.post('/workers', {
            preserveScroll: true,
            onSuccess: () => form.reset('name', 'password'),
        });
    };

    const removeWorker = (id: number, name: string) => {
        const confirmed = window.confirm(`آیا از حذف «${name}» مطمئن هستید؟`);
        if (!confirmed) return;
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
        editForm.put(`/workers/${editingWorkerId}`, {
            preserveScroll: true,
            onSuccess: () => closeEdit(),
        });
    };

    const formatDate = (value?: string) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('fa-IR');
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

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header - بهبود یافته */}
                    <div className="mb-10">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center justify-between lg:block">
                                    {/* عنوان در سمت چپ */}
                                    <div className="text-right lg:text-right">
                                        <h1 className="mb-2 bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-2xl font-extrabold text-gray-900 md:text-3xl">
                                            مدیریت پرسنل
                                        </h1>
                                        <p className="hidden text-sm text-gray-500 md:text-base lg:block">مدیریت، ویرایش و مشاهده گزارش‌های پرسنل</p>
                                    </div>

                                    {/* دکمه منو موبایل در سمت راست */}
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-3 shadow-md transition-all duration-300 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg lg:hidden"
                                        onClick={() => setShowMobileMenu((s) => !s)}
                                        aria-label="Toggle menu"
                                    >
                                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Desktop Navigation - بهبود یافته */}
                                <div className="hidden items-center gap-3 lg:flex">
                                    <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                                        <Link
                                            href="/finance/list"
                                            className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl md:text-base"
                                        >
                                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            امور مالی
                                        </Link>

                                        <Link
                                            href="/attendance-list"
                                            className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl md:text-base"
                                        >
                                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                />
                                            </svg>
                                            گزارش روزانه
                                        </Link>

                                        <form method="POST" action="/logout" className="inline-block">
                                            <input type="hidden" name="_token" value={(window as any).csrf_token} />
                                            <button
                                                type="submit"
                                                className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700 hover:shadow-xl md:text-base"
                                            >
                                                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                                خروج
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu - زیر عنوان در موبایل */}
                            {showMobileMenu && (
                                <div className="animate-fadeIn mt-6 lg:hidden">
                                    <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                                        <Link
                                            href="/finance/list"
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 font-bold text-purple-700 transition-all duration-300 hover:from-purple-100 hover:to-purple-200"
                                        >
                                            <span>امور مالی</span>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </Link>

                                        <Link
                                            href="/attendance-list"
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 font-bold text-blue-700 transition-all duration-300 hover:from-blue-100 hover:to-blue-200"
                                        >
                                            <span>گزارش روزانه</span>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                />
                                            </svg>
                                        </Link>

                                        <form method="POST" action="/logout" className="w-full">
                                            <input type="hidden" name="_token" value={(window as any).csrf_token} />
                                            <button
                                                type="submit"
                                                onClick={() => setShowMobileMenu(false)}
                                                className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 font-bold text-red-700 transition-all duration-300 hover:from-red-100 hover:to-red-200"
                                            >
                                                <span>خروج</span>
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="animate-fadeIn mb-6">
                            <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-sm text-green-700 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <svg className="ml-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {flash?.message || flash?.success}
                                    </div>
                                    <button onClick={() => setShowSuccessMessage(false)} className="text-green-500 hover:text-green-700">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Worker Form */}
                    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                        <h2 className="mb-6 border-b border-gray-100 pb-4 text-center text-xl font-bold text-gray-800 lg:text-right">
                            افزودن پرسنل جدید
                        </h2>
                        <form onSubmit={submitWorker} className="space-y-4 md:flex md:gap-4 md:space-y-0">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-600">نام کامل پرسنل</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="مثال: علی محمدی"
                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition duration-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-600">رمز عبور</label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="رمز عبور برای ورود پرسنل"
                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition duration-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl disabled:opacity-50 md:w-auto"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    افزودن پرسنل
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Workers List */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">لیست پرسنل ({workers.length})</h2>
                                <span className="text-sm text-gray-500">آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</span>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            {workers.length === 0 ? (
                                <div className="py-16 text-center">
                                    <svg className="mx-auto mb-4 h-20 w-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <p className="mb-2 text-lg text-gray-400">پرسنلی ثبت نشده است.</p>
                                    <p className="text-sm text-gray-400">با استفاده از فرم بالا پرسنل جدید اضافه کنید.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {workers.map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="group relative transform rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                                        >
                                            {/* Worker Info with Link */}
                                            <Link href={`/workers/${worker.id}/report`} className="block cursor-pointer">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-600">
                                                                    {worker.name}
                                                                </h3>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                                        شناسه: {worker.id}
                                                                    </span>
                                                                    {worker.code && (
                                                                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                                            کد: {worker.code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Action Buttons - بهبود یافته */}
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    عضویت: {getRelativeTime(worker.created_at)}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Edit Button - بهبود یافته */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(worker)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-all duration-300 hover:from-blue-100 hover:to-blue-200 hover:shadow-md"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWorker(worker.id, worker.name)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-50 to-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:from-red-100 hover:to-red-200 hover:shadow-md"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* View Report Link */}
                                            <Link
                                                href={`/workers/${worker.id}/report`}
                                                className="absolute bottom-5 left-5 flex items-center gap-1 text-xs font-semibold text-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            >
                                                مشاهده گزارش کامل
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

                    {/* Edit Modal - بهبود یافته */}
                    {showEditModal && (
                        <div className="bg-opacity-60 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="text-xl font-bold text-gray-800">ویرایش پرسنل</h3>
                                    <button
                                        type="button"
                                        onClick={closeEdit}
                                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={submitEdit} className="space-y-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-600">نام پرسنل</label>
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            placeholder="نام پرسنل"
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition duration-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-600">
                                            رمز عبور جدید
                                            <span className="mr-2 text-xs text-gray-400">(اختیاری)</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            placeholder="رمز عبور جدید"
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition duration-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">در صورت عدم نیاز به تغییر رمز، این فیلد را خالی بگذارید.</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeEdit}
                                            className="rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:from-gray-200 hover:to-gray-300"
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editForm.processing}
                                            className="transform rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                                        >
                                            {editForm.processing ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    در حال ذخیره...
                                                </span>
                                            ) : (
                                                'ذخیره تغییرات'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add custom animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
