<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AttendanceController extends Controller
{
    public function viewAttendance()
    {
        $workers = auth()->user()->workers;
        return view('attendance', compact('workers'));
    }

    public function checkin(Request $request)
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id'
        ]);

        // Ensure worker belongs to authenticated user
        $worker = auth()->user()->workers()->findOrFail($request->worker_id);

        $today = now()->toDateString();

        $attendance = Attendance::firstOrCreate(
            ['worker_id' => $worker->id, 'date' => $today]
        );

        if ($attendance->check_in) {
            return redirect()->back()->with('message', 'امروز قبلا ورود ثبت شده');
        }

        $attendance->update(['check_in' => now()]);
        return redirect()->back()->with('message', 'ورود ثبت شد');
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id'
        ]);

        // Ensure worker belongs to authenticated user
        $worker = auth()->user()->workers()->findOrFail($request->worker_id);

        $today = now()->toDateString();

        $attendance = Attendance::where('worker_id', $worker->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return redirect()->back()->with('message', 'اول باید ورود بزنید');
        }

        if (!$attendance->check_in) {
            return redirect()->back()->with('message', 'اول باید ورود بزنید');
        }

        if ($attendance->check_out) {
            return redirect()->back()->with('message', 'قبلا خروج ثبت شده');
        }

        $attendance->update(['check_out' => now()]);
        return redirect()->back()->with('message', 'خروج ثبت شد');
    }

    public function all()
    {
        return Attendance::with('worker')
            ->orderBy('date', 'desc')
            ->get();
    }

    public function list(Request $request)
    {
        // دریافت تاریخ از درخواست یا استفاده از تاریخ امروز
        $date = $request->get('date', now()->toDateString());

        // دریافت لیست حضور و غیاب بر اساس تاریخ و کارمندان کاربر
        $attendances = Attendance::with('worker')
            ->whereIn('worker_id', auth()->user()->workers()->pluck('id'))
            ->where('date', $date)
            ->orderBy('check_in', 'asc')
            ->get();

        // محاسبه ساعات کار و تاخیر
        $attendances->each(function ($attendance) use ($date) {
            if ($attendance->check_in && $attendance->check_out) {
                $checkIn = \Carbon\Carbon::parse($attendance->check_in);
                $checkOut = \Carbon\Carbon::parse($attendance->check_out);

                // محاسبه ساعت کار
                $hours = $checkIn->diffInHours($checkOut);
                $minutes = $checkIn->diffInMinutes($checkOut) % 60;
                $attendance->work_hours = sprintf('%02d:%02d', $hours, $minutes);
                $attendance->total_minutes = $checkOut->diffInMinutes($checkIn);

                // محاسبه تاخیر (اگر بعد از ساعت 9 وارد شده باشد)
                $expectedStart = \Carbon\Carbon::parse('09:00');
                if ($checkIn->greaterThan($expectedStart)) {
                    $attendance->is_late = true;
                    $attendance->late_minutes = $checkIn->diffInMinutes($expectedStart);
                } else {
                    $attendance->is_late = false;
                    $attendance->late_minutes = 0;
                }
            } else {
                $attendance->work_hours = '-';
                $attendance->total_minutes = 0;
                $attendance->is_late = false;
                $attendance->late_minutes = 0;
            }

            // محاسبه ساعات کاری هفتگی
            $startOfWeek = Carbon::parse($date)->startOfWeek();
            $endOfWeek = Carbon::parse($date)->endOfWeek();

            $weeklyAttendances = Attendance::where('worker_id', $attendance->worker_id)
                ->whereBetween('date', [$startOfWeek->toDateString(), $endOfWeek->toDateString()])
                ->whereNotNull('check_in')
                ->whereNotNull('check_out')
                ->get();

            $weeklyMinutes = 0;
            foreach ($weeklyAttendances as $weekly) {
                if ($weekly->check_in && $weekly->check_out) {
                    $weeklyMinutes += Carbon::parse($weekly->check_in)->diffInMinutes(Carbon::parse($weekly->check_out));
                }
            }

            $attendance->weekly_hours = floor($weeklyMinutes / 60) . ':' . sprintf('%02d', $weeklyMinutes % 60);
            $attendance->weekly_minutes = $weeklyMinutes;

            // محاسبه ساعات کاری ماهانه
            $startOfMonth = Carbon::parse($date)->startOfMonth();
            $endOfMonth = Carbon::parse($date)->endOfMonth();

            $monthlyAttendances = Attendance::where('worker_id', $attendance->worker_id)
                ->whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
                ->whereNotNull('check_in')
                ->whereNotNull('check_out')
                ->get();

            $monthlyMinutes = 0;
            foreach ($monthlyAttendances as $monthly) {
                if ($monthly->check_in && $monthly->check_out) {
                    $monthlyMinutes += Carbon::parse($monthly->check_in)->diffInMinutes(Carbon::parse($monthly->check_out));
                }
            }

            $attendance->monthly_hours = floor($monthlyMinutes / 60) . ':' . sprintf('%02d', $monthlyMinutes % 60);
            $attendance->monthly_minutes = $monthlyMinutes;
        });

        // آمار
        $totalWorkers = auth()->user()->workers()->count();
        $presentWorkers = $attendances->whereNotNull('check_in')->count();
        $absentWorkers = $totalWorkers - $presentWorkers;

        return view('attendance-list', compact('attendances', 'date', 'totalWorkers', 'presentWorkers', 'absentWorkers'));
    }
}
