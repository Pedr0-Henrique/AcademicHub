import React from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Loader2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo').max(255, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  passwordConfirmation: z.string(),
}).refine((values) => values.password === values.passwordConfirmation, {
  message: 'As senhas não conferem',
  path: ['passwordConfirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setLoading(true);
      await createAccount(data.name, data.email, data.password, data.passwordConfirmation);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <GraduationCap size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AcademicHub</p>
              <p className="text-xs text-muted-foreground">Gestão acadêmica</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-pressed={isDark}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Criar conta de aluno</h1>
          <p className="mt-1 text-sm text-muted">Cadastre-se para acessar o AcademicHub.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            error={errors.passwordConfirmation?.message}
            {...register('passwordConfirmation')}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Contas de gestão precisam ser criadas pelo administrador.</p>
      </Card>
    </main>
  );
}