import api from './api';
import type { Attendance, MonthlySummary, TeamStatus, TeamSummary } from '../types';

export const attendanceService = {
  // Employee endpoints
  async checkIn(): Promise<Attendance> {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  async checkOut(): Promise<Attendance> {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  async getTodayStatus(): Promise<Attendance> {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  async getMyHistory(month?: number, year?: number): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await api.get(`/attendance/my-history?${params}`);
    return response.data;
  },

  async getMySummary(month?: number, year?: number): Promise<MonthlySummary> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await api.get(`/attendance/my-summary?${params}`);
    return response.data;
  },

  // Manager endpoints
  async getAllAttendance(filters?: {
    date?: string;
    status?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/attendance/all?${params}`);
    return response.data;
  },

  async getEmployeeAttendance(id: string, month?: number, year?: number): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await api.get(`/attendance/employee/${id}?${params}`);
    return response.data;
  },

  async getTeamSummary(month?: number, year?: number): Promise<TeamSummary> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await api.get(`/attendance/summary?${params}`);
    return response.data;
  },

  async getTodayTeamStatus(): Promise<TeamStatus> {
    const response = await api.get('/attendance/today-status');
    return response.data;
  },

  async exportAttendance(filters?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/attendance/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
