import api from './api';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    department: string;
    role?: string;
  }): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    department?: string;
    password?: string;
  }): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};
