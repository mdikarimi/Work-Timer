import { Head, Link, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import React, { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import { FormControl, InputLabel as MUIInputLabel, MenuItem, Select } from "@mui/material";
import { X } from "lucide-react";
import { toJalaali, toGregorian } from 'jalaali-js';

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
    mode?: string;
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
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");

    const currentPersianYear = toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()).jy;

    const years = Array.from({ length: 10 }, (_, i) => currentPersianYear - 9 + i);
    const monthsFa = [
        { value: 1, label: "فروردین" },
        { value: 2, label: "اردیبهشت" },
        { value: 3, label: "خرداد" },
        { value: 4, label: "تیر" },
        { value: 5, label: "مرداد" },
        { value: 6, label: "شهریور" },
        { value: 7, label: "مهر" },
        { value: 8, label: "آبان" },
        { value: 9, label: "آذر" },
        { value: 10, label: "دی" },
        { value: 11, label: "بهمن" },
        { value: 12, label: "اسفند" },
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
        return new Date(dateStr).toLocaleDateString('fa-IR');
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
        if (!gregorianDate) return "";
        try {
            const [year, month, day] = gregorianDate.split('-').map(Number);
            const jalaali = toJalaali(year, month, day);
            return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
        } catch (error) {
            console.error("Error converting to persian date:", error);
            return "";
        }
    }

    // تابع تبدیل تاریخ شمسی به میلادی
    function convertToGregorianDate(persianDateStr: string) {
        if (!persianDateStr) return "";
        try {
            const [jy, jm, jd] = persianDateStr.split('/').map(Number);
            const gregorian = toGregorian(jy, jm, jd);
            return `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
        } catch (error) {
            console.error("Error converting to gregorian date:", error);
            return "";
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

    // تابع رندر custom input برای تاریخ شمسی - دیگر نیاز نیست چون Calendar input دارد

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
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
                                <DatePicker
                                    value={startDateValue}
                                    onChange={handleStartDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-right text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="انتخاب تاریخ"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
                                <DatePicker
                                    value={endDateValue}
                                    onChange={handleEndDateChange}
                                    locale={persian_fa}
                                    calendar={persian}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-right text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="انتخاب تاریخ"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (startDate && endDate) {
                                        router.get(`/workers/${worker.id}/report`, { 
                                            mode: 'range', 
                                            start_date: startDate, 
                                            end_date: endDate 
                                        }, { 
                                            preserveState: true, 
                                            preserveScroll: true 
                                        });
                                    }
                                }}
                                className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-md transition hover:bg-blue-700 md:mt-0"
                            >
                                اعمال فیلتر
                            </button>
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