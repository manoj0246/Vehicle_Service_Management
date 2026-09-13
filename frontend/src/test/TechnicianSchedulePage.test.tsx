import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianSchedulePage } from '../pages/technician/TechnicianSchedulePage';
import { technicianApi } from '../api/technicianApi';

const mockTimelineJobs = [
  {
    id: 301,
    customerId: 1,
    customerName: 'Karan Mehra',
    vehicleId: 1,
    vehicleName: 'Mahindra XUV700',
    licensePlate: 'MH 02 BB 5555',
    serviceId: 1,
    serviceName: 'Comprehensive Service',
    servicePrice: 4999,
    technicianId: 5,
    technicianName: 'Vikram Singh',
    scheduledDate: new Date().toISOString(),
    status: 'Confirmed',
    notes: 'Sunroof check needed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAvailability = [
  { dayOfWeek: 1, startTime: '09:00:00', endTime: '18:00:00' },
  { dayOfWeek: 2, startTime: '09:00:00', endTime: '18:00:00' },
  { dayOfWeek: 3, startTime: '09:00:00', endTime: '18:00:00' },
];

describe('TechnicianSchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(technicianApi, 'getDailySchedule').mockResolvedValue(mockTimelineJobs);
    vi.spyOn(technicianApi, 'getAvailability').mockResolvedValue(mockAvailability);
    vi.spyOn(technicianApi, 'updateAvailability').mockResolvedValue({
      success: true,
      message: 'Availability updated successfully',
    });
  });

  it('renders daily timeline appointments', async () => {
    render(
      <BrowserRouter>
        <TechnicianSchedulePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Schedule & Shift Availability')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Comprehensive Service')).toBeInTheDocument();
      expect(screen.getByText('Mahindra XUV700 (MH 02 BB 5555)')).toBeInTheDocument();
      expect(screen.getByText('Karan Mehra')).toBeInTheDocument();
    });
  });

  it('switches to weekly shifts tab and allows saving shift availability', async () => {
    render(
      <BrowserRouter>
        <TechnicianSchedulePage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Weekly Shifts'));

    await waitFor(() => {
      expect(screen.getByText('Weekly Shift Availability')).toBeInTheDocument();
      expect(screen.getByText('Save Shift Availability')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Shift Availability'));

    await waitFor(() => {
      expect(technicianApi.updateAvailability).toHaveBeenCalled();
      expect(screen.getByText(/Weekly shift availability updated successfully/i)).toBeInTheDocument();
    });
  });
});

