import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianDashboardPage } from '../pages/technician/TechnicianDashboardPage';
import { technicianApi } from '../api/technicianApi';
import type { BookingResponse } from '../types/booking';

const mockStats = {
  totalBookings: 8,
  pendingBookings: 0,
  confirmedBookings: 3,
  inProgressBookings: 2,
  completedBookings: 3,
  cancelledBookings: 0,
  recentBookings: [],
};

const mockTodayJobs: BookingResponse[] = [
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
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Hyundai Creta')).toBeInTheDocument();
      expect(screen.getByText('Pooja Patel')).toBeInTheDocument();
      expect(screen.getByText('Honda City')).toBeInTheDocument();
    });
  });

  it('allows technician to start a confirmed job without destroying customer note', async () => {
    render(
      <BrowserRouter>
        <TechnicianDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Inspection')).toBeInTheDocument();
    });

    const startBtn = screen.getByText('Start Inspection');
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(101, {
        status: 'InProgress',
        notes: undefined,
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
      expect(screen.getByText('Complete Job')).toBeInTheDocument();
    });

    const completeBtn = screen.getByText('Complete Job');
    fireEvent.click(completeBtn);

    expect(screen.getByText(/Complete Service Job #102/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Summarize work completed/i);
    fireEvent.change(textarea, { target: { value: 'Brake pads replaced and discs skimmed' } });

    const partsInput = screen.getByPlaceholderText(/e.g. Front brake pads/i);
    fireEvent.change(partsInput, { target: { value: 'OEM Bosch Front Pads' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Job Completion/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(102, {
        status: 'Completed',
        notes: 'Brake pads replaced and discs skimmed | Parts: OEM Bosch Front Pads',
      });
    });
  });
});
