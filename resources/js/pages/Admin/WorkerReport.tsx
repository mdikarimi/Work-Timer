import { Head, Link, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    worker: { id: number; name: string; code?: string };
    attendance: { data: Attendance[] };
    finances: { data: Finance[] };
    total_paid: number;
    date?: string;
    monthly_finance_total?: number;
    monthly_report?: { date: string; minutes: number; finance: number }[];
    attendance_summary?: { weekly_minutes: number; monthly_minutes: number };
    finance_summary?: { monthly_total: number; yearly_total: number };
};

export default function WorkerReport({
    worker,
    attendance,
    finances,
    total_paid,
    date,
    monthly_finance_total,
    monthly_report = [],
    attendance_summary,
    finance_summary,
}: PageProps) {
    const { flash } = usePage().props as { flash?: { message?: string; success?: string } };
    const [selectedDate, setSelectedDate] = useState<string>(date ?? moment().format('YYYY-MM-DD'));
    const [datePickerDate, setDatePickerDate] = useState<Date | null>(moment(selectedDate, 'YYYY-MM-DD').toDate());
    const [selectedDay, setSelectedDay] = useState<string>(date ?? selectedDate);
    const [pickerMode, setPickerMode] = useState<'day' | 'month'>('day');
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Effects
    useEffect(() => {
        setSelectedDate(date ?? moment().format('YYYY-MM-DD'));
        setDatePickerDate(moment(date ?? moment().format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate());
    }, [date]);

    useEffect(() => {
        setSelectedDay(date ?? selectedDate);
    }, [date, selectedDate]);

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
        return new Date(dateStr).toLocaleDateString('fa-IR');
    };

    const shiftDate = (offset: number) => {
        const current = moment(selectedDate, 'YYYY-MM-DD');
        current.add(offset, 'days');
        return current.format('YYYY-MM-DD');
    };

    const goToDate = (nextDate: string) => {
        router.get(`/workers/${worker.id}/report`, { date: nextDate }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (d: Date | null) => {
        if (d) {
            const formatted = moment(d).format('YYYY-MM-DD');
            setSelectedDate(formatted);
            setDatePickerDate(d);
            goToDate(formatted);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + (isMobile ? '' : ' تومان');
    };

    const formatHours = (minutes?: number | null) => {
        if (minutes === null || minutes === undefined) return '-';
        const total = Number(minutes) || 0;
        const h = Math.floor(total / 60);
        const m = total % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        const persianDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
        return persianDigits(`${pad(h)}:${pad(m)}`);
    };

    // DatePicker locale configuration
    const locale = {
        localize: {
            day: (n: number) => moment.localeData('fa').weekdays()[n],
            month: (n: number) => moment.localeData('fa').months()[n],
        },
        formatLong: {
            date: () => 'yyyy/MM/dd',
        },
    };

    // Custom DatePicker input component
    const CustomInput = React.forwardRef(({ value, onClick, pickerMode }: any, ref: any) => (
        <button
            type="button"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-right text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:px-4 md:py-2 md:text-base"
            onClick={onClick}
            ref={ref}
        >
            {value
                ? pickerMode === 'month'
                    ? moment(value, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM')
                    : moment(value, 'YYYY-MM-DD').locale('fa').format(isMobile ? 'jMM/jDD' : 'jYYYY/jMM/jDD')
                : pickerMode === 'month'
                  ? (isMobile ? 'انتخاب' : 'انتخاب ماه')
                  : (isMobile ? 'انتخاب' : 'انتخاب تاریخ')}
        </button>
    ));

    const selectedDayData = monthly_report.find((r) => r.date === selectedDay) || null;

    return (
        <>
            <Head title={`گزارش ${worker.name}`} />

            <div className="min-h-screen bg-gray-100 pb-10">
                <div className="mx-auto max-w-6xl p-3 md:p-6">
                    {/* Header Section */}
                    <div className="mb-4 flex flex-col items-center justify-between gap-3 md:mb-6 md:flex-row md:gap-4">
                        <div className="flex w-full items-center justify-between md:w-auto md:justify-start">
                            <Link href="/admin" className="rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-50">
                                <svg className="h-5 w-5 text-gray-600 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" />
                                </svg>
                            </Link>
                            <div className="text-right md:text-left">
                                <h1 className="text-lg font-black text-gray-900 md:text-2xl">{worker.name}</h1>
                                <p className="text-xs text-gray-500 md:text-sm">مشاهده سوابق و عملکرد</p>
                            </div>
                        </div>

                        {/* Summary Cards - show total paid (small) */}
                        <div className="w-full md:w-auto">
                            <div className="rounded-xl bg-blue-600 px-4 py-2 text-center text-white shadow-lg md:rounded-2xl md:px-6 md:py-3">
                                <span className="mb-1 block text-xs text-blue-100">کل پرداختی</span>
                                <span className="text-base font-bold md:text-xl">{formatPrice(total_paid)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Picker Section */}
                    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:mb-6 md:p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToDate(shiftDate(-1))}
                                        className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-md transition hover:bg-gray-200 md:px-4 md:py-2 md:text-sm"
                                    >
                                        {isMobile ? 'قبلی' : 'روز قبل'}
                                    </button>

                                    <div className="relative flex-1">
                                        <DatePicker
                                            selected={datePickerDate}
                                            onChange={(d) => {
                                                if (!d) return;
                                                if (pickerMode === 'month') {
                                                    const first = moment(d).startOf('month').format('YYYY-MM-DD');
                                                    setDatePickerDate(moment(first, 'YYYY-MM-DD').toDate());
                                                    setSelectedDate(first);
                                                    goToDate(first);
                                                } else {
                                                    handleDateChange(d);
                                                }
                                            }}
                                            dateFormat={pickerMode === 'month' ? 'yyyy/MM' : 'yyyy/MM/dd'}
                                            showMonthYearPicker={pickerMode === 'month'}
                                            locale={locale}
                                            customInput={<CustomInput pickerMode={pickerMode} />}
                                            showPopperArrow={false}
                                            popperPlacement="bottom"
                                            renderCustomHeader={({
                                                date,
                                                decreaseMonth,
                                                increaseMonth,
                                                prevMonthButtonDisabled,
                                                nextMonthButtonDisabled,
                                            }) => (
                                                <div className="flex items-center justify-between px-4 py-2">
                                                    <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1">
                                                        ‹
                                                    </button>
                                                    <span className="text-base font-semibold md:text-lg">
                                                        {moment(date).locale('fa').format('jMMMM jYYYY')}
                                                    </span>
                                                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1">
                                                        ›
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => goToDate(shiftDate(1))}
                                        className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-md transition hover:bg-gray-200 md:px-4 md:py-2 md:text-sm"
                                    >
                                        {isMobile ? 'بعدی' : 'روز بعد'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => goToDate(moment().format('YYYY-MM-DD'))}
                                className="mt-2 rounded-lg bg-gray-100 px-4 py-1.5 text-xs text-gray-700 shadow-md transition hover:bg-gray-200 md:mt-0 md:py-2 md:text-sm"
                            >
                                امروز
                            </button>
                        </div>
                    </div>

                    {/* Monthly Finance Card */}
                    <div className="mb-4 md:mb-6">
                        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg md:flex-row md:items-center md:justify-between md:p-6">
                            <div>
                                <p className="text-xs text-gray-500 md:text-sm">گزارش مالی ماه</p>
                                <h2 className="mt-1 text-xl font-extrabold text-gray-900 md:text-3xl">
                                    {formatPrice(monthly_finance_total ?? finance_summary?.monthly_total ?? 0)}
                                </h2>
                            </div>
                            <div className="text-right text-xs text-gray-400 md:text-sm">
                                <p>
                                    گزارش ماه:{' '}
                                    {moment(date ?? selectedDate)
                                        .locale('fa')
                                        .format('jMMMM jYYYY')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hours Summary */}
                    <div className="mb-4 md:mb-6">
                        <div className="grid grid-cols-3 gap-2 md:flex md:w-full md:max-w-md md:items-center md:gap-3">
                            <div className="rounded-xl bg-white px-3 py-2 text-right text-gray-800 shadow md:rounded-2xl md:px-4 md:py-3">
                                <span className="mb-0.5 block text-[10px] text-gray-500 md:mb-1 md:text-xs">امروز</span>
                                <span className="text-base font-bold md:text-lg">{formatHours(selectedDayData?.minutes ?? 0)}</span>
                            </div>

                            <div className="rounded-xl bg-white px-3 py-2 text-right text-gray-800 shadow md:rounded-2xl md:px-4 md:py-3">
                                <span className="mb-0.5 block text-[10px] text-gray-500 md:mb-1 md:text-xs">هفته</span>
                                <span className="text-base font-bold md:text-lg">{formatHours(attendance_summary?.weekly_minutes ?? 0)}</span>
                            </div>

                            <div className="rounded-xl bg-white px-3 py-2 text-right text-gray-800 shadow md:rounded-2xl md:px-4 md:py-3">
                                <span className="mb-0.5 block text-[10px] text-gray-500 md:mb-1 md:text-xs">ماه</span>
                                <span className="text-base font-bold md:text-lg">{formatHours(attendance_summary?.monthly_minutes ?? 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                        {/* Attendance Section */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:rounded-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-3 md:p-4">
                                <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 md:gap-2 md:text-base">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 md:h-2 md:w-2"></div>
                                    حضور و غیاب اخیر
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {attendance.data.length > 0 ? (
                                    attendance.data.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 md:p-4">
                                            <span className="text-xs font-medium text-gray-600 md:text-sm">{formatDate(item.created_at)}</span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs ${
                                                    item.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {item.status === 'present' ? 'حاضر' : 'غایب'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-6 text-center text-xs text-gray-400 md:p-10 md:text-sm">دیتایی ثبت نشده است</p>
                                )}
                            </div>
                        </div>

                        {/* Finance Section */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:rounded-2xl">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-3 md:p-4">
                                <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 md:gap-2 md:text-base">
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 md:h-2 md:w-2"></div>
                                    تراکنش‌های مالی
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {finances.data.length > 0 ? (
                                    finances.data.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-1 p-3 md:gap-2 md:p-4">
                                            <div className="flex items-start justify-between">
                                                <span className="text-xs font-bold text-gray-800 line-clamp-1 md:text-sm">
                                                    {item.description}
                                                </span>
                                                <span className="text-xs font-black text-purple-700 whitespace-nowrap md:text-sm">
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-gray-400 md:text-[10px]">{formatDate(item.created_at)}</span>
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 md:px-2 md:text-[10px]">
                                                    نقدی / مساعده
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-6 text-center text-xs text-gray-400 md:p-10 md:text-sm">تراکنشی یافت نشد</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 text-center md:mt-8">
                        <p className="text-[10px] text-gray-400 md:text-xs">
                            این گزارش بر اساس اطلاعات ثبت شده در سیستم «الف شاپ» استخراج شده است.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}