import api from './api';
import type { ApiResponse, PaginatedResponse, Turma } from '../types';

export const turmaService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    course_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<Turma>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Turma>>>('/turmas', { params });
    return response.data.data;
  },

  async create(data: Partial<Turma>): Promise<Turma> {
    const response = await api.post<ApiResponse<Turma>>('/turmas', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Turma>): Promise<Turma> {
    const response = await api.put<ApiResponse<Turma>>(`/turmas/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/turmas/${id}`);
  },
};