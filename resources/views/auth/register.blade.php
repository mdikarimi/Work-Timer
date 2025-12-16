<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ثبت‌نام در سیستم حضور و غیاب</title>
    
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
        <!-- هدر ثبت‌نام -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-black text-gray-900 mb-2">
                ایجاد حساب کاربری
            </h1>
        </div>

        <!-- کارت ثبت‌نام -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div class="p-8">
                @if($errors->any())
                    <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-500 text-lg"></i>
                            </div>
                            <div class="mr-3">
                                <h3 class="text-sm font-medium text-red-800">خطا در ثبت‌نام</h3>
                                <div class="mt-1 text-sm text-red-700">
                                    @foreach($errors->all() as $error)
                                        <p>{{ $error }}</p>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                @endif

                @if(session('success'))
                    <div class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle text-green-500 text-lg"></i>
                            </div>
                            <div class="mr-3">
                                <h3 class="text-sm font-medium text-green-800">موفقیت</h3>
                                <div class="mt-1 text-sm text-green-700">
                                    {{ session('success') }}
                                </div>
                            </div>
                        </div>
                    </div>
                @endif

                <form method="POST" action="{{ route('register') }}">
                    @csrf

                    <!-- نام کامل -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-user ml-1 text-gray-400"></i>
                            نام کامل
                        </label>
                        <input type="text" name="name" id="name" value="{{ old('name') }}"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700  bg-gray-100 transition"
                            placeholder="نام و نام خانوادگی خود را وارد کنید" required autofocus>
                    </div>

                    <!-- شماره تلفن -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-phone ml-1 text-gray-400"></i>
                            شماره تلفن
                        </label>
                        <div class="relative">
                            <input type="tel" name="phone" id="phone" value="{{ old('phone') }}"
                                class="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl text-gray-700 bg-gray-100 transition text-left"
                                placeholder="" required dir="ltr">
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
                            <button type="button" onclick="togglePassword('password')"
                                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i class="fas fa-eye" id="eye-password"></i>
                            </button>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">رمز عبور باید حداقل 8 کاراکتر باشد</p>
                    </div>

                    <!-- تأیید رمز عبور -->
                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock ml-1 text-gray-400"></i>
                            تأیید رمز عبور
                        </label>
                        <div class="relative">
                            <input type="password" name="password_confirmation" id="password_confirmation"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-gray-100 transition"
                                placeholder="رمز عبور را مجدداً وارد کنید" required>
                            <button type="button" onclick="togglePassword('password_confirmation')"
                                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i class="fas fa-eye" id="eye-confirm"></i>
                            </button>
                        </div>
                    </div>

                    <!-- دکمه ثبت‌نام -->
                    <button type="submit"
                        class="w-full bg-green-300 text-green-800 hover:bg-green-200 font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 mb-4">
                        <i class="fas fa-user-plus ml-2"></i>
                        ثبت‌نام
                    </button>

                    <!-- لینک ورود -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            قبلاً حساب دارید؟
                            <a href="{{ route('login') }}" class="text-green-600 hover:text-green-800 font-medium">
                                وارد شوید
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // نمایش/مخفی کردن رمز عبور
        function togglePassword(fieldId) {
            const passwordInput = document.getElementById(fieldId);
            const eyeIcon = document.getElementById(`eye-${fieldId === 'password' ? 'password' : 'confirm'}`);

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

        // اعتبارسنجی تطابق رمز عبور
        document.getElementById('password').addEventListener('input', function (e) {
            const password = e.target.value;
            const confirmPassword = document.getElementById('password_confirmation');

            if (confirmPassword.value && password !== confirmPassword.value) {
                confirmPassword.setCustomValidity('رمز عبورها مطابقت ندارند');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });

        document.getElementById('password_confirmation').addEventListener('input', function (e) {
            const password = document.getElementById('password').value;
            const confirmPassword = e.target.value;

            if (password !== confirmPassword) {
                e.target.setCustomValidity('رمز عبورها مطابقت ندارند');
            } else {
                e.target.setCustomValidity('');
            }
        });
    </script>
</body>

</html>