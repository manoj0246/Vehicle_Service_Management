import axiosClient from './axiosClient';
import type {
  AdminDashboardStats,
  MonthlyBooking,
  AuditLogItem,
  UserManagementItem,
  UpdateUserRolePayload,
  CreateAdminPayload,
  TechnicianManagementItem,
  CreateTechnicianPayload,
  UpdateTechnicianPayload,
  CenterManagementItem,
  CreateCenterPayload,
  UpdateCenterPayload,
  AdminBookingItem,
  AdminBookingFilter,
  CreateServicePayload,
  UpdateServicePayload,
} from '../types/admin';
import type { ServiceItem } from '../types/service';

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await axiosClient.get<{ success: boolean; data: AdminDashboardStats }>('/admin/dashboard');
    return res.data.data;
  },

  getRevenueReport: async (): Promise<MonthlyBooking[]> => {
    const res = await axiosClient.get<{ success: boolean; data: MonthlyBooking[] }>('/admin/reports/revenue');
    return res.data.data;
  },

  getAuditLogs: async (tableName?: string): Promise<AuditLogItem[]> => {
    const params = tableName ? { tableName } : undefined;
    const res = await axiosClient.get<{ success: boolean; data: AuditLogItem[] }>('/admin/audit-logs', { params });
    return res.data.data;
  },

  getAllUsers: async (): Promise<UserManagementItem[]> => {
    const res = await axiosClient.get<{ success: boolean; data: UserManagementItem[] }>('/admin/users');
    return res.data.data;
  },

  getUserById: async (id: number): Promise<UserManagementItem> => {
    const res = await axiosClient.get<{ success: boolean; data: UserManagementItem }>(`/admin/users/${id}`);
    return res.data.data;
  },

  createAdmin: async (payload: CreateAdminPayload): Promise<UserManagementItem> => {
    const res = await axiosClient.post<{ success: boolean; data: UserManagementItem }>('/admin/admins', payload);
    return res.data.data;
  },

  updateUserRole: async (id: number, payload: UpdateUserRolePayload): Promise<void> => {
    await axiosClient.put(`/admin/users/${id}/role`, payload);
  },

  getAllTechnicians: async (): Promise<TechnicianManagementItem[]> => {
    const res = await axiosClient.get<{ success: boolean; data: TechnicianManagementItem[] }>('/admin/technicians');
    return res.data.data;
  },

  getTechnicianById: async (id: number): Promise<TechnicianManagementItem> => {
    const res = await axiosClient.get<{ success: boolean; data: TechnicianManagementItem }>(`/admin/technicians/${id}`);
    return res.data.data;
  },

  createTechnician: async (payload: CreateTechnicianPayload): Promise<TechnicianManagementItem> => {
    const res = await axiosClient.post<{ success: boolean; data: TechnicianManagementItem }>('/admin/technicians', payload);
    return res.data.data;
  },

  updateTechnician: async (id: number, payload: UpdateTechnicianPayload): Promise<TechnicianManagementItem> => {
    const res = await axiosClient.put<{ success: boolean; data: TechnicianManagementItem }>(`/admin/technicians/${id}`, payload);
    return res.data.data;
  },

  deleteTechnician: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/technicians/${id}`);
  },

  getAllCenters: async (): Promise<CenterManagementItem[]> => {
    const res = await axiosClient.get<{ success: boolean; data: CenterManagementItem[] }>('/centers');
    return res.data.data;
  },

  getCenterById: async (id: number): Promise<CenterManagementItem> => {
    const res = await axiosClient.get<{ success: boolean; data: CenterManagementItem }>(`/centers/${id}`);
    return res.data.data;
  },

  createCenter: async (payload: CreateCenterPayload): Promise<CenterManagementItem> => {
    const res = await axiosClient.post<{ success: boolean; data: CenterManagementItem }>('/centers', payload);
    return res.data.data;
  },

  updateCenter: async (id: number, payload: UpdateCenterPayload): Promise<CenterManagementItem> => {
    const res = await axiosClient.put<{ success: boolean; data: CenterManagementItem }>(`/centers/${id}`, payload);
    return res.data.data;
  },

  deleteCenter: async (id: number): Promise<void> => {
    await axiosClient.delete(`/centers/${id}`);
  },

  getAllServices: async (centerId?: number): Promise<ServiceItem[]> => {
    const params = centerId ? { centerId } : undefined;
    const res = await axiosClient.get<{ success: boolean; data: ServiceItem[] }>('/services', { params });
    return res.data.data;
  },

  createService: async (payload: CreateServicePayload): Promise<ServiceItem> => {
    const res = await axiosClient.post<{ success: boolean; data: ServiceItem }>('/services', payload);
    return res.data.data;
  },

  updateService: async (id: number, payload: UpdateServicePayload): Promise<ServiceItem> => {
    const res = await axiosClient.put<{ success: boolean; data: ServiceItem }>(`/services/${id}`, payload);
    return res.data.data;
  },

  deleteService: async (id: number): Promise<void> => {
    await axiosClient.delete(`/services/${id}`);
  },

  getAllBookings: async (filters?: AdminBookingFilter): Promise<AdminBookingItem[]> => {
    const res = await axiosClient.get<{ success: boolean; data: AdminBookingItem[] }>('/bookings/all', { params: filters });
    return res.data.data;
  },

  assignTechnician: async (bookingId: number, technicianId: number): Promise<void> => {
    await axiosClient.put(`/bookings/${bookingId}/assign`, technicianId, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  updateBookingStatus: async (bookingId: number, status: string, notes?: string): Promise<void> => {
    await axiosClient.put(`/bookings/${bookingId}/status`, { status, notes });
  },
};

