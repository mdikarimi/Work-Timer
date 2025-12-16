<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لیست حضور و غیاب</title>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    @vite(['resources/css/app.css'])

    <style>
        body {
            font-family: Vazirmatn, sans-serif;
        }
    </style>
</head>

<body class="bg-gray-100">
    <div class="max-w-7xl mx-auto p-4">
        <!-- هدر -->
        <div class="mb-8">
            <h1 class="text-3xl font-black text-gray-900 mb-2">
                لیست حضور و غیاب
            </h1>
            <p class="text-gray-600">گزارش روزانه حضور کارکنان</p>
        </div>

        <!-- فیلتر تاریخ -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <form action="{{ route('attendance.list') }}" method="GET" class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <a href="{{ route('attendance.list') }}?date={{ \Carbon\Carbon::parse($date)->subDay()->toDateString() }}"
                        class="px-4 py-2 bg-gray-100 shadow-md text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                        روز قبل
                    </a>

                    <input type="date" name="date" value="{{ $date }}"
                        class="px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onchange="this.form.submit()">

                    <a href="{{ route('attendance.list') }}?date={{ \Carbon\Carbon::parse($date)->addDay()->toDateString() }}"
                        class="px-4 py-2 bg-gray-100 shadow-md text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                        روز بعد
                    </a>
                </div>

                <a href="{{ route('attendance.list') }}?date={{ now()->toDateString() }}"
                    class="px-4 py-2 bg-gray-100 shadow-md text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                    امروز
                </a>
            </form>
        </div>

        <!-- آمار -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">کل کارکنان</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ $totalWorkers }} نفر</h3>
                    </div>
                    <div class="bg-blue-100 text-blue-500 p-3 rounded-lg">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">حاضرین</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ $presentWorkers }} نفر</h3>
                    </div>
                    <div class="bg-green-100 text-green-500 p-3 rounded-lg">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">غایبین</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ $absentWorkers }} نفر</h3>
                    </div>
                    <div class="bg-red-100 text-red-500 p-3 rounded-lg">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- جدول حضور و غیاب -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-800">کارکنان -
                    {{ \Carbon\Carbon::parse($date)->format('Y/m/d') }}
                </h2>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="py-3 px-4 text-right font-semibold text-gray-700 border-b border-gray-200">نام
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">ورود
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">خروج
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">ساعات
                                امروز
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">ساعات
                                هفتگی
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">ساعات
                                ماهانه
                            </th>
                            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">وضعیت
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($attendances as $attendance)
                            @php
                                $status = 'غایب';
                                $statusClass = 'bg-gray-100 text-gray-800';

                                if ($attendance->check_in && $attendance->check_out) {
                                    $status = 'حاضر';
                                    $statusClass = 'bg-green-100 text-green-800';
                                } elseif ($attendance->check_in && !$attendance->check_out) {
                                    $status = 'در محل کار';
                                    $statusClass = 'bg-yellow-100 text-yellow-800';
                                }
                            @endphp
                            <tr class="border-b border-gray-200 hover:bg-gray-50">
                                <td class="py-3 px-4 text-right">
                                    <div class="font-medium text-gray-800">{{ $attendance->worker->name ?? 'نامشخص' }}</div>
                                    <div class="text-sm text-gray-500">{{ $attendance->worker->code ?? '' }}</div>
                                </td>

                                <td class="py-3 px-4 text-center">
                                    @if($attendance->check_in)
                                        <span class="font-medium text-gray-800">
                                            {{ \Carbon\Carbon::parse($attendance->check_in)->format('H:i') }}
                                        </span>
                                        @if($attendance->is_late)
                                            <span class="block text-xs text-red-500">
                                                {{ $attendance->late_minutes }} دقیقه تاخیر
                                            </span>
                                        @endif
                                    @else
                                        <span class="text-gray-400">--:--</span>
                                    @endif
                                </td>

                                <td class="py-3 px-4 text-center">
                                    @if($attendance->check_out)
                                        <span class="font-medium text-gray-800">
                                            {{ \Carbon\Carbon::parse($attendance->check_out)->format('H:i') }}
                                        </span>
                                    @else
                                        <span class="text-gray-400">--:--</span>
                                    @endif
                                </td>

                                <td class="py-3 px-4 text-center">
                                    <span class="font-medium text-blue-700">{{ $attendance->work_hours }}</span>
                                </td>

                                <td class="py-3 px-4 text-center">
                                    <span class="font-medium text-purple-700">{{ $attendance->weekly_hours }}</span>
                                </td>

                                <td class="py-3 px-4 text-center">
                                    <span class="font-medium text-amber-700">{{ $attendance->monthly_hours }}</span>
                                </td>

                                <td class="py-3 px-4 text-center">
                                    <span
                                        class="inline-block px-3 py-1 text-sm font-medium rounded-full {{ $statusClass }}">
                                        {{ $status }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="py-8 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <h3 class="text-lg font-medium text-gray-500 mb-1">رکوردی یافت نشد</h3>
                                        <p class="text-gray-400 text-sm">هیچ اطلاعات حضور و غیابی برای این تاریخ ثبت نشده
                                            است.</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($attendances->isNotEmpty())
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            {{ $attendances->count() }} رکورد
                        </div>
                        <div class="flex gap-2">
                            <a href="javascript:window.print()"
                                class="px-4 py-2 bg-white border shadow-md border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm">
                                چاپ گزارش
                            </a>
                        </div>
                    </div>
                </div>
            @endif
        </div>

        <!-- دکمه بازگشت -->
        <div class="flex justify-between items-center mt-4">
            <a href="{{ url('/admin') }}"
                class="inline-flex items-center border border-gray-200 shadow-md px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition">
                صفحه ادمین
            </a>

            <a href="{{ url('/') }}"
                class="inline-flex items-center border border-gray-200 shadow-md px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition">
                صفحه اصلی
            </a>
        </div>
    </div>

    <script>
        // تاریخ امروز به صورت پیش‌فرض
        document.addEventListener('DOMContentLoaded', function () {
            const dateInput = document.querySelector('input[name="date"]');
            if (!dateInput.value) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
        });
    </script>
</body>

</html>