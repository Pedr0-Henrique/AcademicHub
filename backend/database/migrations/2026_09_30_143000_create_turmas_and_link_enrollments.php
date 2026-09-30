<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('term', 20)->nullable();
            $table->string('shift', 20)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['course_id', 'status']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('turma_id')
                ->nullable()
                ->after('course_id')
                ->constrained('turmas')
                ->restrictOnDelete();
        });

        $timestamp = date('Y-m-d H:i:s');
        $courseIds = DB::table('enrollments')->distinct()->pluck('course_id');

        foreach ($courseIds as $courseId) {
            $turmaId = DB::table('turmas')->insertGetId([
                'course_id' => $courseId,
                'name' => 'Turma legada',
                'term' => null,
                'shift' => null,
                'start_date' => null,
                'end_date' => null,
                'capacity' => null,
                'status' => 'active',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            DB::table('enrollments')
                ->where('course_id', $courseId)
                ->update(['turma_id' => $turmaId]);
        }
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('turma_id');
        });

        Schema::dropIfExists('turmas');
    }
};