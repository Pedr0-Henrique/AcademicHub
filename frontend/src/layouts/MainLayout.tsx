import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, LayoutDashboard, Layers, LogOut, Menu, Moon, Sun, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';

type NavigationItem = { path: string; icon: LucideIcon; label: string };

export function MainLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const overviewItem: NavigationItem = { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' };
  const academicItems: NavigationItem[] = [
    { path: '/students', icon: Users, label: 'Alunos' },
    { path: '/courses', icon: BookOpen, label: 'Cursos' },
    { path: '/turmas', icon: Layers, label: 'Turmas' },
    { path: '/enrollments', icon: GraduationCap, label: 'Matrículas' },
  ];
  const navSections: { label: string; items: NavigationItem[] }[] = !user
    ? []
    : user.role === 'user'
      ? [{ label: 'Área acadêmica', items: [{ path: '/student', icon: GraduationCap, label: 'Minha área' }] }]
      : [
          { label: 'Visão geral', items: [overviewItem] },
          { label: 'Acadêmico', items: academicItems },
        ];
  const allItems = navSections.flatMap((section) => section.items);
  const currentPage = allItems.find((item) =>
    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          aria-current={isActive ? 'page' : undefined}
          className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors duration-150 ${
            isActive
              ? 'border-border bg-surface-hover font-medium text-foreground'
              : 'border-transparent text-muted hover:bg-surface-hover hover:text-foreground'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
          <span>{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface px-4 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-normal text-foreground">AcademicHub</h1>
            <p className="text-xs text-muted-foreground">Gestão acadêmica</p>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-2 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto py-6" aria-label="Menu">
          {navSections.map((section) => (
            <section key={section.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
              <ul className="space-y-1">{section.items.map(renderNavItem)}</ul>
            </section>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 border-t border-border px-2 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-sm font-semibold text-foreground">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || 'Usuário'}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user?.role || 'Conta'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair da conta"
            title="Sair"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">AcademicHub / {currentPage?.label || 'Página'}</p>
              <h2 className="truncate text-sm font-semibold text-foreground">{currentPage?.label || 'AcademicHub'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-muted sm:block">{user?.name}</span>
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-pressed={isDark}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
              className="rounded-md border border-border bg-surface-elevated p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
