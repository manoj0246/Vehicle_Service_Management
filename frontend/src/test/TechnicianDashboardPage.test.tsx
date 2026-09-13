import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianDashboardPage } from '../pages/technician/TechnicianDashboardPage';
import { technicianApi } from '../api/technicianApi';

const mockStats = {
  totalBookings: 8,
  pendingBookings: 0,
  confirmedBookings: 3,
  inProgressBookings: 2,
  completedBookings: 3,
  cancelledBookings: 0,
  recentBookings: [],
};

const mockTodayJobs = [
  {
    id: 101,
    customerId: 1,
    customerName: 'Rahul Sharma',
    vehicleId: 1,
    vehicleName: 'Hyundai Creta',
    licensePlate: 'MH 12 AB 1234',
    serviceId: 1,
    serviceName: 'Periodic Maintenance',
    servicePrice: 2999,
    technicianId: 5,
    technicianName: 'Vikram Singh',
    scheduledDate: new Date().toISOString(),
    status: 'Confirmed',
    notes: 'Check engine vibration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 102,
    customerId: 2,
    customerName: 'Pooja Patel',
    vehicleId: 2,
    vehicleName: 'Honda City',
    licensePlate: 'DL 01 XY 9876',
    serviceId: 2,
    serviceName: 'Brake Inspection',
    servicePrice: 1499,
    technicianId: 5,
    technicianName: 'Vikram Singh',
    scheduledDate: new Date().toISOString(),
    status: 'InProgress',
    notes: 'Squeaking sound',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TechnicianDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(technicianApi, 'getDashboardStats').mockResolvedValue(mockStats);
    vi.spyOn(technicianApi, 'getDailySchedule').mockResolvedValue(mockTodayJobs);
    vi.spyOn(technicianApi, 'updateJobStatus').mockResolvedValue({
      success: true,
      message: 'Status updated',
    });
  });

  it('renders stats overview and today assigned jobs', async () => {
    render(
      <BrowserRouter>
        <TechnicianDashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Technician Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Periodic Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Brake Inspection')).toBeInTheDocument();
      expect(screen.getByText('Hyundai Creta (MH 12 AB 1234)')).toBeInTheDocument();
    });
  });

  it('allows technician to start a confirmed job', async () => {
    render(
      <BrowserRouter>
        <TechnicianDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start Job'));

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(101, {
        status: 'InProgress',
        notes: 'Technician started service inspection',
      });
    });
  });

  it('allows completing an in-progress job with work notes modal', async () => {
    render(
      <BrowserRouter>
        <TechnicianDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Complete'));

    expect(screen.getByText('Mark Service as Completed')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/e\.g\. Completed 40-point inspection/i);
    fireEvent.change(textarea, { target: { value: 'Brake pads replaced and tested.' } });

    fireEvent.click(screen.getByText('Confirm Completion'));

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(102, {
        status: 'Completed',
        notes: 'Brake pads replaced and tested.',
      });
    });
  });
});

