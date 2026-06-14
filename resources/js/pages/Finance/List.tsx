import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type FinanceRecord = {
    id: number;
    worker_id: number;
    description: string;
    price: number;
    created_at: string;
    updated_at: string;
    worker: {
        id: number;
        name: string;
        user_id: number;
    };
};

type Worker = {
    id: number;
    name: string;
};

type PageProps = {
    finances: FinanceRecord[];
    workers: Worker[];
    total_amount: number;
    date: string;
    start_date?: string;
    end_date?: string;
    flash?: {
        message?: string | null;
        success?: string | null;
        status?: string | null;
    };
};

export default function FinanceList({ finances, workers, total_amount, date, start_date, end_date }: PageProps) {
    const { flash } = usePage().props as PageProps;
    const [selectedDate, setSelectedDate] = useState<string>(date);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [datePickerDate, setDatePickerDate] = useState<Date | null>(moment(date, 'YYYY-MM-DD').toDate());
    const [startDate, setStartDate] = useState<string | null>(start_date || null);
    const [endDate, setEndDate] = useState<string | null>(end_date || null);
    const [startDatePicker, setStartDatePicker] = useState<Date | null>(start_date ? moment(start_date, 'YYYY-MM-DD').toDate() : null);
    const [endDatePicker, setEndDatePicker] = useState<Date | null>(end_date ? moment(end_date, 'YYYY-MM-DD').toDate() : null);

    useEffect(() => {
        setSelectedDate(date);
        setDatePickerDate(moment(date, 'YYYY-MM-DD').toDate());
        setStartDate(start_date || null);
        setEndDate(end_date || null);
        setStartDatePicker(start_date ? moment(start_date, 'YYYY-MM-DD').toDate() : null);
        setEndDatePicker(end_date ? moment(end_date, 'YYYY-MM-DD').toDate() : null);
    }, [date, start_date, end_date]);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const shiftDate = (offset: number) => {
        const current = moment(date, 'YYYY-MM-DD');
        current.add(offset, 'days');
        return current.format('YYYY-MM-DD');
    };

    const goToDate = (nextDate: string, start?: string, end?: string) => {
        const params: any = {};
        if (start && end) {
            params.start_date = start;
            params.end_date = end;
        } else {
            params.date = nextDate;
        }
        router.get('/finance/list', params, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
            setDatePickerDate(date);
            goToDate(formattedDate);
        }
    };

    const handleRangeChange = () => {
        if (startDate && endDate) {
            goToDate('', startDate, endDate);
        }
    };

    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            const formatted = moment(date).format('YYYY-MM-DD');
            setStartDate(formatted);
            setStartDatePicker(date);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            const formatted = moment(date).format('YYYY-MM-DD');
            setEndDate(formatted);
            setEndDatePicker(date);
        }
    };

    const formatJalaliDate = (dateString: string) => {
        return moment(dateString, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    const formatDate = (dateString: string) => {
        return moment(dateString).locale('fa').format('jYYYY/jMM/jDD - HH:mm');
    };

    // کاستوم‌سازی نمایش تاریخ شمسی در datepicker
    const locale = {
        localize: {
            day: (n: number) => moment.localeData('fa').weekdays()[n],
            month: (n: number) => moment.localeData('fa').months()[n],
        },
        formatLong: {
            date: () => 'yyyy/MM/dd',
        },
    };

    // کامپوننت سفارشی برای نمایش تاریخ در input
    const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
        <button
            type="button"
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-right text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            onClick={onClick}
            ref={ref}
        >
            {value ? moment(value, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD') : 'انتخاب تاریخ'}
        </button>
    ));

    return (
        <>
            <Head title="لیست عملیات مالی - الف شاپ" />

            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-7xl p-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-black text-gray-900">لیست عملیات مالی</h1>
                        <p className="text-gray-600">گزارش عملیات‌های مالی</p>
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

                    {/* Date Filter */}
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">فیلتر تاریخ</h3>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => goToDate(shiftDate(-1))}
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-md transition hover:bg-gray-200"
                                    >
                                        روز قبل
                                    </button>

                                    <div className="relative w-48">
                                        <DatePicker
                                            selected={datePickerDate}
                                            onChange={handleDateChange}
                                            dateFormat="yyyy/MM/dd"
                                            locale={locale}
                                            customInput={<CustomInput />}
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
                                                    <span className="text-lg font-semibold">{moment(date).locale('fa').format('jMMMM jYYYY')}</span>
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
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-md transition hover:bg-gray-200"
                                    >
                                        روز بعد
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => goToDate(moment().format('YYYY-MM-DD'))}
                                    className="rounded-lg bg-blue-100 px-4 py-2 text-sm text-blue-700 shadow-md transition hover:bg-blue-200"
                                >
                                    امروز
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-md font-medium text-gray-700 mb-2">بازه زمانی</h4>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">از:</label>
                                    <div className="relative w-32">
                                        <DatePicker
                                            selected={startDatePicker}
                                            onChange={handleStartDateChange}
                                            dateFormat="yyyy/MM/dd"
                                            locale={locale}
                                            customInput={<CustomInput />}
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
                                                    <span className="text-lg font-semibold">{moment(date).locale('fa').format('jMMMM jYYYY')}</span>
                                                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1">
                                                        ›
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">تا:</label>
                                    <div className="relative w-32">
                                        <DatePicker
                                            selected={endDatePicker}
                                            onChange={handleEndDateChange}
                                            dateFormat="yyyy/MM/dd"
                                            locale={locale}
                                            customInput={<CustomInput />}
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
                                                    <span className="text-lg font-semibold">{moment(date).locale('fa').format('jMMMM jYYYY')}</span>
                                                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1">
                                                        ›
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRangeChange}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-green-700"
                                >
                                    اعمال فیلتر
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">تعداد عملیات</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{finances.length} عملیات</h3>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3 text-blue-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">کارمندان</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{workers.length} نفر</h3>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3 text-green-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">جمع کل مبالغ</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{formatPrice(total_amount)}</h3>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3 text-purple-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h1v2a2 2 0 002 2h2v-2H7v-1a2 2 0 00-2-2H5V8h1a2 2 0 002-2V4h2a2 2 0 002 2v1a2 2 0 002 2h1v2h-1a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2h-1V8h1a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v1a2 2 0 00-2 2H3a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v8a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2h-1v-2h1a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h2a2 2 0 002-2V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Finance Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">
                                    عملیات‌های مالی
                                    {startDate && endDate ? ` - از ${formatJalaliDate(startDate)} تا ${formatJalaliDate(endDate)}` : ` - ${formatJalaliDate(selectedDate)}`}
                                </h2>
                                <a
                                    href="/finance"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700"
                                >
                                    + ثبت عملیات جدید
                                </a>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">ردیف</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">نام کارمند</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">توضیحات</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">مبلغ</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">تاریخ ثبت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg
                                                        className="mb-2 h-12 w-12 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                    <h3 className="mb-1 text-lg font-medium text-gray-500">هیچ عملیات مالی ثبت نشده است</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {startDate && endDate ? `برای بازه ${formatJalaliDate(startDate)} تا ${formatJalaliDate(endDate)} عملیاتی یافت نشد.` : `برای تاریخ ${formatJalaliDate(selectedDate)} عملیاتی یافت نشد.`}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        finances.map((finance, index) => (
                                            <tr key={finance.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="font-medium text-gray-800">{finance.worker.name}</div>
                                                    <div className="text-sm text-gray-500">کد: {finance.worker.id}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {finance.description}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-bold ${finance.price >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPrice(Math.abs(finance.price))}
                                                        {finance.price < 0 && <span className="mr-1 text-xs">(بدهی)</span>}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {formatDate(finance.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {finances.length > 0 && (
                            <>
                                {/* جمع‌بندی */}
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                        <div className="font-medium text-gray-700">
                                            <span className="ml-2">جمع کل:</span>
                                            <span className={`text-lg font-bold ${total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatPrice(Math.abs(total_amount))}
                                            </span>
                                        </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex items-center justify-between">
                        <a
                            href="/admin"
                            className="inline-flex items-center rounded-lg bg-gray-200 px-6 py-3 text-gray-900 shadow-md transition hover:bg-gray-300"
                        >
                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            صفحه ادمین
                        </a>

                        <div className="flex gap-2">
                            <a
                                href="/finance"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700"
                            >
                                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                ثبت عملیات جدید
                            </a>
                            <a
                                href="/attendance-list"
                                className="inline-flex items-center rounded-lg bg-gray-600 px-6 py-3 text-white shadow-md transition hover:bg-gray-700"
                            >
                                لیست حضور و غیاب
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}