import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FlashMessage from '../../components/FlashMessage';
import PageLayout from '../../components/PageLayout';

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
        return new Date(value).toLocaleDateString('fa-IR');
    };

    return (
        <PageLayout title="مدیریت نیروها" subtitle="افزودن و حذف کارکنان">
            <Head title="پنل ادمین" />
            <FlashMessage flash={flash} />

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">افزودن نیروی جدید</h2>
                <form className="flex flex-col gap-3 md:flex-row" onSubmit={submitWorker}>
                    <div className="flex-1">
                        <input
                            type="text"
                            name="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="نام کامل نیرو"
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-lg bg-green-500 px-6 py-3 text-white font-semibold shadow-sm hover:bg-green-600 disabled:opacity-50"
                    >
                        افزودن نیرو
                    </button>
                </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">لیست نیروها</h3>
                        <p className="text-sm text-gray-500 mt-1">{workers.length} نیرو ثبت شده</p>
                    </div>
                </div>

                {workers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">هیچ نیرویی ثبت نشده است.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {workers.map((worker) => (
                            <div key={worker.id} className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{worker.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">شناسه: {worker.id}</p>
                                        {worker.code && <p className="text-xs text-gray-500">کد: {worker.code}</p>}
                                        {worker.created_at && (
                                            <p className="text-xs text-gray-500 mt-1">عضویت: {formatDate(worker.created_at)}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeWorker(worker.id, worker.name)}
                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
