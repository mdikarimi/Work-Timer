<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\FinanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::get('/', [AttendanceController::class, 'viewAttendance'])->name('attendance.view');
    Route::post('/checkin', [AttendanceController::class, 'checkin'])->name('attendance.checkin');
    Route::post('/checkout', [AttendanceController::class, 'checkout'])->name('attendance.checkout');
    Route::post('/attendance/auto-checkout', [AttendanceController::class, 'autoCheckoutDaily']);
    Route::get('/attendance-list', [AttendanceController::class, 'list'])->name('attendance.list');

    Route::get('/admin', [WorkerController::class, 'viewAdmin'])->name('admin.view');
    Route::post('/workers', [WorkerController::class, 'store'])->name('workers.store');
    Route::delete('/workers/{id}', [WorkerController::class, 'destroy'])->name('workers.destroy');

    Route::get('finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::get('finance/list', [FinanceController::class, 'list'])->name('finance.list');
    Route::post('finance', [FinanceController::class, 'store'])->name('finance.store');

    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
});
