<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|regex:/^09[0-9]{9}$/',
            'password' => 'required|string',
        ], [
            'phone.regex' => 'شماره تلفن باید با 09 شروع شود و 11 رقمی باشد.',
        ]);

        // پیدا کردن کاربر با شماره تلفن
        $user = User::where('phone', $request->phone)->first();

        // بررسی وجود کاربر و تطابق رمز عبور
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['شماره تلفن یا رمز عبور اشتباه است.'],
            ]);
        }

        // لاگین کردن کاربر
        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('attendance.view'));
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}