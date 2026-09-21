import axiosClient from './axiosClient';
import type {
  TechnicianDashboardStats,
  TechnicianJob,
  TechnicianAvailability,
  JobStatusUpdateRequest,
} from '../types/technician';

export const technicianApi = {
  getDashboardStats: async (): Promise<TechnicianDashboardStats> => {
    const response = await axiosClient.get('/technician/dashboard');
    return response.data.data;
  },

  getAssignedJobs: async (): Promise<TechnicianJob[]> => {
    const response = await axiosClient.get('/technician/jobs');
    return response.data.data;
  },

  getAssignedJobById: async (id: number): Promise<TechnicianJob> => {
    const response = await axiosClient.get(`/technician/jobs/${id}`);
    return response.data.data;
  },

  updateJobStatus: async (id: number, data: JobStatusUpdateRequest): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.put(`/technician/jobs/${id}/status`, data);
    return response.data;
  },

  getDailySchedule: async (date?: string): Promise<TechnicianJob[]> => {
    const params = date ? { date } : {};
    const response = await axiosClient.get('/technician/schedule', { params });
    return response.data.data;
  },

  getAvailability: async (): Promise<TechnicianAvailability[]> => {
    const response = await axiosClient.get('/technician/availability');
    return response.data.data;
  },

  updateAvailability: async (availabilities: TechnicianAvailability[]): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.put('/technician/availability', availabilities);
    return response.data;
  },
};

export default technicianApi;

