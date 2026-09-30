import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';
import { studentService } from '../services/students';
import type { Enrollment, Student } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStudent(parseInt(id));
    }
  }, [id]);

  const loadStudent = async (studentId: number) => {
    try {
      setLoading(true);
      const data = await studentService.getById(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      showToast('Não foi possível carregar o perfil do aluno.', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-label="Carregando perfil do aluno" className="animate-pulse space-y-4">
        <div className="h-24 rounded-lg border border-border bg-surface" />
        <div className="h-64 rounded-lg border border-border bg-surface" />
        <div className="h-40 rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  if (!student) {
    return (
      <Card className="py-12 text-center text-muted-foreground">Aluno não encontrado</Card>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Button variant="ghost" onClick={() => navigate('/students')} className="mb-4">
        <ArrowLeft size={18} />
        Voltar
      </Button>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-surface-hover/50 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary/10 text-xl font-semibold text-primary">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground">{student.name}</h1>
              <p className="truncate text-sm text-muted">{student.email}</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Informações pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <User className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium text-foreground">{student.cpf}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium text-foreground">{student.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Data de nascimento</p>
                <p className="font-medium text-foreground">
                  {new Date(student.birth_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-medium text-foreground">{student.address}</p>
                <p className="text-sm text-muted">
                  {student.city} - {student.state}, {student.zip_code}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{student.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-1 text-muted-foreground" size={18} />
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>

          {/* Enrollment History */}
          <div className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-foreground">Histórico acadêmico</h2>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-hover/70">
                    <tr>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Curso
                      </th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Data de Matrícula
                      </th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {student.enrollments.map((enrollment: Enrollment) => (
                      <tr key={enrollment.id} className="transition-colors hover:bg-surface-hover/60">
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-foreground">
                          {enrollment.course?.name || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                          {new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge status={enrollment.status} label={enrollment.status === 'active' ? 'Ativa' : enrollment.status === 'completed' ? 'Concluída' : 'Cancelada'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma matrícula encontrada
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="grid grid-cols-1 gap-4 text-sm text-muted sm:grid-cols-2">
              <div>
                <p>Cadastrado em: {new Date(student.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p>Última atualização: {new Date(student.updated_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
