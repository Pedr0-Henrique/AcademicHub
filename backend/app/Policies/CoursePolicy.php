<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function view(User $user, Course $course): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function update(User $user, Course $course): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function delete(User $user, Course $course): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
