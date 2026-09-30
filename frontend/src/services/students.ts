import api from './api';
import type { Student, ApiResponse, PaginatedResponse } from '../types';

export interface StudentProfileInput {
  cpf: string;
  phone: string;
  birth_date: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export const studentService = {
  async getMine(): Promise<Student | null> {
    const response = await api.get<ApiResponse<{ student: Student | null }>>('/students/me');
    return response.data.data.student;
  },

  async completeMyProfile(data: StudentProfileInput): Promise<Student> {
    const response = await api.put<ApiResponse<{ student: Student }>>('/students/me/profile', data);
    return response.data.data.student;
  },

  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Student>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Student>>>('/students', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Student>): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>('/students', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Student>): Promise<Student> {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};
