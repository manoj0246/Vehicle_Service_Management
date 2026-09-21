export interface Vehicle {
  id: number;
  customerId: number;
  customerName?: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
}
