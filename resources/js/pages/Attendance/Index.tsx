import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import { useEffect, useState } from 'react';

type WorkerAttendance = {
    id: number;
    name: string;
    code?: string | null;
    attendances: Array<{
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
            const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleCheck = (endpoint: '/checkin' | '/checkout') => {
        if (!selectedWorker) return;
        router.post(endpoint, { worker_id: selectedWorker }, {
            preserveScroll: true,
            onSuccess: () => setSelectedWorker(''),
        });
    };

    const calculateStats = () => {
        let present = 0, working = 0, absent = 0;
        workers.forEach((worker) => {
            if (worker.attendance.check_in && worker.attendance.check_out) present++;
            else if (worker.attendance.check_in && !worker.attendance.check_out) working++;
            else absent++;
        });
        return { present, working, absent };
    };

    const calculatedStats = calculateStats();

    return (
        <>
            <Head title="مدیریت حضور و غیاب - الف شاپ" />

            <div className="min-h-screen" style={{ background: '#050a12' }}>
                <div className="mx-auto max-w-6xl p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-teal-400/70 mb-1">الف شاپ</p>
                            <h1 className="text-3xl font-black text-white">مدیریت ورود و خروج</h1>
                            <p className="text-sm text-slate-400 mt-1">{moment(today, 'YYYY-MM-DD').locale('fa').format('dddd jD jMMMM jYYYY')}</p>
                        </div>
                        <a
                            href="/finance"
                            className="inline-flex items-center gap-2 font-bold rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-200 hover:bg-purple-500/20 hover:border-purple-400/50"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            امور مالی
                        </a>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 animate-fadeIn rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Worker Selection Card */}
                    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(20,184,166,0.05)] backdrop-blur-sm">
                        <h2 className="text-base font-bold text-slate-200 mb-4">ثبت حضور</h2>
                        <div>
                            <label htmlFor="workerSelect" className="mb-2 block text-sm font-medium text-slate-400">
                                انتخاب نام پرسنل
                            </label>
                            <div className="relative">
                                <select
                                    id="workerSelect"
                                    value={selectedWorker}
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-right text-base text-slate-200 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                >
                                    <option value="" style={{ background: '#1e293b' }}>انتخاب نام</option>
                                    {workers.map((worker) => (
                                        <option key={worker.id} value={worker.id} style={{ background: '#1e293b' }}>
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {selectedWorker && (
                            <div className="mt-6 border-t border-slate-700/50 pt-6">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCheck('/checkin')}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        ثبت ورود
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCheck('/checkout')}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-bold text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all duration-200 hover:bg-rose-500/20 hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        ثبت خروج
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Today's Attendance Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">حضور امروز</h2>
                            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                                {workers.length} نفر
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50">
                                        <th className="border-b border-slate-700/50 px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">نام</th>
                                        <th className="border-b border-slate-700/50 px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">ورود و خروج‌ها</th>
                                        <th className="border-b border-slate-700/50 px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workers.map((worker) => {
                                        const hasCheckin = worker.attendance.check_in;
                                        const hasCheckout = worker.attendance.check_out;

                                        return (
                                            <tr key={worker.id} className="border-b border-slate-700/30 transition-colors hover:bg-teal-500/5">
                                                <td className="px-4 py-3.5 text-right font-medium text-slate-100">{worker.name}</td>

                                                <td className="px-4 py-3.5">
                                                    <div className="space-y-1.5">
                                                        {worker.attendances.length > 0 ? (
                                                            worker.attendances.map((att, index) => (
                                                                <div key={index} className="flex items-center justify-center gap-3">
                                                                    {att.check_in && (
                                                                        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                                            ورود ✓
                                                                        </span>
                                                                    )}
                                                                    {att.check_out && (
                                                                        <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
                                                                            خروج ✓
                                                                        </span>
                                                                    )}
                                                                    {att.check_in && !att.check_out && (
                                                                        <span className="text-xs text-slate-500">در انتظار خروج...</span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center text-sm text-slate-600">—</div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    {hasCheckin && !hasCheckout ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                                                            در محل کار
                                                        </span>
                                                    ) : hasCheckin && hasCheckout ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                            تکمیل شده
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                                            ثبت نشده
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
