<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدیریت نیروهای کاری - الف شاپ</title>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    @vite(['resources/css/app.css'])

    <style>
        body {
            font-family: Vazirmatn, sans-serif;
        }
    </style>
</head>

<body class="bg-gray-100">
    <div class="max-w-6xl mx-auto p-4">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-black text-gray-900 mb-1">
                    مدیریت نیروهای کاری
                </h1>
                <p class="text-gray-600">افزودن و حذف کارکنان</p>
            </div>
            <div class="flex justify-between items-center">
                <!-- دکمه خروج (Logout) -->
                <form method="POST" action="{{ route('logout') }}" class="ml-4">
                    @csrf
                    <button type="submit"
                        class="inline-flex items-center shadow-md px-6 py-3 bg-red-300 text-red-900 rounded-lg hover:bg-red-200 transition duration-200">
                        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        خروج از سیستم
                    </button>
                </form>

                <a href="{{ url('/attendance-list') }}"
                    class="inline-flex items-center border border-gray-200 shadow-md px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition ml-4">
                    <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    لیست کامل
                </a>

                <a href="{{ url('/') }}"
                    class="inline-flex items-center border border-gray-200 shadow-md px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition">
                    صفحه اصلی
                </a>
            </div>
        </div>

        <!-- Success Message -->
        @if(session('message'))
            <div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    {{ session('message') }}
                </div>
            </div>
        @endif

        <!-- Add Worker Form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4">افزودن نیروی جدید</h2>
            <form method="POST" action="{{ route('workers.store') }}" class="flex flex-col md:flex-row gap-4">
                @csrf
                <div class="flex-1">
                    <input type="text" name="name" placeholder="نام کامل نیرو را وارد کنید"
                        class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required>
                </div>
                <button type="submit"
                    class="bg-green-300  shadow-md text-green-800 rounded-lg hover:bg-green-200 font-medium px-6 py-3 transition duration-200 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    افزودن نیرو
                </button>
            </form>
        </div>

        <!-- Workers List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">لیست نیروها</h2>
                    <p class="text-sm text-gray-500 mt-1">{{ $workers->count() }} نیرو ثبت شده</p>
                </div>
            </div>

            <!-- کارت‌های فلکس برای نمایش در دسکتاپ -->
            <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
                @forelse($workers as $worker)
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center">
                                <div class="ml-3">
                                    <h3 class="font-bold text-gray-800 text-lg">{{ $worker->name }}</h3>
                                    <div class="flex items-center mt-1 space-x-2 space-x-reverse">
                                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">شناسه:
                                            {{ $worker->id }}</span>
                                        @if($worker->code)
                                            <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">کد:
                                                {{ $worker->code }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>

                            <form method="POST" action="{{ route('workers.destroy', $worker->id) }}"
                                onsubmit="return confirm('آیا از حذف «{{ $worker->name }}» اطمینان دارید؟')"
                                class="flex-shrink-0">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition duration-200">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        <div class="border-t border-gray-100 pt-4">
                            <div class="flex justify-between items-center">
                                <div class="text-sm text-gray-500">
                                    <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    عضویت: {{ $worker->created_at->diffForHumans() }}
                                </div>
                                <span class="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    فعال
                                </span>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-span-full">
                        <div class="text-center py-12">
                            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-gray-500 mb-2">هنوز نیرویی اضافه نشده است</h3>
                            <p class="text-gray-400 text-sm">برای شروع، یک نیروی جدید اضافه کنید.</p>
                        </div>
                    </div>
                @endforelse
            </div>

            <!-- نمایش لیست ساده برای موبایل -->
            <div class="md:hidden">
                <div class="space-y-3 p-4">
                    @forelse($workers as $worker)
                        <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <!-- ردیف اول: اطلاعات اصلی -->
                            <div class="flex items-center justify-between mb-3">
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">{{ $worker->name }}</div>
                                    <div class="text-xs text-gray-500 mt-1">
                                        شناسه: {{ $worker->id }}
                                        @if($worker->code)
                                            • کد: {{ $worker->code }}
                                        @endif
                                    </div>
                                </div>

                                <form method="POST" action="{{ route('workers.destroy', $worker->id) }}"
                                    onsubmit="return confirm('آیا از حذف «{{ $worker->name }}» اطمینان دارید؟')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-500 hover:text-red-700 p-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </form>
                            </div>

                            <!-- ردیف دوم: اطلاعات تکمیلی -->
                            <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                                <span class="text-xs text-gray-500">
                                    {{ $worker->created_at->diffForHumans() }}
                                </span>
                                <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    فعال
                                </span>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8">
                            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p class="text-gray-500">هنوز نیرویی اضافه نشده است</p>
                        </div>
                    @endforelse
                </div>
            </div>

            @if($workers->isNotEmpty())
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            {{ $workers->count() }} نیرو در سیستم ثبت شده‌اند
                        </div>
                        <div class="text-sm text-gray-500">
                            آخرین بروزرسانی: {{ now()->format('H:i') }}
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <script>
        // Auto-hide success message after 5 seconds
        @if(session('message'))
            setTimeout(function () {
                const messageDiv = document.querySelector('.bg-green-50');
                if (messageDiv) {
                    messageDiv.style.opacity = '0';
                    messageDiv.style.transition = 'opacity 0.5s';
                    setTimeout(() => messageDiv.remove(), 500);
                }
            }, 5000);
        @endif
    </script>
</body>

</html>