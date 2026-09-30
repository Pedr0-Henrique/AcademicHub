import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { useAuth } from './hooks/useAuth'
import type { User } from './types'

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const StudentsPage = lazy(() => import('./pages/StudentsPage').then((module) => ({ default: module.StudentsPage })))
const CoursesPage = lazy(() => import('./pages/CoursesPage').then((module) => ({ default: module.CoursesPage })))
const EnrollmentsPage = lazy(() => import('./pages/EnrollmentsPage').then((module) => ({ default: module.EnrollmentsPage })))
const TurmasPage = lazy(() => import('./pages/TurmasPage').then((module) => ({ default: module.TurmasPage })))
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage').then((module) => ({ default: module.StudentProfilePage })))
const StudentPortalPage = lazy(() => import('./pages/StudentPortalPage').then((module) => ({ default: module.StudentPortalPage })))

function RouteFallback() {
  return (
    <div role="status" aria-label="Carregando página" className="mx-auto max-w-screen-2xl animate-pulse space-y-4">
      <span className="sr-only">Carregando página</span>
      <div className="h-7 w-48 rounded bg-surface-hover" />
      <div className="h-28 rounded-lg border border-border bg-surface" />
      <div className="h-64 rounded-lg border border-border bg-surface" />
    </div>
  )
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: User['role'][] }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to={user?.role === 'user' ? '/student' : '/dashboard'} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentPortalPage />} />
          </Route>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="turmas" element={<TurmasPage />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
