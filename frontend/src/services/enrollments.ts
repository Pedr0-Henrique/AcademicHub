import api from './api';
import type { Enrollment, ApiResponse, PaginatedResponse } from '../types';

export const enrollmentService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    student_id?: number;
    course_id?: number;
  }): Promise<PaginatedResponse<Enrollment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Enrollment>>>('/enrollments', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Enrollment> {
    const response = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    const response = await api.post<ApiResponse<Enrollment>>('/enrollments', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Enrollment>): Promise<Enrollment> {
    const response = await api.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/enrollments/${id}`);
  },
};
