import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianJobsPage } from '../pages/technician/TechnicianJobsPage';
import { technicianApi } from '../api/technicianApi';
import type { BookingResponse } from '../types/booking';

const mockJobs: BookingResponse[] = [
  {
    id: 201,
    customerId: 1,
    customerName: 'Amit Verma',
    vehicleId: 1,
    vehicleName: 'Tata Nexon',
    licensePlate: 'KA 05 MN 4321',
    serviceId: 1,
    serviceName: 'Full Engine Diagnostic',
    servicePrice: 3500,
    technicianId: 5,
    technicianName: 'Vikram Singh',
    scheduledDate: '2026-09-15T10:00:00Z',
    status: 'Confirmed',
    notes: 'Engine check light on',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 202,
    customerId: 2,
    customerName: 'Sneha Rao',
    vehicleId: 2,
    vehicleName: 'Maruti Brezza',
    licensePlate: 'KA 01 TR 7788',
    serviceId: 2,
    serviceName: 'Wheel Alignment & Balancing',
    servicePrice: 1200,
    technicianId: 5,
    technicianName: 'Vikram Singh',
    scheduledDate: '2026-09-15T14:00:00Z',
    status: 'InProgress',
    notes: 'Steering pulling left',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
];

describe('TechnicianJobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(technicianApi, 'getAssignedJobs').mockResolvedValue(mockJobs);
    vi.spyOn(technicianApi, 'updateJobStatus').mockResolvedValue({
      success: true,
      message: 'Status updated',
    });
  });

  it('renders all assigned jobs and details', async () => {
    render(
      <BrowserRouter>
        <TechnicianJobsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Assigned Service Jobs')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Amit Verma')).toBeInTheDocument();
      expect(screen.getByText('Tata Nexon')).toBeInTheDocument();
      expect(screen.getByText('KA 05 MN 4321')).toBeInTheDocument();
      expect(screen.getByText('Sneha Rao')).toBeInTheDocument();
    });
  });

  it('filters jobs when clicking tab filters', async () => {
    render(
      <BrowserRouter>
        <TechnicianJobsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Amit Verma')).toBeInTheDocument();
      expect(screen.getByText('Sneha Rao')).toBeInTheDocument();
    });

    const inProgressTab = screen.getByRole('button', { name: /In Progress/i });
    fireEvent.click(inProgressTab);

    expect(screen.queryByText('Amit Verma')).not.toBeInTheDocument();
    expect(screen.getByText('Sneha Rao')).toBeInTheDocument();
  });

  it('allows starting a confirmed job without wiping customer notes', async () => {
    render(
      <BrowserRouter>
        <TechnicianJobsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Inspection')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Inspection');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(201, {
        status: 'InProgress',
        notes: undefined,
      });
    });
  });

  it('allows reporting an issue and cancelling a job', async () => {
    render(
      <BrowserRouter>
        <TechnicianJobsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Report Issue')).toBeInTheDocument();
    });

    const reportButton = screen.getByText('Report Issue');
    fireEvent.click(reportButton);

    expect(screen.getByText(/Report Issue \/ Cancel Job/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Parts unavailable/i);
    fireEvent.change(textarea, { target: { value: 'Engine spare part unavailable' } });

    const confirmCancelBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });
    fireEvent.click(confirmCancelBtn);

    await waitFor(() => {
      expect(technicianApi.updateJobStatus).toHaveBeenCalledWith(201, {
        status: 'Cancelled',
        notes: 'Engine spare part unavailable',
      });
    });
  });
});
