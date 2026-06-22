import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import { useEffect, useState } from 'react';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';

type FinanceRecord = {
    id: number;
    worker_id: number;
    description: string;
    price: number;
    created_at: string;
    updated_at: string;
    worker: { id: number; name: string; user_id: number };
};

type Worker = { id: number; name: string };

type PageProps = {
    finances: FinanceRecord[];
    workers: Worker[];
    total_amount: number;
    date: string;
    start_date?: string;
    end_date?: string;
    flash?: { message?: string | null; success?: string | null; status?: string | null };
};

const toDateObject = (gregorianStr: string) =>
    new DateObject({ date: gregorianStr, calendar: gregorian }).convert(persian);

export default function FinanceList({ finances, workers, total_amount, date, start_date, end_date }: PageProps) {
    const { flash } = usePage().props as PageProps;
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [datePickerDate, setDatePickerDate] = useState<DateObject | null>(toDateObject(date));
    const [startDate, setStartDate] = useState<string | null>(start_date || null);
    const [endDate, setEndDate] = useState<string | null>(end_date || null);
    const [startDateObj, setStartDateObj] = useState<DateObject | null>(start_date ? toDateObject(start_date) : null);
    const [endDateObj, setEndDateObj] = useState<DateObject | null>(end_date ? toDateObject(end_date) : null);

    useEffect(() => {
        setDatePickerDate(toDateObject(date));
        setStartDate(start_date || null);
        setEndDate(end_date || null);
        setStartDateObj(start_date ? toDateObject(start_date) : null);
        setEndDateObj(end_date ? toDateObject(end_date) : null);
    }, [date, start_date, end_date]);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const shiftDate = (offset: number) =>
        moment(date, 'YYYY-MM-DD').add(offset, 'days').format('YYYY-MM-DD');

    const goToDate = (nextDate: string, start?: string, end?: string) => {
        const params: Record<string, string> = {};
        if (start && end) { params.start_date = start; params.end_date = end; }
        else { params.date = nextDate; }
        router.get('/finance/list', params, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (dateObj: DateObject | null) => {
        if (dateObj) {
            const gregorianDate = dateObj.convert(gregorian).format('YYYY-MM-DD');
            setDatePickerDate(dateObj);
            goToDate(gregorianDate);
        }
    };

    const handleStartDateChange = (dateObj: DateObject | null) => {
        if (dateObj) {
            setStartDate(dateObj.convert(gregorian).format('YYYY-MM-DD'));
            setStartDateObj(dateObj);
        } else { setStartDate(null); setStartDateObj(null); }
    };

    const handleEndDateChange = (dateObj: DateObject | null) => {
        if (dateObj) {
            setEndDate(dateObj.convert(gregorian).format('YYYY-MM-DD'));
            setEndDateObj(dateObj);
        } else { setEndDate(null); setEndDateObj(null); }
    };

    const handleRangeChange = () => {
        if (startDate && endDate) goToDate('', startDate, endDate);
    };

    // Jalali display helpers
    const toJalali = (gregorianStr: string) =>
        moment(gregorianStr, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');

    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان';

    const formatDateTime = (d: string) =>
        moment(d).locale('fa').format('jYYYY/jMM/jDD - HH:mm');

    const currentLabel = startDate && endDate
        ? `از ${toJalali(startDate)} تا ${toJalali(endDate)}`
        : toJalali(date);

    const inputClass =
        'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-right text-sm text-slate-200 transition-all duration-200 hover:border-teal-500/50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer';

    return (
        <>
            <Head title="لیست عملیات مالی - الف شاپ" />

            <div className="min-h-screen" style={{ background: '#050a12' }}>
                <div className="mx-auto max-w-7xl p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-xs text-teal-400/70 mb-1">الف شاپ</p>
                        <h1 className="text-3xl font-black text-white">لیست عملیات مالی</h1>
                        <p className="text-sm text-slate-400 mt-1">گزارش تراکنش‌های مالی پرسنل</p>
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
                    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 100 }}>
                        <h3 className="text-base font-bold text-slate-200 mb-5">فیلتر تاریخ</h3>

                        {/* Single day navigation */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => goToDate(shiftDate(-1))} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
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
                                <button type="button" onClick={() => goToDate(shiftDate(1))} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                                    روز بعد
                                </button>
                            </div>
                            <button type="button" onClick={() => goToDate(moment().format('YYYY-MM-DD'))} className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-400 transition-all duration-200 hover:bg-teal-500/20">
                                امروز
                            </button>
                        </div>

                        {/* Date range */}
                        <div className="border-t border-slate-700/50 pt-5">
                            <h4 className="text-sm font-medium text-slate-400 mb-3">بازه زمانی</h4>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-500 whitespace-nowrap">از:</label>
                                    <div className="w-36">
                                        <DatePicker
                                            value={startDateObj}
                                            onChange={handleStartDateChange}
                                            locale={persian_fa}
                                            calendar={persian}
                                            format="YYYY/MM/DD"
                                            inputClass={inputClass}
                                            containerClassName="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-500 whitespace-nowrap">تا:</label>
                                    <div className="w-36">
                                        <DatePicker
                                            value={endDateObj}
                                            onChange={handleEndDateChange}
                                            locale={persian_fa}
                                            calendar={persian}
                                            format="YYYY/MM/DD"
                                            inputClass={inputClass}
                                            containerClassName="w-full"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRangeChange}
                                    disabled={!startDate || !endDate}
                                    className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-5 py-2.5 text-sm font-medium text-teal-400 transition-all duration-200 hover:bg-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    اعمال فیلتر
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">تعداد عملیات</p>
                                    <h3 className="text-3xl font-black text-blue-400">{finances.length}</h3>
                                    <p className="text-xs text-slate-500 mt-1">عملیات</p>
                                </div>
                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                                    <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">کارمندان</p>
                                    <h3 className="text-3xl font-black text-teal-400">{workers.length}</h3>
                                    <p className="text-xs text-slate-500 mt-1">نفر</p>
                                </div>
                                <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-3">
                                    <svg className="h-6 w-6 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">جمع کل مبالغ</p>
                                    <h3 className="text-2xl font-black text-purple-400">{formatPrice(total_amount)}</h3>
                                </div>
                                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
                                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">
                                عملیات‌های مالی
                                <span className="text-sm font-normal text-slate-400 mr-2">{currentLabel}</span>
                            </h2>
                            <a href="/finance" className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 transition-all duration-200 hover:bg-teal-500/20">
                                + ثبت عملیات جدید
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50">
                                        {['ردیف', 'نام کارمند', 'توضیحات', 'مبلغ', 'تاریخ ثبت'].map((h) => (
                                            <th key={h} className="border-b border-slate-700/50 px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {finances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                                                        <svg className="h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-400 font-medium">هیچ عملیات مالی یافت نشد</p>
                                                    <p className="text-sm text-slate-600 mt-1">{currentLabel}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        finances.map((finance, index) => (
                                            <tr key={finance.id} className="border-b border-slate-700/30 transition-colors hover:bg-teal-500/5">
                                                <td className="px-4 py-3.5 text-right text-slate-500 text-sm">{index + 1}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="font-medium text-slate-100">{finance.worker.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">کد: {finance.worker.id}</div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-slate-300">{finance.description}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className={`font-bold ${finance.price >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {formatPrice(Math.abs(finance.price))}
                                                        {finance.price < 0 && <span className="mr-1 text-xs opacity-70">(بدهی)</span>}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-slate-400 text-sm">{formatDateTime(finance.created_at)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {finances.length > 0 && (
                            <div className="border-t border-slate-700/50 bg-slate-800/30 px-6 py-4 flex items-center justify-between">
                                <span className="text-sm text-slate-500">{finances.length} رکورد</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400">جمع کل:</span>
                                    <span className={`text-lg font-black ${total_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatPrice(Math.abs(total_amount))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex items-center justify-between">
                        <a href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                            صفحه ادمین
                        </a>
                        <div className="flex gap-3">
                            <a href="/finance" className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-200 hover:bg-teal-400">
                                + ثبت عملیات جدید
                            </a>
                            <a href="/attendance-list" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                                لیست حضور
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
