import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import FlashMessage from '../../components/FlashMessage';
import PageLayout from '../../components/PageLayout';

type WorkerAttendance = {
    id: number;
    name: string;
    code?: string | null;
    attendance: {
        check_in?: string | null;
        check_out?: string | null;
        status: 'absent' | 'working' | 'complete';
    };
};

type Stats = {
    total: number;
    present: number;
    working: number;
    absent: number;
};

type FlashBag = {
    message?: string | null;
    success?: string | null;
    status?: string | null;
};

type PageProps = {
    today: string;
    workers: WorkerAttendance[];
    stats: Stats;
    flash?: FlashBag;
    errors?: Record<string, string>;
};

export default function AttendanceIndex({ today, workers, stats }: PageProps) {
    const { flash } = usePage().props as { flash?: FlashBag };
    const [selectedWorker, setSelectedWorker] = useState<string>('');
    const [localMessage, setLocalMessage] = useState<string>('');

    const formatTime = (value?: string | null) => {
        if (!value) return '--:--';
        const date = new Date(value);
        return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    };

    const statusBadge = useMemo(
        () => ({
            absent: 'bg-gray-100 text-gray-800',
            working: 'bg-yellow-100 text-yellow-800',
            complete: 'bg-blue-100 text-blue-800',
        }),
        [],
    );

    const handleCheck = (endpoint: '/checkin' | '/checkout') => {
        if (!selectedWorker) {
            setLocalMessage('لطفا نیرو را انتخاب کنید');
            return;
        }

        setLocalMessage('');
        router.post(
            endpoint,
            { worker_id: selectedWorker },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <PageLayout title="مدیریت حضور و غیاب" subtitle={`تاریخ: ${today}`}>
            <Head title="حضور امروز" />

            <FlashMessage flash={flash} />
            {localMessage && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
                    {localMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2">
                    <div className="mb-4">
                        <label htmlFor="worker" className="block text-sm font-semibold text-gray-800 mb-2 text-right">
                            انتخاب نیرو
                        </label>
                        <select
                            id="worker"
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-right text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">نیرو را انتخاب کنید</option>
                            {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={() => handleCheck('/checkin')}
                            className="flex-1 min-w-[150px] rounded-lg bg-green-500 px-4 py-3 text-center text-white font-semibold shadow-md transition hover:bg-green-600"
                        >
                            ثبت ورود
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCheck('/checkout')}
                            className="flex-1 min-w-[150px] rounded-lg bg-rose-500 px-4 py-3 text-center text-white font-semibold shadow-md transition hover:bg-rose-600"
                        >
                            ثبت خروج
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                    <StatCard title="کل نیروها" value={`${stats.total} نفر`} tint="bg-blue-50" />
                    <StatCard title="حاضر" value={`${stats.present} نفر`} tint="bg-green-50" />
                    <StatCard title="در محل کار" value={`${stats.working} نفر`} tint="bg-yellow-50" />
                    <StatCard title="غایب" value={`${stats.absent} نفر`} tint="bg-gray-50" />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">وضعیت امروز</p>
                        <h2 className="text-xl font-bold text-gray-900">فهرست نیروها</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">نام</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">ورود</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">خروج</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => (
                                <tr key={worker.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-right font-medium text-gray-900">{worker.name}</td>
                                    <td className="px-4 py-3 text-center text-gray-700">
                                        {worker.attendance.check_in ? (
                                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                                {formatTime(worker.attendance.check_in)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">--:--</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-700">
                                        {worker.attendance.check_out ? (
                                            <span className="inline-flex items-center justify-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                                                {formatTime(worker.attendance.check_out)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">--:--</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[worker.attendance.status]}`}>
                                            {worker.attendance.status === 'complete'
                                                ? 'تکمیل شده'
                                                : worker.attendance.status === 'working'
                                                    ? 'در محل کار'
                                                    : 'ثبت نشده'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
}

function StatCard({ title, value, tint }: { title: string; value: string; tint: string }) {
    return (
        <div className={`${tint} rounded-xl border border-gray-200 px-4 py-3 shadow-sm`}>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
        </div>
    );
}
