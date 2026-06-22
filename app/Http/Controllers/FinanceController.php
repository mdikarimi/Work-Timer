<?php

namespace App\Http\Controllers;

use App\Models\Finance;
use App\Models\SalaryRequest;
use App\Models\Worker;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class FinanceController extends Controller
{
    public function index()
    {
        $workers = Worker::orderBy('name')->get(['id', 'name', 'weekly_salary_limit', 'monthly_salary_limit']);

        $now = Carbon::now();
        $weekPeriod = $now->format('Y') . '-W' . $now->format('W');
        $monthPeriod = $now->format('Y-m');

        $weeklyRequests = SalaryRequest::with('worker')
            ->where('type', 'weekly')
            ->where('period', $weekPeriod)
            ->get();

        $monthlyRequests = SalaryRequest::with('worker')
            ->where('type', 'monthly')
            ->where('period', $monthPeriod)
            ->get();

        return Inertia::render('Finance/Index', [
            'workers' => $workers,
            'weeklyRequests' => $weeklyRequests,
            'monthlyRequests' => $monthlyRequests,
            'weekPeriod' => $weekPeriod,
            'monthPeriod' => $monthPeriod,
        ]);
    }

    public function list(Request $request)
    {
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');
        $date = $request->get('date', Carbon::today()->toDateString());

        $query = Finance::with('worker');

        if ($start_date && $end_date) {
            $query->whereDate('created_at', '>=', $start_date)
                  ->whereDate('created_at', '<=', $end_date);
        } else {
            $query->whereDate('created_at', $date);
        }

        $query->orderBy('created_at', 'desc');

        $finances = $query->get();

        $workers = Worker::orderBy('name')->get(['id', 'name']);

        $totalAmount = $query->sum('price');

        return Inertia::render('Finance/List', [
            'finances' => $finances,
            'workers' => $workers,
            'total_amount' => $totalAmount,
            'date' => $date,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'description' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'password' => 'required|string',
        ]);

        $worker = Worker::find($validated['worker_id']);
        if (!$worker || !Hash::check($validated['password'], $worker->password)) {
            throw ValidationException::withMessages(['password' => ['رمز عبور اشتباه است.']]);
        }

        Finance::create([
            'worker_id' => $validated['worker_id'],
            'description' => $validated['description'],
            'price' => $validated['price'],
        ]);

        return back()->with('success', 'عملیات مالی با موفقیت ثبت شد.');
    }

    public function salaryRequest(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'type'      => 'required|in:weekly,monthly',
            'period'    => 'required|string',
            'note'      => 'nullable|string|max:500',
            'amount'    => 'required|integer|min:1',
            'password'  => 'required|string',
        ]);

        $worker = Worker::find($validated['worker_id']);
        if (!$worker || !Hash::check($validated['password'], $worker->password)) {
            throw ValidationException::withMessages(['password' => ['رمز عبور اشتباه است.']]);
        }

        $limitField = $validated['type'] === 'weekly' ? 'weekly_salary_limit' : 'monthly_salary_limit';
        if ($worker->$limitField && $validated['amount'] > $worker->$limitField) {
            throw ValidationException::withMessages(['amount' => ['مبلغ درخواستی از سقف مجاز بیشتر است.']]);
        }

        $exists = SalaryRequest::where('worker_id', $validated['worker_id'])
            ->where('type', $validated['type'])
            ->where('period', $validated['period'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['general' => ['شما قبلاً برای این دوره درخواست ارسال کرده‌اید.']]);
        }

        SalaryRequest::create([
            'worker_id' => $validated['worker_id'],
            'type'      => $validated['type'],
            'period'    => $validated['period'],
            'note'      => $validated['note'] ?? null,
            'amount'    => $validated['amount'],
            'status'    => 'pending',
        ]);

        return back()->with('success', 'درخواست حقوق با موفقیت ارسال شد.');
    }

    public function updateSalaryRequestStatus(Request $request, SalaryRequest $salaryRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $salaryRequest->update(['status' => $validated['status']]);

        return back()->with('success', 'وضعیت درخواست بروزرسانی شد.');
    }
}
