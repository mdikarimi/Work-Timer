import { Head, Link, router, useForm, usePage } from '@inertiajs/react'; // اضافه شدن Link
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
                <div className="max-w-6xl mx-auto p-4 md:p-6">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                        <div className="text-center md:text-right">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                                مدیریت پرسنل
                            </h1>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 md:gap-4">
                            <form method="POST" action="/logout">
                                <input type="hidden" name="_token" value={(window as any).csrf_token} />
                                <button
                                    type="submit"
                                    className="inline-flex items-center shadow-md px-4 md:px-6 py-2.5 md:py-3 font-bold bg-red-300 text-red-900 rounded-lg hover:bg-red-200 transition duration-200 text-sm md:text-base"
                                >
                                    خروج
                                </button>
                            </form>

                            <Link
                                href="/attendance-list"
                                className="inline-flex items-center shadow-md font-bold px-4 md:px-6 py-2.5 md:py-3 bg-blue-300 text-blue-900 rounded-lg hover:bg-blue-200 transition text-sm md:text-base"
                            >
                                گزارش روزانه
                            </Link>

                            <Link
                                href="/finance/list"
                                className="inline-flex items-center shadow-md px-4 md:px-6 py-2.5 md:py-3 font-bold rounded-lg bg-purple-300 text-purple-900 transition hover:bg-purple-200 text-sm md:text-base"
                            >
                                امور مالی
                            </Link>
                        </div>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            <div className="flex items-center">
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Add Worker Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-8">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 text-center md:text-right">افزودن پرسنل جدید</h2>
                        <form onSubmit={submitWorker} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="نام کامل پرسنل را وارد کنید"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-green-300 shadow-md text-green-800 rounded-lg hover:bg-green-200 font-bold px-6 py-3 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                افزودن پرسنل
                            </button>
                        </form>
                    </div>

                    {/* Workers List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">لیست پرسنل</h2>
                        </div>

                        <div className="p-4 md:p-6">
                            {workers.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">پرسنلی ثبت نشده است.</div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {workers.map((worker) => (
                                        <div key={worker.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                                            <div className="flex justify-between items-start">
                                                {/* Link to Individual Report */}
                                                <Link 
                                                    href={`/workers/${worker.id}/report`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                                                        {worker.name}
                                                        <svg className="inline-block w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </h3>
                                                    <div className="flex items-center mt-2 gap-2">
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">شناسه: {worker.id}</span>
                                                        {worker.code && (
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">کد: {worker.code}</span>
                                                        )}
                                                    </div>
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => removeWorker(worker.id, worker.name)}
                                                    className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="border-t border-gray-50 mt-4 pt-3 flex justify-between items-center">
                                                <div className="text-[11px] text-gray-400">
                                                    عضویت: {getRelativeTime(worker.created_at)}
                                                </div>
                                                <span className="text-[10px] text-blue-500 font-bold group-hover:underline">
                                                    مشاهده گزارش کامل ←
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}