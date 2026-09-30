export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

export interface Student {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: 'active' | 'inactive';
  enrollments?: Enrollment[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  code: string;
  workload: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  enrollments_count?: number;
}

export interface Turma {
  id: number;
  course_id: number;
  name: string;
  term: string | null;
  shift: 'morning' | 'afternoon' | 'night' | 'full_time' | null;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  status: 'active' | 'inactive';
  course?: Course;
  enrollments_count?: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  turma_id: number;
  enrollment_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  student?: Student;
  course?: Course;
  turma?: Turma;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
