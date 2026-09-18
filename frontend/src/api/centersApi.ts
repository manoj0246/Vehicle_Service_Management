import axiosClient from './axiosClient';
import type { ServiceCenterItem } from '../types/center';

export const getCenters = async (): Promise<ServiceCenterItem[]> => {
  const response = await axiosClient.get('/centers');
  return response.data.data;
};

export const getCenterById = async (id: number): Promise<ServiceCenterItem> => {
  const response = await axiosClient.get(`/centers/${id}`);
  return response.data.data;
};
