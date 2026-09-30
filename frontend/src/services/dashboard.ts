import api from './api';
import type { Student } from '../types';

export interface DashboardStats {
  total_students: number;
  total_courses: number;
  active_enrollments: number;
  completed_enrollments: number;
  enrollments_by_course: { name: string; enrollments: number }[];
  enrollments_by_status: { name: string; value: number }[];
  recent_students: Student[];
}

const enrollmentStatuses = [
  { value: 'active', name: 'Ativas' },
  { value: 'completed', name: 'Concluídas' },
  { value: 'cancelled', name: 'Canceladas' },
];

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [studentsRes, coursesRes, statusResponses] = await Promise.all([
      api.get('/students', { params: { page: 1, per_page: 5 } }),
      api.get('/courses', { params: { page: 1, per_page: 100 } }),
      Promise.all(
        enrollmentStatuses.map(({ value }) =>
          api.get('/enrollments', { params: { status: value, per_page: 1 } })
        )
      ),
    ]);

    const firstCoursePage = coursesRes.data.data;
    const remainingCoursePages = await Promise.all(
      Array.from({ length: Math.max(0, firstCoursePage.last_page - 1) }, (_, index) =>
        api.get('/courses', { params: { page: index + 2, per_page: 100 } })
      )
    );
    const coursePages = [
      firstCoursePage,
      ...remainingCoursePages.map((response) => response.data.data),
    ];
    const courses = coursePages.flatMap((page) => page.data ?? []);
    const statusCounts = statusResponses.map((response, index) => ({
      name: enrollmentStatuses[index].name,
      value: response.data.data.total ?? 0,
    }));

    return {
      total_students: studentsRes.data.data.total || 0,
      total_courses: firstCoursePage.total || 0,
      active_enrollments: statusCounts[0].value,
      completed_enrollments: statusCounts[1].value,
      enrollments_by_course: courses.map((course) => ({
        name: course.name,
        enrollments: course.enrollments_count ?? 0,
      })),
      enrollments_by_status: statusCounts,
      recent_students: (studentsRes.data.data.data ?? [])
        .sort((first: Student, second: Student) =>
          new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
        ),
    };
  },
};
