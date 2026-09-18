export interface AdminDashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalServices: number;
  totalTechnicians: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyBookings: MonthlyBooking[];
  recentBookings: RecentBooking[];
}

export interface MonthlyBooking {
  month: string;
  count: number;
  revenue: number;
}

export interface RecentBooking {
  id: number;
  customerName: string;
  vehicleName: string;
  serviceName: string;
  status: string;
  scheduledDate: string;
}

export interface AuditLogItem {
  id: number;
  tableName: string;
  recordId: number;
  action: string;
  changedBy: string;
  oldValues: string | null;
  newValues: string | null;
  changedAt: string;
}

export interface UserManagementItem {
  id: number;
  name: string;
  email: string;
  role: 'Customer' | 'Technician' | 'Admin' | 'SuperAdmin';
  centerId: number | null;
  centerName: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface UpdateUserRolePayload {
  role: string;
  centerId?: number | null;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  centerId: number;
}

export interface TechnicianAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TechnicianManagementItem {
  id: number;
  userId: number;
  name: string;
  email: string;
  centerId: number;
  centerName: string;
  specialization: string;
  isDeleted: boolean;
  availabilities: TechnicianAvailability[];
}

export interface CreateTechnicianPayload {
  name: string;
  email: string;
  password: string;
  centerId: number;
  specialization: string;
  availabilities?: TechnicianAvailability[];
}

export interface UpdateTechnicianPayload {
  name: string;
  email: string;
  centerId: number;
  specialization: string;
  availabilities?: TechnicianAvailability[];
}

export interface CenterManagementItem {
  id: number;
  name: string;
  address: string;
  phone: string;
  serviceCount: number;
  technicianCount: number;
  isDeleted: boolean;
}

export interface CreateCenterPayload {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateCenterPayload {
  name: string;
  address: string;
  phone: string;
}

export interface AdminBookingItem {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  technicianId: number | null;
  technicianName: string | null;
  scheduledDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminBookingFilter {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  centerId: number;
}

export interface UpdateServicePayload {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

