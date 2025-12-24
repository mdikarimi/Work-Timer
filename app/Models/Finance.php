<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    protected $fillable = [
        'worker_id',
        'description',
        'price'
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
