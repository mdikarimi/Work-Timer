<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryRequest extends Model
{
    protected $fillable = ['worker_id', 'type', 'period', 'status', 'note', 'amount'];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
