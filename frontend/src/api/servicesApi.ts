import axiosClient from './axiosClient';
import type { ServiceItem } from '../types/service';
import type { CreateServicePayload, UpdateServicePayload } from '../types/admin';

export const getServices = async (centerId?: number): Promise<ServiceItem[]> => {
  const response = await axiosClient.get('/services', {
    params: centerId ? { centerId } : undefined,
  });
  return response.data.data;
};

export const getServiceById = async (id: number): Promise<ServiceItem> => {
  const response = await axiosClient.get(`/services/${id}`);
  return response.data.data;
};

export const createService = async (payload: CreateServicePayload): Promise<ServiceItem> => {
  const response = await axiosClient.post('/services', payload);
  return response.data.data;
};

export const updateService = async (id: number, payload: UpdateServicePayload): Promise<ServiceItem> => {
  const response = await axiosClient.put(`/services/${id}`, payload);
  return response.data.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axiosClient.delete(`/services/${id}`);
};
