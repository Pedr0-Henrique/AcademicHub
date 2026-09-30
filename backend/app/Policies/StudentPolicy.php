<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function view(User $user, Student $student): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function update(User $user, Student $student): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function delete(User $user, Student $student): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
