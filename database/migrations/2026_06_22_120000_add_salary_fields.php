<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salary_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('amount')->nullable()->after('note');
        });

        Schema::table('workers', function (Blueprint $table) {
            $table->unsignedBigInteger('weekly_salary_limit')->nullable()->after('password');
            $table->unsignedBigInteger('monthly_salary_limit')->nullable()->after('weekly_salary_limit');
        });
    }

    public function down(): void
    {
        Schema::table('salary_requests', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['weekly_salary_limit', 'monthly_salary_limit']);
        });
    }
};
