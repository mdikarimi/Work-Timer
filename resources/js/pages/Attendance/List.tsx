import { Head, router, usePage } from '@inertiajs/react';
import FlashMessage from '../../components/FlashMessage';
import PageLayout from '../../components/PageLayout';

type AttendanceRow = {
    id: number;
    worker: {
        id?: number;
        name?: string | null;
        code?: string | null;
    };
    date: string;
    check_in?: string | null;
    check_out?: string | null;
    work_hours: string;
    weekly_hours: string;
    monthly_hours: string;
    total_minutes?: number;
    weekly_minutes?: number;
    monthly_minutes?: number;
    is_late: boolean;
    late_minutes: number;
    status: 'absent' | 'present' | 'working';
};

type Totals = {
    total: number;
    present: number;
    absent: number;
};

type FlashBag = {
    message?: string | null;
    success?: string | null;
    status?: string | null;
};

type PageProps = {
    attendances: AttendanceRow[];
    date: string;
    totals: Totals;
    flash?: FlashBag;
};

export default function AttendanceList({ attendances, date, totals }: PageProps) {
    const { flash } = usePage().props as { flash?: FlashBag };

    const formatTime = (value?: string | null) => {
        if (!value) return '--:--';
        const dt = new Date(value);
        return dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    };

    const shiftDate = (offset: number) => {
        const current = new Date(date);
        current.setDate(current.getDate() + offset);
        return current.toISOString().slice(0, 10);
    };

    const goToDate = (nextDate: string) => {
        router.get('/attendance-list', { date: nextDate }, { preserveState: true, preserveScroll: true });
    };

    return (
        <PageLayout title="گزارش حضور و غیاب" subtitle={`تاریخ انتخاب شده: ${date}`}>
            <Head title="لیست حضور" />
            <FlashMessage flash={flash} />

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => goToDate(shiftDate(-1))}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
                    >
                        روز قبل
                    </button>

                    {/* Jalali date display (read-only) */}
                    <div className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm">
                        {new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }).format(new Date(date))}
                    </div>

                    <button
                        type="button"
                        onClick={() => goToDate(shiftDate(1))}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
                    >
                        روز بعد
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => goToDate(new Date().toISOString().slice(0, 10))}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                    امروز
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="کل کارکنان" value={`${totals.total} نفر`} />
                <StatCard title="حاضرین" value={`${totals.present} نفر`} tint="bg-green-50 text-green-800" />
                <StatCard title="غایبین" value={`${totals.absent} نفر`} tint="bg-red-50 text-red-800" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">لیست نیروها</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">نام</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">ورود</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">خروج</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">ساعت امروز</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">ساعت هفتگی</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">ساعت ماهانه</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                        رکوردی برای این تاریخ یافت نشد.
                                    </td>
                                </tr>
                            )}

                            {attendances.map((attendance) => {
                                const statusLabel =
                                    attendance.status === 'present'
                                        ? 'حاضر'
                                        : attendance.status === 'working'
                                            ? 'در محل کار'
                                            : 'غایب';

                                const statusClass =
                                    attendance.status === 'present'
                                        ? 'bg-green-100 text-green-800'
                                        : attendance.status === 'working'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800';

                                return (
                                    <tr key={attendance.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-semibold text-gray-900">{attendance.worker.name ?? 'نامشخص'}</div>
                                            {attendance.worker.code && <div className="text-xs text-gray-500">کد: {attendance.worker.code}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-800">
                                            <div className="font-medium">{formatTime(attendance.check_in)}</div>
                                            {attendance.is_late && (
                                                <div className="text-xs text-red-500 mt-1">{attendance.late_minutes} دقیقه تاخیر</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-800">{formatTime(attendance.check_out)}</td>
                                        <td className="px-4 py-3 text-center text-blue-700 font-semibold">{attendance.work_hours}</td>
                                        <td className="px-4 py-3 text-center text-purple-700 font-semibold">{attendance.weekly_hours}</td>
                                        <td className="px-4 py-3 text-center text-amber-700 font-semibold">{attendance.monthly_hours}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
}

function StatCard({ title, value, tint = 'bg-blue-50 text-blue-900' }: { title: string; value: string; tint?: string }) {
    return (
        <div className={`${tint} rounded-xl border border-gray-200 px-4 py-3 shadow-sm`}>
            <p className="text-xs text-gray-600">{title}</p>
            <p className="mt-1 text-lg font-bold">{value}</p>
        </div>
    );
}
