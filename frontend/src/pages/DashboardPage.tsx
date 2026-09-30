import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardService } from '../services/dashboard';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import type { Student } from '../types';

const statusColors = ['var(--success)', 'var(--info)', 'var(--warning)'];

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

export function DashboardPage() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    active_enrollments: 0,
    completed_enrollments: 0,
    enrollments_by_course: [] as { name: string; enrollments: number }[],
    enrollments_by_status: [] as { name: string; value: number }[],
    recent_students: [] as Student[],
  });
  const [loading, setLoading] = useState(true);
  const totalEnrollmentsByStatus = stats.enrollments_by_status.reduce(
    (total, status) => total + status.value,
    0
  );

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { title: 'Alunos', value: stats.total_students, icon: Users, tone: 'bg-primary/10 text-primary' },
    { title: 'Cursos', value: stats.total_courses, icon: BookOpen, tone: 'bg-info/10 text-info' },
    { title: 'Matrículas ativas', value: stats.active_enrollments, icon: GraduationCap, tone: 'bg-success/10 text-success' },
    { title: 'Matrículas concluídas', value: stats.completed_enrollments, icon: TrendingUp, tone: 'bg-warning/10 text-warning' },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Resumo acadêmico</p>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, icon: Icon, tone }) => (
          <Card key={title} className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted">{title}</p>
              {loading ? (
                <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-surface-hover" />
              ) : (
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value.toLocaleString('pt-BR')}</p>
              )}
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tone}`}>
              <Icon size={19} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="min-w-0 xl:col-span-3">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">Matrículas por curso</h2>
            <p className="mt-1 text-sm text-muted-foreground">Alunos vinculados a cada curso</p>
          </div>
          {stats.enrollments_by_course.length > 0 ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.enrollments_by_course} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                  <CartesianGrid stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={112}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--chart-tooltip-bg)',
                      borderColor: 'var(--chart-tooltip-border)',
                      borderRadius: 'var(--radius-control-token)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar dataKey="enrollments" name="Matrículas" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Nenhum curso cadastrado ainda.
            </p>
          )}
        </Card>

        <Card className="min-w-0 xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">Matrículas por status</h2>
            <p className="mt-1 text-sm text-muted-foreground">Distribuição da situação atual</p>
          </div>
          {stats.enrollments_by_status.some((status) => status.value > 0) ? (
            <div className="grid h-64 grid-cols-[minmax(110px,0.85fr)_minmax(0,1.15fr)] items-center gap-2 sm:gap-4">
              <div className="relative h-56 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.enrollments_by_status}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {stats.enrollments_by_status.map((status, index) => (
                        <Cell key={status.name} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--chart-tooltip-bg)',
                        borderColor: 'var(--chart-tooltip-border)',
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {totalEnrollmentsByStatus}
                  </span>
                  <span className="text-xs text-muted-foreground">matrículas</span>
                </div>
              </div>
              <div className="min-w-0 space-y-4">
                {stats.enrollments_by_status.map((status, index) => {
                  const percentage = Math.round((status.value / totalEnrollmentsByStatus) * 100);
                  const color = statusColors[index % statusColors.length];

                  return (
                    <div key={status.name}>
                      <div className="mb-1 flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate text-muted">{status.name}</span>
                        <span className="ml-auto font-semibold tabular-nums text-foreground">
                          {status.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Nenhuma matrícula cadastrada ainda.
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Alunos recentes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Últimos cadastros no sistema</p>
          </div>
          <Link to="/students" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
            Ver alunos <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-y border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="py-3 pr-4 font-medium">Aluno</th>
                <th scope="col" className="px-4 py-3 font-medium">CPF</th>
                <th scope="col" className="px-4 py-3 font-medium">Cadastro</th>
                <th scope="col" className="py-3 pl-4 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recent_students.length > 0 ? stats.recent_students.map((student) => (
                <tr key={student.id} className="transition-colors hover:bg-surface-hover/60">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-foreground">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.email}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">{student.cpf}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(student.created_at)}</td>
                  <td className="py-3 pl-4 text-right">
                    <StatusBadge status={student.status} label={student.status === 'active' ? 'Ativo' : 'Inativo'} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum aluno cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
