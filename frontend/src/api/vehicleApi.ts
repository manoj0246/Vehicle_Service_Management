import axiosClient from './axiosClient';
import type { Vehicle, CreateVehicleRequest } from '../types/vehicle';

export const getMyVehicles = async (): Promise<Vehicle[]> => {
  const response = await axiosClient.get('/vehicles');
  return response.data.data;
};

export const createVehicle = async (data: CreateVehicleRequest): Promise<Vehicle> => {
  const response = await axiosClient.post('/vehicles', data);
  return response.data.data;
};

export const deleteVehicle = async (id: number): Promise<void> => {
  await axiosClient.delete(`/vehicles/${id}`);
};
