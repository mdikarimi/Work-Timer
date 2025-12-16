<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    // نمایش صفحه ادمین با لیست نیروها
    public function viewAdmin()
    {
        $workers = auth()->user()->workers;
        return view('admin', compact('workers'));
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

