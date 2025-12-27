import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type WorkerAttendance = {
    id: number;
    name: string;
    code?: string | null;
    attendances: Array<{
        // لیست همه ورود و خروج‌ها
        check_in?: string | null;
        check_out?: string | null;
    }>;
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

    const handleCheck = (endpoint: '/checkin' | '/checkout') => {
        if (!selectedWorker) {
            return;
        }

        router.post(
            endpoint,
            { worker_id: selectedWorker },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedWorker('');
                },
            },
        );
    };

    const calculateStats = () => {
        let present = 0;
        let working = 0;
        let absent = 0;

        workers.forEach((worker) => {
            const hasCheckin = worker.attendance.check_in;
            const hasCheckout = worker.attendance.check_out;

            if (hasCheckin && hasCheckout) {
                present++;
            } else if (hasCheckin && !hasCheckout) {
                working++;
            } else {
                absent++;
            }
        });

        return { present, working, absent };
    };

    const calculatedStats = calculateStats();

    return (
        <>
            <Head title="مدیریت حضور و غیاب - الف شاپ" />

            {/* Full HTML structure like the example */}
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-6xl p-4">
                    {/* Header */}
                    <div className="mb-8 flex justify-between">
                        <h1 className="mb-2 text-4xl font-black text-gray-900">
                            <span className="text-gray-700">مدیریت ورود و خروج</span>
                        </h1>
                        <a
                            href="/finance"
                            className="inline-flex items-center font-bold rounded-lg bg-purple-300 px-6 py-3 text-purple-900 shadow-md transition hover:bg-purple-200"
                        >
                            امور مالی
                        </a>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 transition-opacity duration-500">
                            <div className="flex items-center">
                                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Worker Selection Card */}
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <label htmlFor="workerSelect" className="mb-2 block text-right font-medium text-gray-700">
                                انتخاب نام و نام خانوادگی
                            </label>
                            <div className="relative">
                                <select
                                    id="workerSelect"
                                    value={selectedWorker}
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                    className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-right text-base text-gray-600 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500"
                                >
                                    <option value="">انتخاب نام</option>
                                    {workers.map((worker) => (
                                        <option key={worker.id} value={worker.id} className="text-right">
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={`mt-6 border-t border-gray-100 pt-6 ${selectedWorker ? '' : 'hidden'}`}>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCheck('/checkin')}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-300 px-4 py-3 font-bold text-green-800 shadow-md transition duration-200 hover:bg-green-200"
                                >
                                    <svg className="h-5 w-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    ثبت ورود
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCheck('/checkout')}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 font-bold text-red-900 shadow-md transition duration-200 hover:bg-rose-300"
                                >
                                    <svg className="h-5 w-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    ثبت خروج
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Attendance */}
                    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">حضور امروز</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">نام</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">ورود و خروج‌ها</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workers.map((worker) => {
                                        const hasCheckin = worker.attendance.check_in;
                                        const hasCheckout = worker.attendance.check_out;

                                        return (
                                            <tr key={worker.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-right font-medium text-gray-800">{worker.name}</td>

                                                <td className="px-4 py-3">
                                                    <div className="space-y-2">
                                                        {worker.attendances.length > 0 ? (
                                                            worker.attendances.map((att, index) => (
                                                                <div key={index} className="flex items-center justify-center gap-4">
                                                                    {att.check_in && (
                                                                        <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                                                            ثبت شده
                                                                        </span>
                                                                    )}
                                                                    {att.check_out && (
                                                                        <span className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                                                            ثبت شده
                                                                        </span>
                                                                    )}
                                                                    {att.check_in && !att.check_out && (
                                                                        <span className="text-sm text-gray-500">← در انتظار خروج</span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center text-gray-500">هیچ ورود/خروجی ثبت نشده</div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {hasCheckin && !hasCheckout ? (
                                                        <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                                                            در محل کار
                                                        </span>
                                                    ) : hasCheckin && hasCheckout ? (
                                                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                            تکمیل شده
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                                            ثبت‌ نشده
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
