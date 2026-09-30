import React, { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { useToast } from '../components/ToastProvider';
import { enrollmentService } from '../services/enrollments';
import { studentService } from '../services/students';
import { turmaService } from '../services/turmas';
import type { Enrollment, Student, Turma } from '../types';

const statusLabels: Record<Enrollment['status'], string> = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void loadEnrollments();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    void loadStudents();
    void loadTurmas();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getAll({
        page: currentPage,
        per_page: 10,
        status: statusFilter || undefined,
      });
      setEnrollments(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
      showToast('Não foi possível carregar as matrículas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await studentService.getAll({ per_page: 1000 });
      setStudents(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      showToast('Não foi possível carregar os alunos.', 'error');
    }
  };

  const loadTurmas = async () => {
    try {
      const response = await turmaService.getAll({ per_page: 1000, status: 'active' });
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      showToast('Não foi possível carregar as turmas.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!enrollmentToDelete) return;

    try {
      await enrollmentService.delete(enrollmentToDelete.id);
      setEnrollmentToDelete(null);
      showToast('Matrícula removida com sucesso.');
      void loadEnrollments();
    } catch (error: any) {
      console.error('Erro ao remover matrícula:', error);
      setEnrollmentToDelete(null);
      showToast(error.response?.data?.message || 'Não foi possível remover a matrícula.', 'error');
    }
  };

  const handleSave = async (data: Partial<Enrollment>) => {
    try {
      if (editingEnrollment) {
        await enrollmentService.update(editingEnrollment.id, data);
      } else {
        await enrollmentService.create(data);
      }
      setShowModal(false);
      showToast(editingEnrollment ? 'Matrícula atualizada com sucesso.' : 'Matrícula criada com sucesso.');
      void loadEnrollments();
    } catch (error: any) {
      console.error('Erro ao salvar matrícula:', error);
      showToast(error.response?.data?.message || 'Não foi possível salvar a matrícula.', 'error');
    }
  };

  const openCreate = () => {
    setEditingEnrollment(null);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Vínculos acadêmicos</p>
          <h1 className="text-xl font-semibold text-foreground">Matrículas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Nova matrícula
        </Button>
      </div>

      <Card padding="sm" className="mb-4">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filtrar matrículas por status"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground sm:max-w-xs"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="completed">Concluídas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </Card>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-hover/70">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Aluno</th>
                  <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Turma / Curso</th>
                  <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Data de matrícula</th>
                  <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Nenhuma matrícula encontrada.</td>
                  </tr>
                ) : enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="transition-colors hover:bg-surface-hover/60">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                      {enrollment.student?.name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      <div className="font-medium text-foreground">{enrollment.turma?.name || 'N/A'}</div>
                      <div className="text-xs">{enrollment.course?.name || 'Curso não disponível'}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 tabular-nums text-muted">
                      {new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge status={enrollment.status} label={statusLabels[enrollment.status]} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Editar matrícula de ${enrollment.student?.name || 'aluno'}`}
                        title="Editar matrícula"
                        onClick={() => { setEditingEnrollment(enrollment); setShowModal(true); }}
                        className="mr-2 rounded-md p-2 text-muted transition-colors hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      ><Edit size={17} /></button>
                      <button
                        type="button"
                        aria-label={`Remover matrícula de ${enrollment.student?.name || 'aluno'}`}
                        title="Remover matrícula"
                        onClick={() => setEnrollmentToDelete(enrollment)}
                        className="rounded-md p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                      ><Trash2 size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
            <span className="text-sm text-muted">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Anterior</Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Próxima</Button>
            </div>
          </div>
        )}
      </Card>

      {showModal && (
        <EnrollmentModal
          enrollment={editingEnrollment}
          students={students}
          turmas={turmas}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {enrollmentToDelete && (
        <ConfirmDialog
          title="Remover matrícula?"
          description={`A matrícula de "${enrollmentToDelete.student?.name || 'aluno'}" na turma "${enrollmentToDelete.turma?.name || 'selecionada'}" será removida.`}
          onCancel={() => setEnrollmentToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

function EnrollmentModal({ enrollment, students, turmas, onClose, onSave }: {
  enrollment: Enrollment | null;
  students: Student[];
  turmas: Turma[];
  onClose: () => void;
  onSave: (data: Partial<Enrollment>) => void;
}) {
  const [formData, setFormData] = useState<{
    student_id: string;
    turma_id: string;
    enrollment_date: string;
    status: Enrollment['status'];
  }>({
    student_id: enrollment ? String(enrollment.student_id) : '',
    turma_id: enrollment ? String(enrollment.turma_id) : '',
    enrollment_date: enrollment?.enrollment_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    status: enrollment?.status ?? 'active',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...formData,
      student_id: Number(formData.student_id),
      turma_id: Number(formData.turma_id),
    });
  };

  return (
    <Modal title={enrollment ? 'Editar matrícula' : 'Nova matrícula'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="enrollment-student" className="block text-sm font-medium text-foreground">
          Aluno
          <select
            id="enrollment-student"
            value={formData.student_id}
            onChange={(event) => setFormData({ ...formData, student_id: event.target.value })}
            required
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="">Selecione um aluno</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
          </select>
        </label>
        <label htmlFor="enrollment-turma" className="block text-sm font-medium text-foreground">
          Turma
          <select
            id="enrollment-turma"
            value={formData.turma_id}
            onChange={(event) => setFormData({ ...formData, turma_id: event.target.value })}
            required
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="">Selecione uma turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.course?.name} — {turma.name}{turma.term ? ` (${turma.term})` : ''}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Data de matrícula"
          type="date"
          value={formData.enrollment_date}
          onChange={(event) => setFormData({ ...formData, enrollment_date: event.target.value })}
          required
        />
        <label htmlFor="enrollment-status" className="block text-sm font-medium text-foreground">
          Status
          <select
            id="enrollment-status"
            value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value as Enrollment['status'] })}
            required
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="active">Ativa</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{enrollment ? 'Salvar alterações' : 'Criar matrícula'}</Button>
        </div>
      </form>
    </Modal>
  );
}