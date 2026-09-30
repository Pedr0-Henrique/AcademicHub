<?php

namespace App\Providers;

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Turma;
use App\Policies\StudentPolicy;
use App\Policies\CoursePolicy;
use App\Policies\EnrollmentPolicy;
use App\Policies\TurmaPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(Enrollment::class, EnrollmentPolicy::class);
        Gate::policy(Turma::class, TurmaPolicy::class);

        // Admin can do everything
        Gate::define('admin', function ($user) {
            return $user->role === 'admin';
        });

        // Manager can manage students, courses, and enrollments (but not users)
        Gate::define('manager', function ($user) {
            return in_array($user->role, ['admin', 'manager']);
        });

        // User can only view data
        Gate::define('user', function ($user) {
            return in_array($user->role, ['admin', 'manager', 'user']);
        });

        // Gate for managing users (admin only)
        Gate::define('manage-users', function ($user) {
            return $user->role === 'admin';
        });

        // Gate for managing students (admin and manager)
        Gate::define('manage-students', function ($user) {
            return in_array($user->role, ['admin', 'manager']);
        });

        // Gate for managing courses (admin and manager)
        Gate::define('manage-courses', function ($user) {
            return in_array($user->role, ['admin', 'manager']);
        });

        // Gate for managing enrollments (admin and manager)
        Gate::define('manage-enrollments', function ($user) {
            return in_array($user->role, ['admin', 'manager']);
        });
    }
}
