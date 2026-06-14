<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Morilog\Jalali\Jalalian;

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
            'name' => 'required|string',
            'password' => 'required|string|min:4'
        ]);

        $worker = auth()->user()->workers()->create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('workers.report', $worker->id)->with('new_password', $request->password);
    }

    public function show(Request $request, Worker $worker)
    {
        if ($worker->user_id !== auth()->id()) {
            abort(403);
        }

        $date = $request->query('date', Carbon::now()->toDateString());
        $mode = $request->query('mode', 'day');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // Normalize Persian/Arabic-Indic digits so Carbon/Jalalian can parse them
        $date = $this->normalizeNumericDateString($date);
        $startDate = $this->normalizeNumericDateString($startDate);
        $endDate = $this->normalizeNumericDateString($endDate);

        $now = Carbon::parse($date);
        $jNow = Jalalian::fromCarbon($now);

        $jDate = $jNow->format('Y/m/d');
        $jStartDate = $startDate ? Jalalian::fromFormat('Y-m-d', $startDate)->format('Y/m/d') : null;
        $jEndDate = $endDate ? Jalalian::fromFormat('Y-m-d', $endDate)->format('Y/m/d') : null;

        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();

        $weeklyMinutes = $worker->attendances()
            ->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(fn($carry, $a) => $carry + Carbon::parse($a->check_in)->diffInMinutes(Carbon::parse($a->check_out)), 0);

        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $monthlyMinutes = $worker->attendances()
            ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(fn($carry, $a) => $carry + Carbon::parse($a->check_in)->diffInMinutes(Carbon::parse($a->check_out)), 0);

        $monthlyFinance = $worker->finances()
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('price');

        $yearlyFinance = $worker->finances()
            ->whereYear('created_at', $now->year)
            ->sum('price');

        $attendanceQuery = $worker->attendances()->latest();
        $financesQuery = $worker->finances()->latest();

        if ($mode === 'range' && $startDate && $endDate) {
            $attendanceQuery->whereBetween('date', [$startDate, $endDate]);
            $financesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } elseif ($request->has('date') && $mode === 'day') {
            $attendanceQuery->whereDate('date', $date);
            $financesQuery->whereDate('created_at', $date);
        }

        if ($mode === 'range' && $startDate && $endDate) {
            $reportStart = Carbon::parse($startDate)->startOfDay();
            $reportEnd = Carbon::parse($endDate)->endOfDay();
        } elseif ($mode === 'day' && $request->has('date')) {
            $reportStart = Carbon::parse($date)->startOfDay();
            $reportEnd = Carbon::parse($date)->endOfDay();
        } else {
            $reportStart = $monthStart->startOfDay();
            $reportEnd = $monthEnd->endOfDay();
        }

        $attendancesInRange = $worker->attendances()
            ->whereBetween('date', [$reportStart->toDateString(), $reportEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get();

        $attendancesByDate = $attendancesInRange->groupBy(fn($a) => Carbon::parse($a->date)->toDateString());

        $financesInRange = $worker->finances()
            ->whereBetween('created_at', [$reportStart->toDateString() . ' 00:00:00', $reportEnd->toDateString() . ' 23:59:59'])
            ->get();

        $financesByDate = $financesInRange->groupBy(fn($f) => Carbon::parse($f->created_at)->toDateString());

        $monthlyReport = [];
        $cursor = $reportStart->copy();

        while ($cursor->lte($reportEnd)) {
            $d = $cursor->toDateString();
            $jDateObj = Jalalian::fromFormat('Y-m-d', $d);

            $minutes = isset($attendancesByDate[$d])
                ? $attendancesByDate[$d]->reduce(fn($carry, $att) => $carry + Carbon::parse($att->check_in)->diffInMinutes(Carbon::parse($att->check_out)), 0)
                : 0;

            $monthlyReport[] = [
                'date' => $d,
                'j_date' => $jDateObj->format('Y/m/d'),
                'day_name' => $jDateObj->format('l'),
                'minutes' => $minutes,
                'hours' => floor($minutes / 60),
                'finance' => isset($financesByDate[$d]) ? $financesByDate[$d]->sum('price') : 0,
            ];

            $cursor->addDay();
        }

        $rangeMinutes = $attendancesInRange->reduce(
            fn($carry, $a) => $carry + Carbon::parse($a->check_in)->diffInMinutes(Carbon::parse($a->check_out)),
            0
        );

        $jReportStart = Jalalian::fromFormat('Y-m-d', $reportStart->toDateString())->format('Y/m/d');
        $jReportEnd = Jalalian::fromFormat('Y-m-d', $reportEnd->toDateString())->format('Y/m/d');

        $attendanceData = $attendanceQuery->paginate(10);
        $attendanceData->getCollection()->transform(function ($item) {
            $item->j_date = Jalalian::fromFormat('Y-m-d', $item->date)->format('Y/m/d');
            $item->check_in_jalali = $item->check_in ? Jalalian::fromDateTime($item->check_in)->format('H:i') : null;
            $item->check_out_jalali = $item->check_out ? Jalalian::fromDateTime($item->check_out)->format('H:i') : null;
            $item->check_in_ago = $item->check_in ? Jalalian::fromDateTime($item->check_in)->ago() : null;
            $item->check_out_ago = $item->check_out ? Jalalian::fromDateTime($item->check_out)->ago() : null;
            return $item;
        });

        $financesData = $financesQuery->get()->transform(function ($item) {
            $item->created_at_jalali = Jalalian::fromDateTime($item->created_at)->format('Y/m/d H:i');
            $item->created_at_ago = Jalalian::fromDateTime($item->created_at)->ago();
            return $item;
        });

        $weekOfMonth = $this->getJalaliWeekOfMonth($jNow);

        return Inertia::render('Admin/WorkerReport', [
            'worker' => $worker,
            'date' => $date,
            'j_date' => $jDate,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'j_start_date' => $jStartDate,
            'j_end_date' => $jEndDate,
            'mode' => $mode,
            'attendance' => $attendanceData,
            'finances' => $financesData,
            'total_paid' => $worker->finances()->sum('price'),
            'monthly_finance_total' => $monthlyFinance,
            'monthly_report' => $monthlyReport,
            'attendance_summary' => [
                'weekly_minutes' => $weeklyMinutes,
                'weekly_hours' => floor($weeklyMinutes / 60),
                'monthly_minutes' => $monthlyMinutes,
                'monthly_hours' => floor($monthlyMinutes / 60),
                'selected_range' => [
                    'from' => $reportStart->toDateString(),
                    'to' => $reportEnd->toDateString(),
                    'j_from' => $jReportStart,
                    'j_to' => $jReportEnd,
                    'minutes' => $rangeMinutes,
                    'hours' => floor($rangeMinutes / 60),
                ],
            ],
            'finance_summary' => [
                'monthly_total' => $monthlyFinance,
                'yearly_total' => $yearlyFinance,
            ],
            'current_month' => $jNow->format('%B %Y'),
            'current_week' => 'هفته ' . $weekOfMonth . ' ' . $jNow->format('%B'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);

        $request->validate(['name' => 'required|string']);

        if ($request->filled('password')) {
            $request->validate(['password' => 'nullable|string|min:4']);
            $worker->password = Hash::make($request->password);
        }

        $worker->name = $request->name;
        $worker->save();

        return redirect()->back()->with('message', 'اطلاعات نیرو بروز شد');
    }

    public function destroy($id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);
        $worker->delete();
        return redirect()->back()->with('message', 'نیرو حذف شد');
    }

    private function getJalaliWeekOfMonth(Jalalian $jDate): int
    {
        $firstDayOfMonth = Jalalian::fromFormat('Y-m-d', $jDate->format('Y-m-01'));
        return ceil(($firstDayOfMonth->getDayOfWeek() + $jDate->getDay() - 1) / 7);
    }

    private function normalizeNumericDateString($value)
    {
        if (!is_string($value) || $value === '') {
            return $value;
        }

        $persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        $arabic  = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        $latin   = ['0','1','2','3','4','5','6','7','8','9'];

        $value = str_replace($persian, $latin, $value);
        $value = str_replace($arabic, $latin, $value);
        $value = str_replace(['٫', '،', '／', '－', '—'], ['.', ',', '/', '-', '-'], $value);

        return $value;
    }
}
