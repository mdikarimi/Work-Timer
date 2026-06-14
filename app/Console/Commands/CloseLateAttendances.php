<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Attendance;
use Carbon\Carbon;

class CloseLateAttendances extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendances:close-late';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set check_out to 23:00 for attendances with check_in after 23:00 (today)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cutoff = Carbon::today()->setTime(23, 0, 0);
        $today = Carbon::today()->toDateString();

        $query = Attendance::whereDate('date', $today)
            ->whereNotNull('check_in')
            ->where('check_in', '>=', $cutoff)
            ->whereNull('check_out');

        $count = $query->count();

        if ($count > 0) {
            $query->update(['check_out' => $cutoff]);
        }

        $this->info("Updated {$count} attendance(s) to set check_out to {$cutoff}.");

        return 0;
    }
}
