import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookServicePage } from '../pages/customer/BookServicePage';
import * as AuthContext from '../context/AuthContext';
import * as vehicleApi from '../api/vehicleApi';
import * as servicesApi from '../api/servicesApi';
import * as centersApi from '../api/centersApi';
import * as bookingApi from '../api/bookingApi';

describe('BookServicePage Component', () => {
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

    vi.spyOn(vehicleApi, 'getMyVehicles').mockResolvedValue([
      { id: 1, customerId: 1, make: 'Maruti Suzuki', model: 'Swift', year: 2022, licensePlate: 'DL-01-AB-1234' },
    ]);

    vi.spyOn(servicesApi, 'getServices').mockResolvedValue([
      { id: 101, name: 'Full Engine Diagnostics', description: 'OBD scanning', price: 89.99, durationMinutes: 45, centerId: 1, centerName: 'Main Hub' },
    ]);

    vi.spyOn(centersApi, 'getCenters').mockResolvedValue([
      { id: 1, name: 'Main Hub Center', address: '123 MG Road', phone: '080-123456', activeTechniciansCount: 5 },
    ]);
  });

  it('renders booking steps, select car, and submits booking', async () => {
    const bookMock = vi.spyOn(bookingApi, 'bookService').mockResolvedValue({ id: 99 } as any);

    render(
      <BrowserRouter>
        <BookServicePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule a Car Service Appointment')).toBeInTheDocument();
      expect(screen.getByText('Maruti Suzuki Swift (2022)')).toBeInTheDocument();
      expect(screen.getByText('Main Hub Center')).toBeInTheDocument();
      expect(screen.getByText('Full Engine Diagnostics')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Confirm & Book Appointment');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookMock).toHaveBeenCalled();
    });
  });
});

