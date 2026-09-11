import axiosClient from './axiosClient';
import type { ServiceItem } from '../types/service';

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
