import { Head, Link, router } from '@inertiajs/react';
import { toJalaali } from 'jalaali-js';
import moment from 'jalali-moment';
import { Calendar, CalendarRange, Clock, DollarSign, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';

type Attendance = { id: number; status: string; created_at: string };
type Finance = { id: number; description: string; price: number; created_at: string };

type SalaryRequest = {
    id: number;
    type: 'weekly' | 'monthly';
    period: string;
    status: 'pending' | 'approved' | 'rejected';
    note: string | null;
    amount: number | null;
    created_at: string;
};

type PageProps = {
    worker: { id: number; name: string; code?: string; password?: string; weekly_salary_limit?: number | null; monthly_salary_limit?: number | null };
    attendance: { data: Attendance[] };
    finances: Finance[];
    total_paid: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    j_start_date?: string;
    j_end_date?: string;
    mode?: string;
    monthly_finance_total?: number;
    monthly_report?: { date: string; j_date?: string; day_name?: string; minutes: number; hours?: number; finance: number }[];
    attendance_summary?: {
        weekly_minutes: number;
        monthly_minutes: number;
        selected_range?: { from?: string; to?: string; j_from?: string; j_to?: string; minutes?: number; hours?: number };
    };
    finance_summary?: { monthly_total: number; yearly_total: number };
    salary_requests?: SalaryRequest[];
};

const toPersian = (str: string) => str.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const toLatin = (str: string) => str.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const numericPersian = (val: string) => toPersian(toLatin(val).replace(/[^0-9]/g, ''));

export default function WorkerReport({
    worker, attendance, finances, total_paid, date, start_date, end_date,
    mode, monthly_report = [], attendance_summary, finance_summary, salary_requests = [],
}: PageProps) {
    const [selectedDate, setSelectedDate] = useState<string>(date ?? moment().format('YYYY-MM-DD'));
    const [selectedDay, setSelectedDay] = useState<string>(date ?? selectedDate);
    const [startDate, setStartDate] = useState<string>(start_date ?? '');
    const [endDate, setEndDate] = useState<string>(end_date ?? '');
    const [startDateValue, setStartDateValue] = useState<DateObject | null>(null);
    const [endDateValue, setEndDateValue] = useState<DateObject | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showDayDetails, setShowDayDetails] = useState(false);
    const [showHoursTable, setShowHoursTable] = useState(false);
    const [showFinanceTable, setShowFinanceTable] = useState(false);
    const [weeklyLimit, setWeeklyLimit] = useState<string>(worker.weekly_salary_limit != null ? toPersian(String(worker.weekly_salary_limit)) : '');
    const [monthlyLimit, setMonthlyLimit] = useState<string>(worker.monthly_salary_limit != null ? toPersian(String(worker.monthly_salary_limit)) : '');
    const [isSavingLimits, setIsSavingLimits] = useState(false);

    useEffect(() => { setSelectedDate(date ?? moment().format('YYYY-MM-DD')); }, [date]);
    useEffect(() => { setSelectedDay(date ?? selectedDate); }, [date, selectedDate]);

    useEffect(() => {
        setStartDate(start_date ?? '');
        if (start_date) setStartDateValue(new DateObject({ date: start_date, calendar: gregorian }));
        else setStartDateValue(null);
    }, [start_date]);

    useEffect(() => {
        setEndDate(end_date ?? '');
        if (end_date) setEndDateValue(new DateObject({ date: end_date, calendar: gregorian }));
        else setEndDateValue(null);
    }, [end_date]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    function convertToPersianDate(gregorianDate: string) {
        if (!gregorianDate) return '';
        try {
            const [year, month, day] = gregorianDate.split('-').map(Number);
            const jalaali = toJalaali(year, month, day);
            return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
        } catch { return ''; }
    }

    const formatDate = (dateStr: string) => {
        try {
            if (dateStr.includes('/')) return dateStr;
            return convertToPersianDate(dateStr);
        } catch { return dateStr; }
    };

    const handleRowClick = (date: string) => {
        if (selectedDay === date && showDayDetails) setShowDayDetails(false);
        else { setSelectedDay(date); setShowDayDetails(true); }
    };

    const attendancesForSelectedDay = ((attendance?.data || []) as any[]).filter((a: any) => a.date === selectedDay);

    const extractTime = (item: any, jalaliField: string, isoField: string) => {
        if (!item) return '-';
        if (item[jalaliField]) return item[jalaliField];
        if (item[isoField]) {
            const parts = String(item[isoField]).split(' ');
            if (parts.length > 1) return parts[1].slice(0, 5);
            if (item[isoField].includes('T')) return item[isoField].split('T')[1].slice(0, 5);
            return item[isoField];
        }
        return '-';
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + (isMobile ? '' : ' تومان');

    const formatHours = (minutes?: number | null, roundTo: number = 30) => {
        if (minutes === null || minutes === undefined) return '-';
        const roundedMinutes = Math.round(Number(minutes) / roundTo) * roundTo;
        const total = roundedMinutes || 0;
        const h = Math.floor(total / 60);
        const m = total % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        const persianDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
        return persianDigits(`${pad(h)}:${pad(m)}`);
    };

    const handleStartDateChange = (date: DateObject | null) => {
        if (date) { setStartDate(date.convert(gregorian).format('YYYY-MM-DD')); setStartDateValue(date); }
        else { setStartDate(''); setStartDateValue(null); }
    };

    const handleEndDateChange = (date: DateObject | null) => {
        if (date) { setEndDate(date.convert(gregorian).format('YYYY-MM-DD')); setEndDateValue(date); }
        else { setEndDate(''); setEndDateValue(null); }
    };

    const handleClearFilters = () => {
        setStartDate(''); setEndDate(''); setStartDateValue(null); setEndDateValue(null);
        router.get(`/workers/${worker.id}/report`, {}, { preserveState: true, preserveScroll: true });
    };

    const totalMinutes = monthly_report.reduce((sum, r) => sum + (r.minutes || 0), 0);
    const totalFinance = monthly_report.reduce((sum, r) => sum + (r.finance || 0), 0);
    const daysCount = monthly_report.length;

    const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-right text-sm text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition";

    return (
        <>
            <Head title={`گزارش ${worker.name}`} />

            <div className="min-h-screen pb-10" style={{ background: '#050a12' }}>
                <div className="mx-auto max-w-7xl p-3 md:p-6">

                    {/* Header */}
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-400 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" />
                                </svg>
                            </Link>
                            <div>
                                <p className="text-xs text-teal-400/70 mb-0.5">گزارش پرسنل</p>
                                <h1 className="text-xl font-black text-white md:text-2xl">{worker.name}</h1>
                                <p className="text-sm text-slate-400 mt-0.5">مشاهده سوابق و عملکرد</p>
                            </div>
                        </div>

                    </div>

                    {/* Date Picker */}
                    <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 100 }}>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white">فیلتر تاریخ</h3>
                                <p className="text-xs text-slate-500 mt-0.5">انتخاب بازه زمانی دلخواه</p>
                            </div>
                            {(startDate || endDate) && (
                                <button onClick={handleClearFilters} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-400 transition-all duration-200 hover:border-rose-500/50 hover:text-rose-400">
                                    <X className="h-4 w-4" />
                                    حذف فیلتر
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-400">
                                    <Calendar className="ml-1 inline h-4 w-4 text-teal-500" />
                                    از تاریخ
                                </label>
                                <DatePicker
                                    value={startDateValue}
                                    onChange={handleStartDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass={inputClass}
                                    placeholder="انتخاب تاریخ شروع"
                                    containerClassName="w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-400">
                                    <Calendar className="ml-1 inline h-4 w-4 text-teal-500" />
                                    تا تاریخ
                                </label>
                                <DatePicker
                                    value={endDateValue}
                                    onChange={handleEndDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass={inputClass}
                                    placeholder="انتخاب تاریخ پایان"
                                    containerClassName="w-full"
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (startDate && endDate) {
                                            router.get(`/workers/${worker.id}/report`, { mode: 'range', start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
                                        }
                                    }}
                                    disabled={!startDate || !endDate}
                                    className={`w-full rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-all duration-200 md:w-auto ${
                                        startDate && endDate
                                            ? 'bg-teal-500 text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:bg-teal-400'
                                            : 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-600'
                                    }`}
                                >
                                    اعمال فیلتر
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">مجموع زمان</p>
                                    <p className="text-3xl font-black text-blue-400">{formatHours(totalMinutes)}</p>
                                    <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                                        <CalendarRange className="h-4 w-4 text-blue-500/50" />
                                        {daysCount} روز کاری
                                    </div>
                                </div>
                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                                    <Clock className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">مجموع مبلغ</p>
                                    <p className="text-3xl font-black text-emerald-400">{formatPrice(totalFinance)}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                                    <DollarSign className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Salary Requests */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white">درخواست‌های حقوق</h3>
                                <p className="text-xs text-slate-500 mt-0.5">هفته و ماه جاری</p>
                            </div>
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                                {salary_requests.length} درخواست
                            </span>
                        </div>

                        {salary_requests.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4">
                                        <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-500">درخواستی برای این دوره ثبت نشده</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/30">
                                {salary_requests.map(req => {
                                    const isPending = req.status === 'pending';
                                    const isApproved = req.status === 'approved';
                                    const statusLabel = isPending ? 'در انتظار' : isApproved ? 'تایید شده' : 'رد شده';
                                    const statusCls = isPending
                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                        : isApproved
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400';
                                    const typeLabel = req.type === 'weekly' ? 'هفتگی' : 'ماهانه';
                                    const typeCls = req.type === 'weekly'
                                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                        : 'border-purple-500/30 bg-purple-500/10 text-purple-400';

                                    return (
                                        <div key={req.id} className="flex items-center justify-between px-6 py-4 hover:bg-teal-500/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-2.5">
                                                    <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-100">درخواست حقوق {typeLabel}</span>
                                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeCls}`}>
                                                            {typeLabel}
                                                        </span>
                                                    </div>
                                                    {req.amount != null && (
                                                        <p className="text-sm font-bold text-amber-400 mt-0.5">
                                                            {new Intl.NumberFormat('fa-IR').format(req.amount)} تومان
                                                        </p>
                                                    )}
                                                    {req.note && <p className="text-xs text-slate-500 mt-0.5">{req.note}</p>}
                                                    <p className="text-xs text-slate-600 mt-0.5">{req.period}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusCls}`}>
                                                    {statusLabel}
                                                </span>
                                                {isPending && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.patch(`/finance/salary-request/${req.id}`, { status: 'approved' }, { preserveScroll: true })}
                                                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                                                        >
                                                            تایید
                                                        </button>
                                                        <button
                                                            onClick={() => router.patch(`/finance/salary-request/${req.id}`, { status: 'rejected' }, { preserveScroll: true })}
                                                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/20"
                                                        >
                                                            رد
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Salary Limits */}
                    <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
                                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">سقف برداشت حقوق</h3>
                                <p className="text-xs text-slate-500 mt-0.5">حداکثر مبلغ قابل درخواست در هر دوره</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">
                                    سقف هفتگی
                                    <span className="mr-1 text-xs text-slate-600">(تومان)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        dir="rtl"
                                        value={weeklyLimit}
                                        onChange={e => setWeeklyLimit(numericPersian(e.target.value))}
                                        placeholder="بدون محدودیت"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-right text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">
                                    سقف ماهانه
                                    <span className="mr-1 text-xs text-slate-600">(تومان)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        dir="rtl"
                                        value={monthlyLimit}
                                        onChange={e => setMonthlyLimit(numericPersian(e.target.value))}
                                        placeholder="بدون محدودیت"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-right text-sm text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex gap-4 text-xs text-slate-600">
                                {worker.weekly_salary_limit != null && (
                                    <span>سقف هفتگی فعلی: <span className="text-blue-400 font-medium">{new Intl.NumberFormat('fa-IR').format(worker.weekly_salary_limit)} تومان</span></span>
                                )}
                                {worker.monthly_salary_limit != null && (
                                    <span>سقف ماهانه فعلی: <span className="text-purple-400 font-medium">{new Intl.NumberFormat('fa-IR').format(worker.monthly_salary_limit)} تومان</span></span>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={isSavingLimits}
                                onClick={() => {
                                    setIsSavingLimits(true);
                                    router.patch(`/workers/${worker.id}`, {
                                        name: worker.name,
                                        weekly_salary_limit: weeklyLimit ? toLatin(weeklyLimit) : null,
                                        monthly_salary_limit: monthlyLimit ? toLatin(monthlyLimit) : null,
                                    }, {
                                        preserveScroll: true,
                                        onFinish: () => setIsSavingLimits(false),
                                    });
                                }}
                                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                                    isSavingLimits
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                        : 'bg-amber-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:bg-amber-400'
                                }`}
                            >
                                {isSavingLimits ? 'در حال ذخیره...' : 'ذخیره سقف‌ها'}
                            </button>
                        </div>
                    </div>

                    {/* Hours Table - Collapsible */}
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" style={{ position: 'relative', zIndex: 1 }}>
                        <button
                            type="button"
                            onClick={() => setShowHoursTable(v => !v)}
                            className="w-full flex items-center justify-between px-6 py-4 text-right transition-colors hover:bg-slate-800/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-sm font-bold text-slate-200">ساعات کاری</h3>
                                    <p className="text-xs text-slate-500">{monthly_report.length} روز — مجموع {formatHours(totalMinutes)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                                    {monthly_report.length} روز
                                </span>
                                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showHoursTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {showHoursTable && (
                            <div className="border-t border-slate-700/50 overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead>
                                        <tr className="bg-slate-800/30">
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">تاریخ</th>
                                            <th className="hidden px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap md:table-cell">نام روز</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">زمان</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {monthly_report && monthly_report.length > 0 ? (
                                            monthly_report.map((r) => (
                                                <React.Fragment key={r.date}>
                                                    <tr
                                                        onClick={() => handleRowClick(r.date)}
                                                        className={`cursor-pointer transition-colors hover:bg-blue-500/5 ${selectedDay === r.date ? 'bg-blue-500/10' : ''}`}
                                                    >
                                                        <td className="px-4 py-3 text-sm text-slate-300">{convertToPersianDate(r.date)}</td>
                                                        <td className="hidden px-4 py-3 text-sm text-slate-500 md:table-cell">{r.day_name ?? ''}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-100">{formatHours(r.minutes, 30)}</span>
                                                                {r.minutes > 0 && (
                                                                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                                                                        {Math.round((r.minutes / 60) * 100) / 100}h
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {selectedDay === r.date && showDayDetails && (
                                                        <tr className="bg-blue-500/5">
                                                            <td colSpan={3} className="px-4 py-3">
                                                                {attendancesForSelectedDay && attendancesForSelectedDay.length > 0 ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        {attendancesForSelectedDay.map((a: any) => {
                                                                            const ci = extractTime(a, 'check_in_jalali', 'check_in');
                                                                            const co = extractTime(a, 'check_out_jalali', 'check_out');
                                                                            return (
                                                                                <div key={a.id} className="rounded-xl border border-slate-700/50 bg-slate-800/80 p-3 text-sm">
                                                                                    <div className="flex items-center gap-4">
                                                                                        <span className="text-emerald-400">ورود: <span className="font-bold text-slate-100">{ci}</span></span>
                                                                                        <span className="text-slate-600">•</span>
                                                                                        <span className="text-rose-400">خروج: <span className="font-bold text-slate-100">{co}</span></span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-slate-600">برای این روز ثبتی وجود ندارد</p>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center">
                                                    <CalendarRange className="mx-auto mb-2 h-10 w-10 text-slate-700" />
                                                    <p className="text-sm text-slate-600">داده‌ای یافت نشد</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Finance Table - Collapsible */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" style={{ position: 'relative', zIndex: 1 }}>
                        <button
                            type="button"
                            onClick={() => setShowFinanceTable(v => !v)}
                            className="w-full flex items-center justify-between px-6 py-4 text-right transition-colors hover:bg-slate-800/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                                    <DollarSign className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-sm font-bold text-slate-200">تراکنش‌های مالی</h3>
                                    <p className="text-xs text-slate-500">{finances?.length || 0} مورد — مجموع {formatPrice(totalFinance)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                    {finances?.length || 0} مورد
                                </span>
                                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showFinanceTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {showFinanceTable && (
                            <div className="border-t border-slate-700/50 overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead>
                                        <tr className="bg-slate-800/30">
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">تاریخ</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">توضیح</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">مبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {finances && finances.length > 0 ? (
                                            finances.map((item) => (
                                                <tr key={item.id} className="transition-colors hover:bg-emerald-500/5">
                                                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                                                    <td className="max-w-[140px] truncate px-4 py-3 text-sm text-slate-300">{item.description}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm font-bold text-emerald-400">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center">
                                                    <DollarSign className="mx-auto mb-2 h-10 w-10 text-slate-700" />
                                                    <p className="text-sm text-slate-600">تراکنشی یافت نشد</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
