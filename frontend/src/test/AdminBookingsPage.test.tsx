import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { adminApi } from '../api/adminApi';

vi.mock('../api/adminApi');

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bookings list and handles technician assignment modal', async () => {
    vi.mocked(adminApi.getAllBookings).mockResolvedValue([
      {
        id: 201,
        customerId: 10,
        customerName: 'Priya Patel',
        vehicleId: 4,
        vehicleName: 'Honda City',
        licensePlate: 'KA-01-MG-1234',
        serviceId: 2,
        serviceName: 'Comprehensive Brake Service',
        servicePrice: 3500,
        technicianId: null,
        technicianName: null,
        scheduledDate: '2026-09-17T11:00:00Z',
        status: 'Pending',
        notes: null,
        createdAt: '2026-09-16T08:00:00Z',
        updatedAt: null,
      },
    ]);

    vi.mocked(adminApi.getAllTechnicians).mockResolvedValue([
      {
        id: 5,
        userId: 15,
        name: 'Vikram Singh',
        email: 'technician@autocare.in',
        centerId: 1,
        centerName: 'AutoCare Central Bengaluru',
        specialization: 'Brake Specialist',
        isDeleted: false,
        availabilities: [],
      },
    ]);

    vi.mocked(adminApi.assignTechnician).mockResolvedValue();

    render(
      <BrowserRouter>
        <AdminBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      expect(screen.getByText('KA-01-MG-1234')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByTitle('Assign Technician');
    fireEvent.click(assignButtons[0]);

    expect(screen.getByText(/Assign Technician \(Booking #201\)/i)).toBeInTheDocument();

    const selectDropdown = screen.getByRole('combobox');
    fireEvent.change(selectDropdown, { target: { value: '5' } });

    const confirmButton = screen.getByRole('button', { name: /Confirm Assignment/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminApi.assignTechnician).toHaveBeenCalledWith(201, 5);
    });
  });
});

