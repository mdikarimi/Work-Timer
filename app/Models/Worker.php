<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = [
        'name',
        'user_id',
        'password',
        'weekly_salary_limit',
        'monthly_salary_limit',
    ];
    
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function finances()
    {
        return $this->hasMany(Finance::class);
    }

    public function salaryRequests()
    {
        return $this->hasMany(SalaryRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
