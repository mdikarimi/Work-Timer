<?php

namespace App\Http\Controllers;

use App\Models\Finance;
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
        $workers = Worker::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/Index', [
            'workers' => $workers,
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
}
