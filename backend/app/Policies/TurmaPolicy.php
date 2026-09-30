<?php

namespace App\Policies;

use App\Models\Turma;
use App\Models\User;

class TurmaPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function view(User $user, Turma $turma): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function update(User $user, Turma $turma): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function delete(User $user, Turma $turma): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}