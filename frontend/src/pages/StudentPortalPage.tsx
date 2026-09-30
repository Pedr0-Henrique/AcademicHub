import React from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { studentService, type StudentProfileInput } from '../services/students';
import type { Student } from '../types';

const profileSchema = z.object({
  cpf: z.string().min(11, 'Informe seu CPF').max(14, 'CPF inválido'),
  phone: z.string().min(8, 'Informe um telefone válido').max(20, 'Telefone muito longo'),
  birth_date: z.string().min(1, 'Informe sua data de nascimento'),
  address: z.string().min(3, 'Informe seu endereço').max(255, 'Endereço muito longo'),
  city: z.string().min(2, 'Informe sua cidade').max(100, 'Nome muito longo'),
  state: z.string().regex(/^[a-zA-Z]{2}$/, 'Informe a sigla do estado'),
  zip_code: z.string().min(8, 'Informe um CEP válido').max(9, 'CEP inválido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const enrollmentStatusLabels: Record<string, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export function StudentPortalPage() {
  const { user } = useAuth();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  React.useEffect(() => {
    void loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      setError('');
      setStudent(await studentService.getMine());
    } catch {
      setError('Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError('');
      setSaving(true);
      const profile = await studentService.completeMyProfile({
        ...data,
        state: data.state.toUpperCase(),
      } satisfies StudentProfileInput);
      setStudent(profile);
    } catch (requestError: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || 'Não foi possível salvar seu perfil. Verifique os dados.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div role="status" className="py-12 text-center text-sm text-muted-foreground">Carregando sua área acadêmica...</div>;
  }

  if (error && !student) {
    return <div role="alert" className="rounded-md border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Complete seu perfil acadêmico</h1>
          <p className="mt-1 text-sm text-muted-foreground">Olá, {user?.name}. Precisamos dos seus dados para localizar suas matrículas.</p>
        </div>
        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <div role="alert" className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="CPF" placeholder="000.000.000-00" autoComplete="off" error={errors.cpf?.message} {...register('cpf')} />
              <Input label="Telefone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
              <Input label="Data de nascimento" type="date" autoComplete="bday" error={errors.birth_date?.message} {...register('birth_date')} />
              <Input label="CEP" autoComplete="postal-code" error={errors.zip_code?.message} {...register('zip_code')} />
              <div className="sm:col-span-2">
                <Input label="Endereço" autoComplete="street-address" error={errors.address?.message} {...register('address')} />
              </div>
              <Input label="Cidade" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
              <Input label="Estado (UF)" maxLength={2} autoComplete="address-level1" error={errors.state?.message} {...register('state')} />
            </div>
            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Minha área acadêmica</h1>
        <p className="mt-1 text-sm text-muted-foreground">Olá, {student.name}.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-foreground">Meus dados</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 break-all text-sm text-foreground">{student.email}</dd></div>
          <div><dt className="text-xs text-muted-foreground">CPF</dt><dd className="mt-1 text-sm text-foreground">{student.cpf}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Telefone</dt><dd className="mt-1 text-sm text-foreground">{student.phone}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Nascimento</dt><dd className="mt-1 text-sm text-foreground">{new Date(`${student.birth_date}T00:00:00`).toLocaleDateString('pt-BR')}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Endereço</dt><dd className="mt-1 text-sm text-foreground">{student.address}, {student.city} - {student.state}</dd></div>
          <div><dt className="text-xs text-muted-foreground">CEP</dt><dd className="mt-1 text-sm text-foreground">{student.zip_code}</dd></div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-foreground">Minhas matrículas</h2>
        {student.enrollments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3 font-medium">Curso</th>
                  <th scope="col" className="px-3 py-3 font-medium">Turma</th>
                  <th scope="col" className="px-3 py-3 font-medium">Período</th>
                  <th scope="col" className="px-3 py-3 font-medium">Matrícula</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-3 py-3 font-medium text-foreground">{enrollment.course?.name ?? enrollment.turma?.course?.name ?? 'Curso não informado'}</td>
                    <td className="px-3 py-3 text-muted">{enrollment.turma?.name ?? 'Turma não informada'}</td>
                    <td className="px-3 py-3 text-muted">{enrollment.turma?.term ?? '—'}</td>
                    <td className="px-3 py-3 text-muted">{new Date(`${enrollment.enrollment_date}T00:00:00`).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-3 text-muted">{enrollmentStatusLabels[enrollment.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Você ainda não possui matrículas vinculadas ao seu cadastro.</p>
        )}
      </Card>
    </div>
  );
}