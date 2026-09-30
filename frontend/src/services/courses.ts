import api from './api';
import type { Course, ApiResponse, PaginatedResponse } from '../types';

export const courseService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Course>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Course>>>('/courses', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Course> {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Course>): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Course>): Promise<Course> {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/courses/${id}`);
  },
};
