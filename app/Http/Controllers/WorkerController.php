<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkerController extends Controller
{
    // نمایش صفحه ادمین با لیست نیروها
    public function viewAdmin(): Response
    {
        $workers = auth()->user()->workers()->latest()->get();

        return Inertia::render('Admin/Index', [
            'workers' => $workers,
        ]);
    }

    // اضافه کردن نیرو
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string'
        ]);

        auth()->user()->workers()->create([
            'name' => $request->name
        ]);

        return redirect()->back()->with('message', 'نیرو اضافه شد');
    }

    // حذف نیرو
    public function destroy($id)
    {
        $worker = auth()->user()->workers()->findOrFail($id);
        $worker->delete();
        return redirect()->back()->with('message', 'نیرو حذف شد');
    }
}

