<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ورود به سیستم حضور و غیاب</title>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    @vite(['resources/css/app.css'])

    <style>
        body {
            font-family: Vazirmatn, sans-serif;
        }
    </style>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <!-- هدر لاگین -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-black text-gray-900 mb-2">
                ورود به سیستم
            </h1>
        </div>

        <!-- کارت لاگین -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div class="p-8">
                @if($errors->any())
                    <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-500 text-lg"></i>
                            </div>
                            <div class="mr-3">
                                <h3 class="text-sm font-medium text-red-800">خطا در ورود</h3>
                                <div class="mt-1 text-sm text-red-700">
                                    @foreach($errors->all() as $error)
                                        <p>{{ $error }}</p>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                @endif

                @if(session('status'))
                    <div class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle text-green-500 text-lg"></i>
                            </div>
                            <div class="mr-3">
                                <h3 class="text-sm font-medium text-green-800">موفقیت</h3>
                                <div class="mt-1 text-sm text-green-700">
                                    {{ session('status') }}
                                </div>
                            </div>
                        </div>
                    </div>
                @endif

                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <!-- شماره تلفن -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-phone ml-1 text-gray-400"></i>
                            شماره تلفن
                        </label>
                        <div class="relative">
                            <input type="tel" name="phone" id="phone" value="{{ old('phone') }}"
                                class="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl text-gray-700 bg-gray-100 transition text-left"
                                placeholder="" required autofocus dir="ltr">
                        </div>
                        <p class="mt-2 text-xs text-gray-500">شماره تلفن خود را وارد کنید</p>
                    </div>

                    <!-- رمز عبور -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock ml-1 text-gray-400"></i>
                            رمز عبور
                        </label>
                        <div class="relative">
                            <input type="password" name="password" id="password"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-gray-100 transition"
                                placeholder="رمز عبور خود را وارد کنید" required>
                            <button type="button" onclick="togglePassword()"
                                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i class="fas fa-eye" id="eye-icon"></i>
                            </button>
                        </div>
                    </div>

                    <!-- یادآوری -->
                    <div class="mb-8">
                        <div class="flex items-center">
                            <input type="checkbox" name="remember" id="remember"
                                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="remember" class="mr-2 block text-sm text-gray-700">
                                مرا به خاطر بسپار
                            </label>
                        </div>
                    </div>

                    <!-- دکمه ورود -->
                    <button type="submit"
                        class="w-full bg-gradient-to-r bg-blue-300 hover:bg-blue-200 text-blue-900 font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 mb-4">
                        <i class="fas fa-sign-in-alt ml-2"></i>
                        ورود به سیستم
                    </button>

                    <!-- لینک ثبت‌نام -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            حساب کاربری ندارید؟
                            <a href="{{ route('register') }}" class="text-blue-700 hover:text-blue-900 font-medium">
                                ثبت‌نام کنید
                            </a>
                        </p>
                    </div>
                </form>
            </div>

            <!-- فوتر کارت -->
            <div class="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        سیستم حضور و غیاب الف شاپ
                    </p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // نمایش/مخفی کردن رمز عبور
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        }

        // نمایش تاریخ امروز (اختیاری - می‌توانید حذف کنید)
        document.addEventListener('DOMContentLoaded', function () {
            const today = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const dateString = today.toLocaleDateString('fa-IR', options);

            // می‌توانید این را در جایی نمایش دهید اگر نیاز دارید
            console.log('تاریخ امروز:', dateString);
        });
    </script>
</body>

</html>