import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/students';
import type { Student } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { useToast } from '../components/ToastProvider';

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, [currentPage, search, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll({
        page: currentPage,
        per_page: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setStudents(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentService.delete(studentToDelete.id);
      setStudentToDelete(null);
      showToast('Aluno removido com sucesso.');
      void loadStudents();
    } catch (error: any) {
      console.error('Erro ao remover aluno:', error);
      setStudentToDelete(null);
      showToast(error.response?.data?.message || 'Não foi possível remover o aluno.', 'error');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, data);
      } else {
        await studentService.create(data);
      }
      setShowModal(false);
      showToast(editingStudent ? 'Aluno atualizado com sucesso.' : 'Aluno cadastrado com sucesso.');
      void loadStudents();
    } catch (error: any) {
      console.error('Erro ao salvar aluno:', error);
      showToast(error.response?.data?.message || 'Não foi possível salvar o aluno.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Comunidade acadêmica</p>
          <h1 className="text-xl font-semibold text-foreground">Alunos</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm" className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
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
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-hover/70">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nome
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    CPF
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
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum aluno encontrado
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="transition-colors hover:bg-surface-hover/60">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-foreground">
                        {student.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {student.email}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-muted">
                        {student.cpf}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium">
                        <Link
                          aria-label={`Ver perfil de ${student.name}`}
                          title="Ver perfil"
                          to={`/students/${student.id}`}
                          className="mr-2 inline-flex rounded-md p-2 text-muted transition-colors hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Editar aluno ${student.name}`}
                          title="Editar aluno"
                          onClick={() => handleEdit(student)}
                          className="mr-2 rounded-md p-2 text-muted transition-colors hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover aluno ${student.name}`}
                          title="Remover aluno"
                          onClick={() => setStudentToDelete(student)}
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
        <StudentModal
          student={editingStudent}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {studentToDelete && (
        <ConfirmDialog
          title="Remover aluno?"
          description={`O cadastro de "${studentToDelete.name}" será removido.`}
          onCancel={() => setStudentToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

const brazilianStates = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
] as const;

function StudentModal({ student, onClose, onSave }: any) {
  const [formData, setFormData] = useState(
    student
      ? { ...student, birth_date: String(student.birth_date || '').slice(0, 10) }
      : {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      status: 'active',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={student ? 'Editar aluno' : 'Novo aluno'} size="lg" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="CPF" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <Input label="Data de nascimento" type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} required />
          <label htmlFor="student-status" className="block text-sm font-medium text-foreground">
            Status
            <select
              id="student-status"
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
        <Input label="Endereço" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Cidade" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
          <label htmlFor="student-state" className="block text-sm font-medium text-foreground">
            Estado (UF)
            <select
              id="student-state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              required
            >
              <option value="">Selecione a UF</option>
              {brazilianStates.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
            </select>
          </label>
          <Input label="CEP" value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: formatZipCode(e.target.value) })} required />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{student ? 'Salvar alterações' : 'Cadastrar aluno'}</Button>
        </div>
      </form>
    </Modal>
  );
}
