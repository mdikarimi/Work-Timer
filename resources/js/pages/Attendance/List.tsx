import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import { useEffect, useState } from 'react';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';

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

const toDateObject = (gregorianStr: string) =>
    new DateObject({ date: gregorianStr, calendar: gregorian }).convert(persian);

export default function AttendanceList({ attendances, date, totals }: PageProps) {
    const { flash } = usePage().props as { flash?: FlashBag };
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [datePickerDate, setDatePickerDate] = useState<DateObject | null>(toDateObject(date));

    useEffect(() => {
        setDatePickerDate(toDateObject(date));
    }, [date]);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formatTime = (value?: string | null) => {
        if (!value) return '--:--';
        return new Date(value).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    };

    const shiftDate = (offset: number) => {
        return moment(date, 'YYYY-MM-DD').add(offset, 'days').format('YYYY-MM-DD');
    };

    const goToDate = (gregorianDate: string) => {
        router.get('/attendance-list', { date: gregorianDate }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (dateObj: DateObject | null) => {
        if (dateObj) {
            const gregorianDate = dateObj.convert(gregorian).format('YYYY-MM-DD');
            setDatePickerDate(dateObj);
            goToDate(gregorianDate);
        }
    };

    const jalaliDateLabel = moment(date, 'YYYY-MM-DD').locale('fa').format('dddd jD jMMMM jYYYY');

    const inputClass =
        'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-right text-sm text-slate-200 transition-all duration-200 hover:border-teal-500/50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer';

    return (
        <>
            <Head title="لیست حضور و غیاب" />

            <div className="min-h-screen" style={{ background: '#050a12' }}>
                <div className="mx-auto max-w-7xl p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-xs text-teal-400/70 mb-1">الف شاپ</p>
                        <h1 className="text-3xl font-black text-white">لیست حضور و غیاب</h1>
                        <p className="text-sm text-slate-400 mt-1">گزارش روزانه حضور کارکنان</p>
                    </div>

                    {/* Flash */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 animate-fadeIn rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-teal-300">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Date Filter */}
                    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 100 }}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => goToDate(shiftDate(-1))}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400"
                                >
                                    روز قبل
                                </button>

                                <div className="w-44">
                                    <DatePicker
                                        value={datePickerDate}
                                        onChange={handleDateChange}
                                        locale={persian_fa}
                                        calendar={persian}
                                        format="YYYY/MM/DD"
                                        inputClass={inputClass}
                                        containerClassName="w-full"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => goToDate(shiftDate(1))}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400"
                                >
                                    روز بعد
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400">{jalaliDateLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => goToDate(moment().format('YYYY-MM-DD'))}
                                    className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-400 transition-all duration-200 hover:bg-teal-500/20"
                                >
                                    امروز
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3" style={{ position: 'relative', zIndex: 1 }}>
                        {[
                            { label: 'کل کارکنان', value: totals.total, color: 'blue' },
                            { label: 'حاضرین', value: totals.present, color: 'teal' },
                            { label: 'غایبین', value: totals.absent, color: 'rose' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className={`rounded-2xl border border-${color}-500/20 bg-${color}-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}>
                                <p className="mb-1 text-sm text-slate-400">{label}</p>
                                <h3 className={`text-3xl font-black text-${color}-400`}>{value}</h3>
                                <p className="text-xs text-slate-500 mt-1">نفر</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">کارکنان</h2>
                            <span className="rounded-full border border-slate-600/50 bg-slate-800/80 px-3 py-1 text-xs text-slate-400">
                                {attendances.length} رکورد
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50">
                                        {['نام', 'ورود', 'خروج', 'ساعات امروز', 'ساعات هفتگی', 'ساعات ماهانه', 'وضعیت'].map((h, i) => (
                                            <th key={h} className={`border-b border-slate-700/50 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? 'text-right' : 'text-center'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                                                        <svg className="h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-400 font-medium">رکوردی یافت نشد</p>
                                                    <p className="text-sm text-slate-600 mt-1">هیچ اطلاعاتی برای {jalaliDateLabel} ثبت نشده است</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        attendances.map((attendance) => {
                                            let statusLabel = 'غایب';
                                            let statusClass = 'border-slate-600/50 bg-slate-800/50 text-slate-500';
                                            if (attendance.status === 'present') {
                                                statusLabel = 'حاضر';
                                                statusClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
                                            } else if (attendance.status === 'working') {
                                                statusLabel = 'در محل کار';
                                                statusClass = 'border-teal-500/30 bg-teal-500/10 text-teal-400';
                                            }

                                            return (
                                                <tr key={attendance.id} className="border-b border-slate-700/30 transition-colors hover:bg-teal-500/5">
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="font-medium text-slate-100">{attendance.worker.name ?? 'نامشخص'}</div>
                                                        {attendance.worker.code && <div className="text-xs text-slate-500 mt-0.5">{attendance.worker.code}</div>}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className={`font-medium ${attendance.check_in ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                            {formatTime(attendance.check_in)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className={`font-medium ${attendance.check_out ? 'text-rose-400' : 'text-slate-600'}`}>
                                                            {formatTime(attendance.check_out)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-medium text-blue-400">{attendance.work_hours}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-medium text-purple-400">{attendance.weekly_hours}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-medium text-amber-400">{attendance.monthly_hours}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}>
                                                            {statusLabel}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {attendances.length > 0 && (
                            <div className="border-t border-slate-700/50 bg-slate-800/30 px-6 py-4 flex items-center justify-between">
                                <span className="text-sm text-slate-500">{attendances.length} رکورد — {jalaliDateLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400"
                                >
                                    چاپ گزارش
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex items-center justify-between">
                        <a href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                            پنل ادمین
                        </a>
                        <a href="/finance/list" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                            گزارش امور مالی
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
