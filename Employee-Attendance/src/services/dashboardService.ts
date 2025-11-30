import api from './api';
import type { EmployeeDashboard, ManagerDashboard } from '../types';

export const dashboardService = {
  async getEmployeeDashboard(): Promise<EmployeeDashboard> {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },

  async getManagerDashboard(): Promise<ManagerDashboard> {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },
};
