<?php

namespace App\Http\Controllers;

use App\Models\Finance;
use App\Models\Worker;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * Display the finance form.
     */
    public function index()
    {
        $workers = Worker::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/Index', [
            'workers' => $workers,
        ]);
    }

    public function list(Request $request)
    {
        // تاریخ پیش‌فرض امروز
        $date = $request->get('date', Carbon::today()->toDateString());

        $query = Finance::with('worker')
            ->whereDate('created_at', $date)
            ->orderBy('created_at', 'desc');

        $finances = $query->paginate(20)->withQueryString();

        $workers = Worker::orderBy('name')->get(['id', 'name']);

        // جمع کل مبالغ برای تاریخ انتخابی
        $totalAmount = $query->sum('price');

        return Inertia::render('Finance/List', [
            'finances' => $finances,
            'workers' => $workers,
            'total_amount' => $totalAmount,
            'date' => $date,
        ]);
    }
    
    /**
     * Store a new finance record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'description' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
        ]);

        Finance::create($validated);

        return back()->with('success', 'عملیات مالی با موفقیت ثبت شد.');
    }
}
