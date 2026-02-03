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
        // اطمینان از اینکه ادمین فقط به نیروهای خودش دسترسی دارد
        if ($worker->user_id !== auth()->id()) {
            abort(403);
        }

        // انتخاب تاریخ (از کوئری استرینگ) یا امروز
        $date = $request->query('date', Carbon::now()->toDateString());
        $mode = $request->query('mode', 'day');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // Normalize Persian/Arabic digits to ASCII digits for robust parsing
        $date = $this->normalizeNumericDateString($date);
        $startDate = $this->normalizeNumericDateString($startDate);
        $endDate = $this->normalizeNumericDateString($endDate);
        
        // استفاده از Jalalian برای تاریخ شمسی
        $now = Carbon::parse($date);
        $jNow = Jalalian::fromCarbon($now);
        
        // تبدیل تاریخ‌ها به شمسی برای نمایش
        $jDate = $jNow->format('Y/m/d');
        $jStartDate = $startDate ? Jalalian::fromFormat('Y-m-d', $startDate)->format('Y/m/d') : null;
        $jEndDate = $endDate ? Jalalian::fromFormat('Y-m-d', $endDate)->format('Y/m/d') : null;

        // Attendance summaries (weekly and monthly minutes)
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();

        $weeklyMinutes = $worker->attendances()
            ->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get()
            ->reduce(function ($carry, $attendance) {
                return $carry + Carbon::parse($attendance->check_in)
                    ->diffInMinutes(Carbon::parse($attendance->check_out));
            }, 0);

        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

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

        if ($mode === 'range' && $startDate && $endDate) {
            $attendanceQuery->whereBetween('date', [$startDate, $endDate]);
            $financesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } elseif ($request->has('date') && $mode === 'day') {
            $attendanceQuery->whereDate('date', $date);
            $financesQuery->whereDate('created_at', $date);
        }

        // Determine report range (day, range or month)
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

        // Attendances and finances within the report range
        $attendancesInRange = $worker->attendances()
            ->whereBetween('date', [$reportStart->toDateString(), $reportEnd->toDateString()])
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get();

        $attendancesByDate = $attendancesInRange->groupBy(function ($a) {
            return Carbon::parse($a->date)->toDateString();
        });

        $financesInRange = $worker->finances()
            ->whereBetween('created_at', [$reportStart->toDateString() . ' 00:00:00', $reportEnd->toDateString() . ' 23:59:59'])
            ->get();

        $financesByDate = $financesInRange->groupBy(function ($f) {
            return Carbon::parse($f->created_at)->toDateString();
        });

        // Build per-day report for the chosen range
        $monthlyReport = [];
        $cursor = $reportStart->copy();
        
        while ($cursor->lte($reportEnd)) {
            $d = $cursor->toDateString();
            $jDateObj = Jalalian::fromFormat('Y-m-d', $d);
            $jD = $jDateObj->format('Y/m/d'); // تاریخ شمسی

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
                'date' => $d, // تاریخ میلادی (برای محاسبات)
                'j_date' => $jD, // تاریخ شمسی (برای نمایش)
                'day_name' => $jDateObj->format('l'), // نام روز به فارسی
                'minutes' => $minutes,
                'hours' => floor($minutes / 60), // تبدیل دقیقه به ساعت
                'finance' => $finance,
            ];

            $cursor->addDay();
        }

        // Range totals
        $rangeMinutes = $attendancesInRange->reduce(function ($carry, $attendance) {
            return $carry + Carbon::parse($attendance->check_in)
                ->diffInMinutes(Carbon::parse($attendance->check_out));
        }, 0);

        // Selected range info in Jalali
        $jReportStart = Jalalian::fromFormat('Y-m-d', $reportStart->toDateString())->format('Y/m/d');
        $jReportEnd = Jalalian::fromFormat('Y-m-d', $reportEnd->toDateString())->format('Y/m/d');

        // تبدیل تاریخ‌های attendance و finances به شمسی
        $attendanceData = $attendanceQuery->paginate(10);
        $attendanceData->getCollection()->transform(function ($item) {
            $item->j_date = Jalalian::fromFormat('Y-m-d', $item->date)->format('Y/m/d');
            $item->check_in_jalali = $item->check_in ? Jalalian::fromDateTime($item->check_in)->format('H:i') : null;
            $item->check_out_jalali = $item->check_out ? Jalalian::fromDateTime($item->check_out)->format('H:i') : null;
            
            // افزودن زمان نسبی (ago)
            if ($item->check_in) {
                $item->check_in_ago = Jalalian::fromDateTime($item->check_in)->ago();
            }
            if ($item->check_out) {
                $item->check_out_ago = Jalalian::fromDateTime($item->check_out)->ago();
            }
            
            return $item;
        });

        $financesData = $financesQuery->paginate(10);
        $financesData->getCollection()->transform(function ($item) {
            $item->created_at_jalali = Jalalian::fromDateTime($item->created_at)->format('Y/m/d H:i');
            $item->created_at_ago = Jalalian::fromDateTime($item->created_at)->ago();
            return $item;
        });

        // محاسبه هفته شمسی
        $weekOfMonth = $this->getJalaliWeekOfMonth($jNow);

        return Inertia::render('Admin/WorkerReport', [
            'worker' => $worker,
            'date' => $date, // تاریخ میلادی (برای کوئری)
            'j_date' => $jDate, // تاریخ شمسی (برای نمایش)
            'start_date' => $startDate, // میلادی
            'end_date' => $endDate, // میلادی
            'j_start_date' => $jStartDate, // شمسی
            'j_end_date' => $jEndDate, // شمسی
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
                    'j_from' => $jReportStart ?? null,
                    'j_to' => $jReportEnd ?? null,
                    'minutes' => $rangeMinutes ?? 0,
                    'hours' => floor(($rangeMinutes ?? 0) / 60),
                ],
            ],
            'finance_summary' => [
                'monthly_total' => $monthlyFinance,
                'yearly_total' => $yearlyFinance,
            ],
            'current_month' => $jNow->format('%B %Y'), // مثلاً: فروردین 1403
            'current_week' => 'هفته ' . $weekOfMonth . ' ' . $jNow->format('%B'), // مثلاً: هفته 2 فروردین
        ]);
    }

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

    public function destroy($id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);
        $worker->delete();
        return redirect()->back()->with('message', 'نیرو حذف شد');
    }
    
    /**
     * محاسبه هفته شمسی در ماه
     */
    private function getJalaliWeekOfMonth(Jalalian $jDate): int
    {
        $firstDayOfMonth = Jalalian::fromFormat('Y-m-d', $jDate->format('Y-m-01'));
        $dayOfMonth = $jDate->getDay();
        
        // محاسبه هفته (هر 7 روز یک هفته)
        return ceil(($firstDayOfMonth->getDayOfWeek() + $dayOfMonth - 1) / 7);
    }
    
    /**
     * تبدیل تاریخ میلادی به شمسی با فرمت دلخواه
     */
    private function convertToJalali($date, $format = 'Y/m/d'): string
    {
        return Jalalian::fromFormat('Y-m-d', $date)->format($format);
    }
    
    /**
     * تبدیل تاریخ و زمان میلادی به شمسی با فرمت دلخواه
     */
    private function convertDateTimeToJalali($dateTime, $format = 'Y/m/d H:i'): string
    {
        return Jalalian::fromDateTime($dateTime)->format($format);
    }
    
    /**
     * گرفتن تاریخ شمسی امروز
     */
    private function getTodayJalali($format = 'Y/m/d'): string
    {
        return Jalalian::now()->format($format);
    }

    /**
     * Normalize numeric characters in a date string.
     * Converts Persian/Arabic-Indic digits to ASCII digits so Carbon/Jalalian can parse them.
     */
    private function normalizeNumericDateString($value)
    {
        if (!is_string($value) || $value === '') {
            return $value;
        }

        $persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        $arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        $latin  = ['0','1','2','3','4','5','6','7','8','9'];

        $value = str_replace($persian, $latin, $value);
        $value = str_replace($arabic, $latin, $value);

        // also normalize Persian slashes or other separators if present
        $value = str_replace(['٫', '،', '／', '－', '—'], ['.', ',', '/', '-', '-'], $value);

        return $value;
    }
    
    /**
     * گرفتن زمان نسبی (ago) به فارسی
     */
    private function getTimeAgo($dateTime): string
    {
        return Jalalian::fromDateTime($dateTime)->ago();
    }
}