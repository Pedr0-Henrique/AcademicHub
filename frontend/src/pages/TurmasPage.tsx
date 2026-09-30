import React, { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { useToast } from '../components/ToastProvider';
import { courseService } from '../services/courses';
import { turmaService } from '../services/turmas';
import type { Course, Turma } from '../types';

const shifts = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'night', label: 'Noite' },
  { value: 'full_time', label: 'Integral' },
] as const;

const formatDate = (date?: string | null) => date ? date.slice(0, 10).split('-').reverse().join('/') : '—';

export function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void loadTurmas();
  }, [courseFilter, statusFilter, currentPage]);

  useEffect(() => {
    courseService.getAll({ per_page: 1000 })
      .then((response) => setCourses(response.data))
      .catch((error) => console.error('Erro ao carregar cursos:', error));
  }, []);

  const loadTurmas = async () => {
    try {
      setLoading(true);
      const response = await turmaService.getAll({
        page: currentPage,
        per_page: 10,
        course_id: courseFilter ? Number(courseFilter) : undefined,
        status: statusFilter || undefined,
      });
      setTurmas(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Turma>) => {
    try {
      if (editingTurma) {
        await turmaService.update(editingTurma.id, data);
      } else {
        await turmaService.create(data);
      }
      setShowModal(false);
      showToast(editingTurma ? 'Turma atualizada com sucesso.' : 'Turma criada com sucesso.');
      void loadTurmas();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Não foi possível salvar a turma.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!turmaToDelete) return;

    try {
      await turmaService.delete(turmaToDelete.id);
      setTurmaToDelete(null);
      showToast('Turma removida com sucesso.');
      void loadTurmas();
    } catch (error: any) {
      setTurmaToDelete(null);
      showToast(error.response?.data?.message || 'Não foi possível remover a turma.', 'error');
    }
  };

  const openCreate = () => {
    setEditingTurma(null);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Oferta de cursos</p>
          <h1 className="text-xl font-semibold text-foreground">Turmas</h1>
        </div>
        <Button onClick={openCreate} disabled={courses.length === 0}>
          <Plus size={20} className="mr-2" />
          Nova Turma
        </Button>
      </div>

      <Card padding="sm" className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={courseFilter}
          onChange={(event) => {
            setCourseFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground sm:max-w-xs"
          aria-label="Filtrar por curso"
        >
          <option value="">Todos os cursos</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground sm:max-w-xs"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </Card>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-surface-hover/70">
                <tr>
                  {['Turma', 'Curso', 'Turno', 'Período', 'Vagas', 'Matrículas', 'Status', 'Ações'].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {turmas.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Nenhuma turma encontrada</td></tr>
                ) : turmas.map((turma) => (
                  <tr key={turma.id} className="text-sm text-muted transition-colors hover:bg-surface-hover/60">
                    <td className="px-4 py-4 font-medium text-foreground">
                      <div>{turma.name}</div>
                      {turma.term && <div className="mt-1 text-xs text-muted-foreground">{turma.term}</div>}
                    </td>
                    <td className="px-4 py-4">{turma.course?.name || '—'}</td>
                    <td className="px-4 py-4">{shifts.find((shift) => shift.value === turma.shift)?.label || '—'}</td>
                    <td className="px-4 py-4 text-xs">{formatDate(turma.start_date)} – {formatDate(turma.end_date)}</td>
                    <td className="px-4 py-4">{turma.capacity ?? '—'}</td>
                    <td className="px-4 py-4">{turma.enrollments_count ?? 0}</td>
                    <td className="px-4 py-4"><StatusBadge status={turma.status} label={turma.status === 'active' ? 'Ativa' : 'Inativa'} /></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          title="Editar turma"
                          aria-label={`Editar ${turma.name}`}
                          onClick={() => { setEditingTurma(turma); setShowModal(true); }}
                          className="rounded-md p-2 text-muted transition-colors hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        ><Edit size={18} /></button>
                        <button
                          type="button"
                          title="Remover turma"
                          aria-label={`Remover ${turma.name}`}
                          onClick={() => setTurmaToDelete(turma)}
                          className="rounded-md p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                        ><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm">
            <span className="text-muted">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Anterior</Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Próxima</Button>
            </div>
          </div>
        )}
      </Card>

      {showModal && (
        <TurmaModal
          turma={editingTurma}
          courses={courses}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {turmaToDelete && (
        <ConfirmDialog
          title="Remover turma?"
          description={`A turma "${turmaToDelete.name}" será removida. Turmas com matrículas não podem ser excluídas.`}
          onCancel={() => setTurmaToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

function TurmaModal({ turma, courses, onClose, onSave }: {
  turma: Turma | null;
  courses: Course[];
  onClose: () => void;
  onSave: (data: Partial<Turma>) => void;
}) {
  const [formData, setFormData] = useState({
    course_id: turma?.course_id ?? '',
    name: turma?.name ?? '',
    term: turma?.term ?? '',
    shift: turma?.shift ?? '',
    start_date: turma?.start_date?.slice(0, 10) ?? '',
    end_date: turma?.end_date?.slice(0, 10) ?? '',
    capacity: turma?.capacity?.toString() ?? '',
    status: turma?.status ?? 'active',
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...formData,
      course_id: Number(formData.course_id),
      term: formData.term || null,
      shift: formData.shift ? formData.shift as Turma['shift'] : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      capacity: formData.capacity ? Number(formData.capacity) : null,
    });
  };

  return (
    <Modal title={turma ? 'Editar turma' : 'Nova turma'} size="lg" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
          <label htmlFor="turma-course" className="block text-sm font-medium text-foreground">
            Curso
            <select
              id="turma-course"
              required
              value={formData.course_id}
              onChange={(event) => setFormData({ ...formData, course_id: event.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="">Selecione um curso</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name} ({course.code})</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome da turma" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required maxLength={100} />
            <Input label="Período letivo" placeholder="Ex.: 2026.2" value={formData.term} onChange={(event) => setFormData({ ...formData, term: event.target.value })} maxLength={20} />
            <label htmlFor="turma-shift" className="block text-sm font-medium text-foreground">
              Turno
              <select
                id="turma-shift"
                value={formData.shift}
                onChange={(event) => setFormData({ ...formData, shift: event.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="">Não definido</option>
                {shifts.map((shift) => <option key={shift.value} value={shift.value}>{shift.label}</option>)}
              </select>
            </label>
            <Input label="Quantidade de vagas" type="number" min="1" value={formData.capacity} onChange={(event) => setFormData({ ...formData, capacity: event.target.value })} />
            <Input label="Data de início" type="date" value={formData.start_date} onChange={(event) => setFormData({ ...formData, start_date: event.target.value })} />
            <Input label="Data de término" type="date" value={formData.end_date} onChange={(event) => setFormData({ ...formData, end_date: event.target.value })} />
            <label htmlFor="turma-status" className="block text-sm font-medium text-foreground">
              Status
              <select
                id="turma-status"
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value as 'active' | 'inactive' })}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{turma ? 'Salvar alterações' : 'Criar turma'}</Button>
          </div>
      </form>
    </Modal>
  );
}