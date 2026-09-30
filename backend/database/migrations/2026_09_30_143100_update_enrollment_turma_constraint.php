<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign('enrollments_student_id_foreign');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique('unique_active_enrollment');
            $table->unique(
                ['student_id', 'turma_id', 'status'],
                'unique_active_enrollment_per_turma'
            );
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign('enrollments_student_id_foreign');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique('unique_active_enrollment_per_turma');
            $table->unique(
                ['student_id', 'course_id', 'status'],
                'unique_active_enrollment'
            );
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->cascadeOnDelete();
        });
    }
};