import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { courseService } from '../services/courses';
import type { Course } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { useToast } from '../components/ToastProvider';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, [currentPage, search, statusFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll({
        page: currentPage,
        per_page: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCourses(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      await courseService.delete(courseToDelete.id);
      setCourseToDelete(null);
      showToast('Curso removido com sucesso.');
      void loadCourses();
    } catch (error: any) {
      console.error('Erro ao remover curso:', error);
      setCourseToDelete(null);
      showToast(error.response?.data?.message || 'Não foi possível remover o curso.', 'error');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, data);
      } else {
        await courseService.create(data);
      }
      setShowModal(false);
      showToast(editingCourse ? 'Curso atualizado com sucesso.' : 'Curso criado com sucesso.');
      void loadCourses();
    } catch (error: any) {
      console.error('Erro ao salvar curso:', error);
      showToast(error.response?.data?.message || 'Não foi possível salvar o curso.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Catálogo acadêmico</p>
          <h1 className="text-xl font-semibold text-foreground">Cursos</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm" className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground sm:w-auto"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-hover/70">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Código
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nome
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Carga Horária
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Alunos
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum curso encontrado
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="transition-colors hover:bg-surface-hover/60">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-foreground">
                        {course.code}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {course.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {course.workload}h
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-muted">
                        {course.enrollments_count || 0}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          aria-label={`Editar curso ${course.name}`}
                          title="Editar curso"
                          onClick={() => handleEdit(course)}
                          className="mr-2 rounded-md p-2 text-muted transition-colors hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover curso ${course.name}`}
                          title="Remover curso"
                          onClick={() => setCourseToDelete(course)}
                          className="rounded-md p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
            <div className="text-sm text-muted">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {courseToDelete && (
        <ConfirmDialog
          title="Remover curso?"
          description={`O curso "${courseToDelete.name}" será removido do catálogo.`}
          onCancel={() => setCourseToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

function CourseModal({ course, onClose, onSave }: any) {
  const [formData, setFormData] = useState(
    course || {
      name: '',
      description: '',
      code: '',
      workload: '',
      status: 'active',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={course ? 'Editar curso' : 'Novo curso'} size="lg" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Código"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Carga horária (horas)"
            type="number"
            value={formData.workload}
            onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) })}
            required
            min="1"
          />
          <label htmlFor="course-status" className="block text-sm font-medium text-foreground">
            Status
            <select
              id="course-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              required
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>
        </div>
        <label htmlFor="course-description" className="block text-sm font-medium text-foreground">
          Descrição
          <textarea
            id="course-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="mt-1 w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{course ? 'Salvar alterações' : 'Criar curso'}</Button>
        </div>
      </form>
    </Modal>
  );
}
