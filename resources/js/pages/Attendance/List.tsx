import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    const [selectedDate, setSelectedDate] = useState<string>(date);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [datePickerDate, setDatePickerDate] = useState<Date | null>(moment(date, 'YYYY-MM-DD').toDate());

    useEffect(() => {
        setSelectedDate(date);
        setDatePickerDate(moment(date, 'YYYY-MM-DD').toDate());
    }, [date]);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formatTime = (value?: string | null) => {
        if (!value) return '--:--';
        const dt = new Date(value);
        return dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    };

    const shiftDate = (offset: number) => {
        const current = moment(date, 'YYYY-MM-DD');
        current.add(offset, 'days');
        return current.format('YYYY-MM-DD');
    };

    const goToDate = (nextDate: string) => {
        router.get('/attendance-list', { date: nextDate }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
            setDatePickerDate(date);
            goToDate(formattedDate);
        }
    };

    const formatJalaliDate = (dateString: string) => {
        return moment(dateString, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');
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
            <Head title="لیست حضور و غیاب" />

            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-7xl p-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-black text-gray-900">لیست حضور و غیاب</h1>
                        <p className="text-gray-600">گزارش روزانه حضور کارکنان</p>
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
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => goToDate(shiftDate(-1))}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-md transition hover:bg-gray-200"
                                >
                                    روز قبل
                                </button>

                                <div className="relative">
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
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-md transition hover:bg-gray-200"
                            >
                                امروز
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">کل کارکنان</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{totals.total} نفر</h3>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3 text-blue-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">حاضرین</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{totals.present} نفر</h3>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3 text-green-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">غایبین</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{totals.absent} نفر</h3>
                                </div>
                                <div className="rounded-lg bg-red-100 p-3 text-red-500">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">کارکنان</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border-b border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">نام</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">ورود</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">خروج</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">ساعات امروز</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">ساعات هفتگی</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">ساعات ماهانه</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center">
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
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                    <h3 className="mb-1 text-lg font-medium text-gray-500">رکوردی یافت نشد</h3>
                                                    <p className="text-sm text-gray-400">هیچ اطلاعات حضور و غیابی برای این تاریخ ثبت نشده است.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        attendances.map((attendance) => {
                                            let status = 'غایب';
                                            let statusClass = 'bg-gray-100 text-gray-800';

                                            if (attendance.status === 'present') {
                                                status = 'حاضر';
                                                statusClass = 'bg-green-100 text-green-800';
                                            } else if (attendance.status === 'working') {
                                                status = 'در محل کار';
                                                statusClass = 'bg-yellow-100 text-yellow-800';
                                            }

                                            return (
                                                <tr key={attendance.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="font-medium text-gray-800">{attendance.worker.name ?? 'نامشخص'}</div>
                                                        <div className="text-sm text-gray-500">{attendance.worker.code ?? ''}</div>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        {attendance.check_in ? (
                                                            <>
                                                                <span className="font-medium text-gray-800">{formatTime(attendance.check_in)}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">--:--</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        {attendance.check_out ? (
                                                            <span className="font-medium text-gray-800">{formatTime(attendance.check_out)}</span>
                                                        ) : (
                                                            <span className="text-gray-400">--:--</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-medium text-blue-700">{attendance.work_hours}</span>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-medium text-purple-700">{attendance.weekly_hours}</span>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-medium text-amber-700">{attendance.monthly_hours}</span>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}>
                                                            {status}
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
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">{attendances.length} رکورد</div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-md transition hover:bg-gray-50"
                                        >
                                            چاپ گزارش
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-4 flex items-center justify-between">
                        <a
                            href="/admin"
                            className="inline-flex items-center rounded-lg bg-gray-300 px-6 py-3 text-gray-900 shadow-md transition hover:bg-gray-200"
                        >
                            پنل ادمین
                        </a>

                        <a
                            href="/finance/list"
                            className="inline-flex items-center rounded-lg bg-gray-300 text-gray-900 hover:bg-gray-200 px-6 py-3  shadow-md transition"
                        >
                            گزارش امور مالی
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
