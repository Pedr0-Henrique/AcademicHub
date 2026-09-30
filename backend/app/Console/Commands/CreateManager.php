<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateManager extends Command
{
    protected $signature = 'manager:create {--name= : Nome completo do manager} {--email= : Email do manager}';

    protected $description = 'Cria uma conta de manager para acesso administrativo';

    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Nome completo');
        $email = $this->option('email') ?: $this->ask('Email');
        $password = $this->secret('Senha (mínimo de 8 caracteres)');
        $passwordConfirmation = $this->secret('Confirme a senha');

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }

        if ($password !== $passwordConfirmation) {
            $this->error('As senhas não conferem.');

            return self::FAILURE;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'manager',
        ]);

        $this->info('Conta manager criada com sucesso.');

        return self::SUCCESS;
    }
}