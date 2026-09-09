import axiosClient from './axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data?.data || response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data?.data || response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data?.data || response.data;
  },
};

