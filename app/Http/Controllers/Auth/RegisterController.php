<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    // نمایش فرم ثبت‌نام
    public function showRegistrationForm(): Response
    {
        return Inertia::render('Auth/Register');
    }

    // پردازش ثبت‌نام
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^09[0-9]{9}$/', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'شماره تلفن باید با 09 شروع شود و 11 رقمی باشد.',
            'phone.unique' => 'این شماره تلفن قبلاً ثبت شده است.',
        ]);

        // ایجاد کاربر جدید
        $user = User::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // لاگین کردن کاربر بعد از ثبت‌نام
        auth()->login($user);

        // ریدایرکت به صفحه اصلی
        return redirect()->route('attendance.view')
            ->with('success', 'ثبت‌نام با موفقیت انجام شد و وارد سیستم شدید!');
    }
}