<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class WorkerController extends Controller
{
    public function viewAdmin(): Response
    {
        $workers = auth()->user()->workers()->latest()->get();

        return Inertia::render('Admin/Index', [
            'workers' => $workers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string'
        ]);

        $request->validate([
            'password' => 'required|string|min:4'
        ]);

        auth()->user()->workers()->create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('message', 'نیرو اضافه شد');
    }

    public function show(Request $request, Worker $worker)
    {
        // اطمینان از اینکه ادمین فقط به نیروهای خودش دسترسی دارد
        if ($worker->user_id !== auth()->id()) {
            abort(403);
        }

        // انتخاب تاریخ (از کوئری استرینگ) یا امروز
        $date = $request->query('date', Carbon::now()->toDateString());
        $now = Carbon::parse($date);

        // Attendance summaries (weekly and monthly minutes)
        $weekStart = Carbon::parse($now)->startOfWeek();
        $weekEnd = Carbon::parse($now)->endOfWeek();

        $weeklyMinutes = $worker->attendances()
            ->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(function ($carry, $attendance) {
                return $carry + Carbon::parse($attendance->check_in)
                    ->diffInMinutes(Carbon::parse($attendance->check_out));
            }, 0);

        $monthStart = Carbon::parse($now)->startOfMonth();
        $monthEnd = Carbon::parse($now)->endOfMonth();

        $monthlyMinutes = $worker->attendances()
            ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(function ($carry, $attendance) {
                return $carry + Carbon::parse($attendance->check_in)
                    ->diffInMinutes(Carbon::parse($attendance->check_out));
            }, 0);

        // Finance summaries (monthly and yearly totals)
        $monthlyFinance = $worker->finances()
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('price');

        $yearlyFinance = $worker->finances()
            ->whereYear('created_at', $now->year)
            ->sum('price');

        // اگر تاریخ مشخص شده باشد، داده‌ها را به آن روز محدود می‌کنیم
        $attendanceQuery = $worker->attendances()->latest();
        $financesQuery = $worker->finances()->latest();

        if ($request->has('date')) {
            $attendanceQuery->whereDate('date', $date);
            $financesQuery->whereDate('created_at', $date);
        }

        // Monthly per-day breakdown (work minutes and finances)
        $attendancesInMonth = $worker->attendances()
            ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get();

        $attendancesByDate = $attendancesInMonth->groupBy(function ($a) {
            return Carbon::parse($a->date)->toDateString();
        });

        $financesInMonth = $worker->finances()
            ->whereBetween('created_at', [$monthStart->toDateString() . ' 00:00:00', $monthEnd->toDateString() . ' 23:59:59'])
            ->get();

        $financesByDate = $financesInMonth->groupBy(function ($f) {
            return Carbon::parse($f->created_at)->toDateString();
        });

        $monthlyReport = [];
        $cursor = $monthStart->copy();
        while ($cursor->lte($monthEnd)) {
            $d = $cursor->toDateString();
            $minutes = 0;
            if (isset($attendancesByDate[$d])) {
                $minutes = $attendancesByDate[$d]->reduce(function ($carry, $att) {
                    return $carry + Carbon::parse($att->check_in)->diffInMinutes(Carbon::parse($att->check_out));
                }, 0);
            }

            $finance = 0;
            if (isset($financesByDate[$d])) {
                $finance = $financesByDate[$d]->sum('price');
            }

            $monthlyReport[] = [
                'date' => $d,
                'minutes' => $minutes,
                'finance' => $finance,
            ];

            $cursor->addDay();
        }

        return Inertia::render('Admin/WorkerReport', [
            'worker' => $worker,
            'date' => $date,
            'attendance' => $attendanceQuery->paginate(10),
            'finances' => $financesQuery->paginate(10),
            'total_paid' => $worker->finances()->sum('price'),
            'monthly_finance_total' => $monthlyFinance,
            'monthly_report' => $monthlyReport,
            'attendance_summary' => [
                'weekly_minutes' => $weeklyMinutes,
                'monthly_minutes' => $monthlyMinutes,
            ],
            'finance_summary' => [
                'monthly_total' => $monthlyFinance,
                'yearly_total' => $yearlyFinance,
            ],
        ]);
    }

    // ویرایش اطلاعات نیرو
    public function update(Request $request, $id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);

        $request->validate([
            'name' => 'required|string'
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'nullable|string|min:4'
            ]);
            $worker->password = Hash::make($request->password);
        }

        $worker->name = $request->name;
        $worker->save();

        return redirect()->back()->with('message', 'اطلاعات نیرو بروز شد');
    }

    // حذف نیرو
    public function destroy($id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);
        $worker->delete();
        return redirect()->back()->with('message', 'نیرو حذف شد');
    }
}
