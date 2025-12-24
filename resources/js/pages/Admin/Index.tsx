import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    const form = useForm({ name: '' });
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

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
            onSuccess: () => form.reset('name'),
        });
    };

    const removeWorker = (id: number, name: string) => {
        const confirmed = window.confirm(`آیا از حذف «${name}» مطمئن هستید؟`);
        if (!confirmed) return;
        router.delete(`/workers/${id}`, { preserveScroll: true });
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
            
            <div className="bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto p-4">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-1">
                                مدیریت نیروهای کاری
                            </h1>
                            <p className="text-gray-600">افزودن و حذف کارکنان</p>
                        </div>
                        <div className="flex justify-between items-center">
                            {/* Logout Button */}
                            <form method="POST" action="/logout" className="ml-4">
                                <input type="hidden" name="_token" value={window.csrf_token} />
                                <button
                                    type="submit"
                                    className="inline-flex items-center shadow-md px-6 py-3 bg-red-300 text-red-900 rounded-lg hover:bg-red-200 transition duration-200"
                                >
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    خروج از سیستم
                                </button>
                            </form>

                            <a
                                href="/attendance-list"
                                className="inline-flex items-center shadow-md px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition ml-4"
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                گزارش روزانه
                            </a>

                            <a
                                href="/finance/list"
                                className="inline-flex items-center shadow-md px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition"
                            >
                                امور مالی
                            </a>
                        </div>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg transition-opacity duration-500">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd" />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Add Worker Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">افزودن نیروی جدید</h2>
                        <form onSubmit={submitWorker} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="نام کامل نیرو را وارد کنید"
                                    className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-green-300 shadow-md text-green-800 rounded-lg hover:bg-green-200 font-medium px-6 py-3 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                افزودن نیرو
                            </button>
                        </form>
                    </div>

                    {/* Workers List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">لیست نیروها</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {workers.length} نیرو ثبت شده
                                </p>
                            </div>
                        </div>

                        {/* Desktop View - Cards */}
                        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
                            {workers.length === 0 ? (
                                <div className="col-span-full">
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-500 mb-2">هنوز نیرویی اضافه نشده است</h3>
                                        <p className="text-gray-400 text-sm">برای شروع، یک نیروی جدید اضافه کنید.</p>
                                    </div>
                                </div>
                            ) : (
                                workers.map((worker) => (
                                    <div key={worker.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className="ml-3">
                                                    <h3 className="font-bold text-gray-800 text-lg">{worker.name}</h3>
                                                    <div className="flex items-center mt-1 space-x-2 space-x-reverse">
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            شناسه: {worker.id}
                                                        </span>
                                                        {worker.code && (
                                                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                                                کد: {worker.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeWorker(worker.id, worker.name)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition duration-200 flex-shrink-0"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    عضویت: {getRelativeTime(worker.created_at)}
                                                </div>
                                                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                    فعال
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden">
                            <div className="space-y-3 p-4">
                                {workers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p className="text-gray-500">هنوز نیرویی اضافه نشده است</p>
                                    </div>
                                ) : (
                                    workers.map((worker) => (
                                        <div key={worker.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                            {/* Row 1: Main Info */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{worker.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        شناسه: {worker.id}
                                                        {worker.code && ` • کد: ${worker.code}`}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeWorker(worker.id, worker.name)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Row 2: Additional Info */}
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">
                                                    {getRelativeTime(worker.created_at)}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                    فعال
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {workers.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        {workers.length} نیرو در سیستم ثبت شده‌اند
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}