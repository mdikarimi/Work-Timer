<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function viewAttendance(): Response
    {
        $today = now()->toDateString();

        $workers = auth()->user()
            ->workers()
            ->with(['attendances' => function ($query) use ($today) {
                $query->where('date', $today)
                    ->orderBy('created_at', 'desc');
            }])
            ->get()
            ->map(function ($worker) {
                $latestAttendance = $worker->attendances->first();

                // وضعیت بر اساس آخرین رکورد
                $status = 'absent';
                if ($latestAttendance) {
                    if ($latestAttendance->check_out) {
                        // اگر آخرین رکورد خروج داشته باشد، یعنی کامل شده
                        $status = 'complete';
                    } else {
                        // اگر فقط ورود داشته باشد، یعنی در حال کار است
                        $status = 'working';
                    }
                }

                // همه ورود و خروج‌های امروز
                $attendancesToday = $worker->attendances->map(function ($att) {
                    return [
                        'check_in' => $att->check_in,
                        'check_out' => $att->check_out,
                    ];
                });

                return [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'code' => $worker->code,
                    'attendances' => $attendancesToday,
                    'attendance' => [ // برای سازگاری با کد قبلی
                        'check_in' => $latestAttendance?->check_in,
                        'check_out' => $latestAttendance?->check_out,
                        'status' => $status,
                    ],
                ];
            });

        $present = $workers->filter(fn($worker) => $worker['attendance']['status'] === 'complete')->count();
        $working = $workers->filter(fn($worker) => $worker['attendance']['status'] === 'working')->count();
        $total = $workers->count();

        return Inertia::render('Attendance/Index', [
            'today' => $today,
            'workers' => $workers->values(),
            'stats' => [
                'total' => $total,
                'present' => $present,
                'working' => $working,
                'absent' => $total - ($present + $working),
            ],
        ]);
    }

    public function autoCheckoutDaily()
    {
        $today = now()->toDateString();

        // پیدا کردن تمام حضور و غیاب‌های امروز که خروج ندارند
        $incompleteAttendances = Attendance::where('date', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->get();

        foreach ($incompleteAttendances as $attendance) {
            $attendance->update([
                'check_out' => $today . ' 23:00:00'
            ]);
        }

        return response()->json([
            'message' => 'Auto checkout completed for ' . $incompleteAttendances->count() . ' workers',
            'count' => $incompleteAttendances->count()
        ]);
    }

    public function checkin(Request $request)
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id'
        ]);

        // Ensure worker belongs to authenticated user
        $worker = auth()->user()->workers()->findOrFail($request->worker_id);

        $today = now()->toDateString();
        $now = now();

        // بررسی آخرین رکورد امروز
        $lastAttendance = Attendance::where('worker_id', $worker->id)
            ->where('date', $today)
            ->orderBy('created_at', 'desc')
            ->first();

        // اگر آخرین رکورد بدون خروج باشد، نمی‌توان ورود جدید ثبت کرد
        if ($lastAttendance && !$lastAttendance->check_out) {
            return redirect()->back()->with('message', 'ابتدا باید خروج قبلی را ثبت کنید');
        }

        // ایجاد رکورد جدید برای ورود
        $attendance = Attendance::create([
            'worker_id' => $worker->id,
            'date' => $today,
            'check_in' => $now,
            'check_out' => null,
        ]);

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

        // پیدا کردن آخرین رکورد بدون خروج برای امروز
        $attendance = Attendance::where('worker_id', $worker->id)
            ->where('date', $today)
            ->whereNull('check_out')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$attendance) {
            return redirect()->back()->with('message', 'ابتدا باید ورود بزنید');
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

    public function list(Request $request): Response
    {
        $date = $request->get('date', now()->toDateString());
        $workerIds = auth()->user()->workers()->pluck('id');

        $attendances = Attendance::with('worker')
            ->whereIn('worker_id', $workerIds)
            ->where('date', $date)
            ->orderBy('check_in', 'asc')
            ->get()
            ->map(function ($attendance) use ($date) {
                $checkIn = $attendance->check_in ? Carbon::parse($attendance->check_in) : null;
                $checkOut = $attendance->check_out ? Carbon::parse($attendance->check_out) : null;

                $workHours = '-';
                $totalMinutes = 0;
                $isLate = false;
                $lateMinutes = 0;

                if ($checkIn && $checkOut) {
                    $hours = $checkIn->diffInHours($checkOut);
                    $minutes = $checkIn->diffInMinutes($checkOut) % 60;
                    $workHours = sprintf('%02d:%02d', $hours, $minutes);
                    $totalMinutes = $checkOut->diffInMinutes($checkIn);

                    $expectedStart = Carbon::parse('09:00');
                    if ($checkIn->greaterThan($expectedStart)) {
                        $isLate = true;
                        $lateMinutes = $checkIn->diffInMinutes($expectedStart);
                    }
                }

                $weeklyMinutes = $this->calculateRangeMinutes(
                    $attendance->worker_id,
                    Carbon::parse($date)->startOfWeek(),
                    Carbon::parse($date)->endOfWeek()
                );

                $monthlyMinutes = $this->calculateRangeMinutes(
                    $attendance->worker_id,
                    Carbon::parse($date)->startOfMonth(),
                    Carbon::parse($date)->endOfMonth()
                );

                $status = 'absent';
                if ($attendance->check_in && $attendance->check_out) {
                    $status = 'present';
                } elseif ($attendance->check_in) {
                    $status = 'working';
                }

                return [
                    'id' => $attendance->id,
                    'worker' => [
                        'id' => $attendance->worker?->id,
                        'name' => $attendance->worker?->name,
                        'code' => $attendance->worker?->code,
                    ],
                    'date' => $attendance->date,
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'work_hours' => $workHours,
                    'weekly_hours' => floor($weeklyMinutes / 60) . ':' . sprintf('%02d', $weeklyMinutes % 60),
                    'monthly_hours' => floor($monthlyMinutes / 60) . ':' . sprintf('%02d', $monthlyMinutes % 60),
                    'weekly_minutes' => $weeklyMinutes,
                    'monthly_minutes' => $monthlyMinutes,
                    'total_minutes' => $totalMinutes,
                    'is_late' => $isLate,
                    'late_minutes' => $lateMinutes,
                    'status' => $status,
                ];
            });

        $totalWorkers = $workerIds->count();
        $presentWorkers = $attendances->filter(fn($attendance) => $attendance['status'] !== 'absent')->count();
        $absentWorkers = $totalWorkers - $presentWorkers;

        return Inertia::render('Attendance/List', [
            'date' => $date,
            'attendances' => $attendances->values(),
            'totals' => [
                'total' => $totalWorkers,
                'present' => $presentWorkers,
                'absent' => $absentWorkers,
            ],
        ]);
    }

    private function calculateRangeMinutes(int $workerId, Carbon $start, Carbon $end): int
    {
        return Attendance::where('worker_id', $workerId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(function ($carry, $attendance) {
                return $carry + Carbon::parse($attendance->check_in)
                    ->diffInMinutes(Carbon::parse($attendance->check_out));
            }, 0);
    }
}
