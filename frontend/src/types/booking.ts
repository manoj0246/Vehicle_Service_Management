export interface BookingRequest {
  vehicleId: number;
  serviceId: number;
  technicianId?: number | null;
  scheduledDate: string;
  notes?: string;
}

export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  technicianId?: number | null;
  technicianName?: string;
  scheduledDate: string;
  status: 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
