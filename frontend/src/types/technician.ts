import type { BookingResponse } from './booking';

export interface RecentTechnicianBooking {
  id: number;
  customerName: string;
  vehicleName: string;
  serviceName: string;
  status: string;
  scheduledDate: string;
}

export interface TechnicianDashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  recentBookings: RecentTechnicianBooking[];
}

export interface TechnicianAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface JobStatusUpdateRequest {
  status: 'InProgress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export type TechnicianJob = BookingResponse;
