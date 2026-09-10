import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentsPage } from '../pages/customer/AppointmentsPage';
import * as AuthContext from '../context/AuthContext';
import * as bookingApi from '../api/bookingApi';

describe('AppointmentsPage Component', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Rahul Sharma', email: 'customer@autocare.in', role: 'Customer', centerId: null },
      token: 'mock-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders upcoming booking and handles custom in-app cancellation modal', async () => {
    vi.spyOn(bookingApi, 'getUpcomingBookings').mockResolvedValue([
      {
        id: 5,
        customerId: 1,
        customerName: 'Rahul Sharma',
        serviceId: 3,
        serviceName: 'Synthetic oil & filter Service',
        servicePrice: 59.99,
        vehicleId: 2,
        vehicleName: 'Hyundai I20',
        licensePlate: 'AP-40-ED-1234',
        status: 'Pending',
        scheduledDate: '2026-09-10T16:00:00Z',
        technicianName: undefined,
        notes: '',
        createdAt: '2026-09-09T10:00:00Z',
      },
    ]);
    vi.spyOn(bookingApi, 'getBookingHistory').mockResolvedValue([]);
    const cancelMock = vi.spyOn(bookingApi, 'cancelBooking').mockResolvedValue({} as any);

    render(
      <BrowserRouter>
        <AppointmentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Synthetic oil & filter Service')).toBeInTheDocument();
      expect(screen.getByText('AP-40-ED-1234')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByText('Cancel Booking');
    fireEvent.click(cancelBtn);

    expect(screen.getByText('Cancel Service Appointment?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel booking #5/i)).toBeInTheDocument();
    expect(screen.getByText('Keep Booking')).toBeInTheDocument();
    expect(screen.getByText('Yes, Cancel Booking')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Yes, Cancel Booking');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(cancelMock).toHaveBeenCalledWith(5);
    });
  });
});

