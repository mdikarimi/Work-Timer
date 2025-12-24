<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = [
        'name',
        'user_id',
    ];
    
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function finances()
    {
        return $this->hasMany(Finance::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
