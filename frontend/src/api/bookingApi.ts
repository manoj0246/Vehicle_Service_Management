import axiosClient from './axiosClient';
import type { BookingRequest, BookingResponse } from '../types/booking';

export const bookService = async (data: BookingRequest): Promise<BookingResponse> => {
  const response = await axiosClient.post('/bookings', data);
  return response.data.data;
};

export const getUpcomingBookings = async (): Promise<BookingResponse[]> => {
  const response = await axiosClient.get('/bookings/upcoming');
  return response.data.data;
};

export const getBookingHistory = async (): Promise<BookingResponse[]> => {
  const response = await axiosClient.get('/bookings/history');
  return response.data.data;
};

export const cancelBooking = async (id: number): Promise<void> => {
  await axiosClient.put(`/bookings/${id}/cancel`);
};
