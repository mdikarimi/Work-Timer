import { Head, Link, router, usePage } from '@inertiajs/react';
import React from 'react';
import { toGregorian, toJalaali } from 'jalaali-js';
import moment from 'jalali-moment';
import { Calendar, CalendarRange, Clock, DollarSign, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';

type Attendance = {
    id: number;
    status: string;
    created_at: string;
};

type Finance = {
    id: number;
    description: string;
    price: number;
    created_at: string;
};

type PageProps = {
    worker: { id: number; name: string; code?: string; password?: string };
    attendance: { data: Attendance[] };
    finances: { data: Finance[] };
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
        selected_range?: {
            from?: string;
            to?: string;
            j_from?: string;
            j_to?: string;
            minutes?: number;
            hours?: number;
        };
    };
    finance_summary?: { monthly_total: number; yearly_total: number };
};

export default function WorkerReport({
    worker,
    attendance,
    finances,
    total_paid,
    date,
    start_date,
    end_date,
    mode,
    monthly_finance_total,
    monthly_report = [],
    attendance_summary,
    finance_summary,
}: PageProps) {
    const { flash } = usePage().props as { flash?: { message?: string; success?: string; new_password?: string } };
    const [selectedDate, setSelectedDate] = useState<string>(date ?? moment().format('YYYY-MM-DD'));
    const [selectedDay, setSelectedDay] = useState<string>(date ?? selectedDate);
    const [startDate, setStartDate] = useState<string>(start_date ?? '');
    const [endDate, setEndDate] = useState<string>(end_date ?? '');
    const [startDateValue, setStartDateValue] = useState<DateObject | null>(null);
    const [endDateValue, setEndDateValue] = useState<DateObject | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showDateDialog, setShowDateDialog] = useState(false);
    const [showDayDetails, setShowDayDetails] = useState(false);
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    const currentPersianYear = toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()).jy;

    const years = Array.from({ length: 10 }, (_, i) => currentPersianYear - 9 + i);
    const monthsFa = [
        { value: 1, label: 'فروردین' },
        { value: 2, label: 'اردیبهشت' },
        { value: 3, label: 'خرداد' },
        { value: 4, label: 'تیر' },
        { value: 5, label: 'مرداد' },
        { value: 6, label: 'شهریور' },
        { value: 7, label: 'مهر' },
        { value: 8, label: 'آبان' },
        { value: 9, label: 'آذر' },
        { value: 10, label: 'دی' },
        { value: 11, label: 'بهمن' },
        { value: 12, label: 'اسفند' },
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Effects
    useEffect(() => {
        setSelectedDate(date ?? moment().format('YYYY-MM-DD'));
    }, [date]);

    useEffect(() => {
        setSelectedDay(date ?? selectedDate);
    }, [date, selectedDate]);

    useEffect(() => {
        setStartDate(start_date ?? '');
        if (start_date) {
            setStartDateValue(new DateObject({ date: start_date, calendar: gregorian }));
        } else {
            setStartDateValue(null);
        }
    }, [start_date]);

    useEffect(() => {
        setEndDate(end_date ?? '');
        if (end_date) {
            setEndDateValue(new DateObject({ date: end_date, calendar: gregorian }));
        } else {
            setEndDateValue(null);
        }
    }, [end_date]);

    // Check mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper functions
    const formatDate = (dateStr: string) => {
        try {
            // اگر تاریخ شمسی (دارای اسلش) بود، همان را برگردان
            if (dateStr.includes('/')) {
                return dateStr;
            }
            // اگر تاریخ میلادی بود، به شمسی تبدیل کن
            return convertToPersianDate(dateStr);
        } catch (e) {
            return dateStr;
        }
    };

    // handler to toggle day details panel
    const handleRowClick = (date: string) => {
        if (selectedDay === date && showDayDetails) {
            setShowDayDetails(false);
        } else {
            setSelectedDay(date);
            setShowDayDetails(true);
        }
    };

    // attendances for currently selected day
    const attendancesForSelectedDay = ((attendance?.data || []) as any[]).filter((a: any) => a.date === selectedDay);

    // helper to extract time (H:i) from attendance fields (prefer jalali-formatted times when available)
    const extractTime = (item: any, jalaliField: string, isoField: string) => {
        if (!item) return '-';
        // prefer jalali short times prepared by server
        if (item[jalaliField]) return item[jalaliField];
        if (item[isoField]) {
            const parts = String(item[isoField]).split(' ');
            if (parts.length > 1) return parts[1].slice(0, 5);
            if (item[isoField].includes('T')) return item[isoField].split('T')[1].slice(0, 5);
            return item[isoField];
        }
        return '-';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + (isMobile ? '' : ' تومان');
    };

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

    const formatHoursDetailed = (minutes?: number | null) => {
        if (minutes === null || minutes === undefined) return '-';

        const total = minutes || 0;
        const h = Math.floor(total / 60);
        const m = total % 60;

        const parts = [];
        if (h > 0) parts.push(`${h} ساعت`);
        if (m > 0) parts.push(`${m} دقیقه`);

        return parts.join(' و ') || '0 دقیقه';
    };

    const copyToClipboard = async (text?: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            // ignore
        }
    };

    const flashedPassword = flash?.new_password;

    // تابع تبدیل تاریخ میلادی به شمسی
    function convertToPersianDate(gregorianDate: string) {
        if (!gregorianDate) return '';
        try {
            const [year, month, day] = gregorianDate.split('-').map(Number);
            const jalaali = toJalaali(year, month, day);
            return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
        } catch (error) {
            console.error('Error converting to persian date:', error);
            return '';
        }
    }

    // تابع تبدیل تاریخ شمسی به میلادی
    function convertToGregorianDate(persianDateStr: string) {
        if (!persianDateStr) return '';
        try {
            const [jy, jm, jd] = persianDateStr.split('/').map(Number);
            const gregorian = toGregorian(jy, jm, jd);
            return `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
        } catch (error) {
            console.error('Error converting to gregorian date:', error);
            return '';
        }
    }

    const handleStartDateChange = (date: DateObject | null) => {
        if (date) {
            const dateStr = date.convert(gregorian).format('YYYY-MM-DD');
            setStartDate(dateStr);
            setStartDateValue(date);
        } else {
            setStartDate('');
            setStartDateValue(null);
        }
    };

    const handleEndDateChange = (date: DateObject | null) => {
        if (date) {
            const dateStr = date.convert(gregorian).format('YYYY-MM-DD');
            setEndDate(dateStr);
            setEndDateValue(date);
        } else {
            setEndDate('');
            setEndDateValue(null);
        }
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStartDateValue(null);
        setEndDateValue(null);
        router.get(
            `/workers/${worker.id}/report`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const selectedDayData = monthly_report.find((r) => r.date === selectedDay) || null;

    // محاسبه مجموع‌ها
    const totalMinutes = monthly_report.reduce((sum, r) => sum + (r.minutes || 0), 0);
    const totalFinance = monthly_report.reduce((sum, r) => sum + (r.finance || 0), 0);
    const daysCount = monthly_report.length;

    // فرمت تاریخ بازه
    const rangeDisplay = startDate && endDate ? `${convertToPersianDate(startDate)} — ${convertToPersianDate(endDate)}` : 'کل بازه زمانی';

    return (
        <>
            <Head title={`گزارش ${worker.name}`} />

            <div className="min-h-screen bg-gray-50 pb-10">
                <div className="mx-auto max-w-7xl p-3 md:p-6">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col items-center justify-between gap-3 md:mb-8 md:flex-row md:gap-4">
                        <div className="flex w-full items-center justify-between md:w-auto md:justify-start">
                            <Link href="/admin" className="rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-50">
                                <svg className="h-5 w-5 text-gray-600 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" />
                                </svg>
                            </Link>
                            <div className="text-right md:text-left">
                                <h1 className="text-xl font-black text-gray-900 md:text-2xl">{worker.name}</h1>
                                <p className="text-sm text-gray-500 md:text-base">مشاهده سوابق و عملکرد</p>
                            </div>
                        </div>

                        {/* Summary Cards - show total paid (small) */}
                        <div className="w-full md:w-auto">
                            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-center text-white shadow-lg md:rounded-2xl md:px-6 md:py-4">
                                <span className="mb-1 block text-xs text-blue-100">کل پرداختی</span>
                                <span className="text-lg font-bold md:text-xl">{formatPrice(total_paid)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Picker Section */}
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">فیلتر تاریخ</h3>
                                <p className="text-sm text-gray-500">انتخاب بازه زمانی دلخواه</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {(startDate || endDate) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
                                    >
                                        <X className="h-4 w-4" />
                                        حذف فیلتر
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    <Calendar className="ml-1 inline h-4 w-4" />
                                    از تاریخ
                                </label>
                                <DatePicker
                                    value={startDateValue}
                                    onChange={handleStartDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="انتخاب تاریخ شروع"
                                    containerClassName="w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    <Calendar className="ml-1 inline h-4 w-4" />
                                    تا تاریخ
                                </label>
                                <DatePicker
                                    value={endDateValue}
                                    onChange={handleEndDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="انتخاب تاریخ پایان"
                                    containerClassName="w-full"
                                />
                            </div>
                            <div className="md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (startDate && endDate) {
                                            router.get(
                                                `/workers/${worker.id}/report`,
                                                {
                                                    mode: 'range',
                                                    start_date: startDate,
                                                    end_date: endDate,
                                                },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }
                                    }}
                                    disabled={!startDate || !endDate}
                                    className={`w-full rounded-xl px-6 py-3 text-sm font-medium shadow-md transition md:w-auto ${
                                        startDate && endDate
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                                            : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    اعمال فیلتر
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Card 1: Total Hours */}
                            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-600">مجموع زمان</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatHours(totalMinutes)}</p>
                                        <p className="mt-1 text-xs text-gray-500">{formatHoursDetailed(totalMinutes)}</p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-gray-500">
                                    <CalendarRange className="ml-1 h-4 w-4" />
                                    <span>{daysCount} روز کاری</span>
                                </div>
                            </div>

                            {/* Card 2: Total Amount */}
                            <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-600">مجموع مبلغ</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatPrice(totalFinance)}</p>
                                        <p className="mt-1 text-xs text-gray-500">{new Intl.NumberFormat('fa-IR').format(totalFinance)} تومان</p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Range Report Tables */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">جزئیات گزارش</h3>
                            <p className="text-sm text-gray-500">ساعات کاری و تراکنش‌های مالی در بازه انتخابی</p>
                        </div>

                        {/* Two tables: Hours and Finance */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Hours Table */}
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <div className="bg-gradient-to-r from-blue-50 to-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <h4 className="text-sm font-bold text-gray-800">ساعات کاری</h4>
                                        </div>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                            {monthly_report.length} روز
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">تاریخ</th>
                                                <th className="hidden px-4 py-3 text-right whitespace-nowrap md:table-cell">نام روز</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">زمان</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {monthly_report && monthly_report.length > 0 ? (
                                                monthly_report.map((r) => (
                                                    <React.Fragment key={r.date}>
                                                        <tr
                                                            key={r.date + '_row'}
                                                            onClick={() => handleRowClick(r.date)}
                                                            className={`cursor-pointer transition hover:bg-blue-50/50 ${
                                                                selectedDay === r.date ? 'bg-blue-50' : ''
                                                            }`}
                                                        >
                                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                                <div className="font-medium">{convertToPersianDate(r.date)}</div>
                                                            </td>
                                                            <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">{r.day_name ?? ''}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="inline-flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-gray-900">{formatHours(r.minutes, 30)}</span>
                                                                    {r.minutes > 0 && (
                                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                                            {Math.round((r.minutes / 60) * 100) / 100} ساعت
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {selectedDay === r.date && showDayDetails && (
                                                            <tr key={r.date + '_details'} className="bg-blue-50">
                                                                <td colSpan={3} className="px-4 py-3">
                                                                    {attendancesForSelectedDay && attendancesForSelectedDay.length > 0 ? (
                                                                        <div className="flex flex-col gap-2">
                                                                            {attendancesForSelectedDay.map((a: any) => {
                                                                                const ci = extractTime(a, 'check_in_jalali', 'check_in');
                                                                                const co = extractTime(a, 'check_out_jalali', 'check_out');
                                                                                const minutes = a.check_in && a.check_out ? Math.round((new Date(a.check_out).getTime() - new Date(a.check_in).getTime()) / 60000) : null;

                                                                                return (
                                                                                    <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="text-sm">
                                                                                                <span className="text-green-600">ورود:</span>{' '}
                                                                                                <span className="font-bold">{ci}</span>
                                                                                                <span className="mx-2 text-gray-300">•</span>
                                                                                                <span className="text-rose-600">خروج:</span>{' '}
                                                                                                <span className="font-bold">{co}</span>
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-500">{minutes ? formatHoursDetailed(minutes) : '-'}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-gray-500">برای این روز ورودی/خروجی ثبت نشده</div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center">
                                                        <div className="text-gray-400">
                                                            <CalendarRange className="mx-auto mb-2 h-12 w-12" />
                                                            <p className="text-sm">داده‌ای برای بازه انتخابی وجود ندارد</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Finance Table */}
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <div className="bg-gradient-to-r from-green-50 to-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            <h4 className="text-sm font-bold text-gray-800">تراکنش‌های مالی</h4>
                                        </div>
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            {finances?.data?.length || 0} مورد
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">تاریخ</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">توضیح</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">مبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {finances && finances.data && finances.data.length > 0 ? (
                                                finances.data.map((item) => (
                                                    <tr key={item.id} className="transition hover:bg-green-50/30">
                                                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item.created_at)}</td>
                                                        <td className="max-w-[150px] truncate px-4 py-3 text-sm text-gray-800">{item.description}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                                                                <DollarSign className="h-3 w-3" />
                                                                {formatPrice(item.price)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center">
                                                        <div className="text-gray-400">
                                                            <DollarSign className="mx-auto mb-2 h-12 w-12" />
                                                            <p className="text-sm">تراکنشی یافت نشد</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
