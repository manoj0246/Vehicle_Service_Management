import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminServicesPage } from '../pages/admin/AdminServicesPage';
import { adminApi } from '../api/adminApi';
import * as AuthContext from '../context/AuthContext';

vi.mock('../api/adminApi');

describe('AdminServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 99,
        name: 'Super Admin',
        email: 'superadmin@autocare.in',
        role: 'SuperAdmin',
        centerId: null,
      },
      token: 'mock-superadmin-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders workshop service packages and handles service creation', async () => {
    vi.mocked(adminApi.getAllServices).mockResolvedValue([
      {
        id: 1,
        name: 'Comprehensive Periodic Service',
        description: 'Complete 40-point inspection and engine oil change',
        price: 2499,
        durationMinutes: 90,
        centerId: 1,
        centerName: 'AutoCare Central Bengaluru',
      },
    ]);

    vi.mocked(adminApi.getAllCenters).mockResolvedValue([
      {
        id: 1,
        name: 'AutoCare Central Bengaluru',
        address: '123 MG Road, Bengaluru',
        phone: '+91 80 1234 5678',
        serviceCount: 1,
        technicianCount: 3,
        isDeleted: false,
      },
    ]);

    vi.mocked(adminApi.createService).mockResolvedValue({
      id: 2,
      name: 'AC Gas Refill & Sanitization',
      description: 'Cooling test, compressor check, and disinfectant fogging',
      price: 1499,
      durationMinutes: 45,
      centerId: 1,
      centerName: 'AutoCare Central Bengaluru',
    });

    render(
      <BrowserRouter>
        <AdminServicesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Comprehensive Periodic Service')).toBeInTheDocument();
      expect(
        screen.getByText('Complete 40-point inspection and engine oil change')
      ).toBeInTheDocument();
      expect(screen.getAllByText('AutoCare Central Bengaluru').length).toBeGreaterThanOrEqual(1);
    });

    const addServiceBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addServiceBtn);

    expect(screen.getByText('Add New Service Package')).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText('e.g. Comprehensive Periodic Service'),
      {
        target: { value: 'AC Gas Refill & Sanitization' },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        'Describe included checks, replacements, and warranties...'
      ),
      {
        target: {
          value: 'Cooling test, compressor check, and disinfectant fogging',
        },
      }
    );

    const submitBtn = screen.getByRole('button', { name: /Create Service/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createService).toHaveBeenCalledWith({
        name: 'AC Gas Refill & Sanitization',
        description: 'Cooling test, compressor check, and disinfectant fogging',
        price: 999,
        durationMinutes: 60,
        centerId: 1,
      });
    });
  });
});
