import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminTechniciansPage } from '../pages/admin/AdminTechniciansPage';
import { adminApi } from '../api/adminApi';
import * as AuthContext from '../context/AuthContext';

vi.mock('../api/adminApi');

describe('AdminTechniciansPage', () => {
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

  it('renders technician list and allows onboarding new technician', async () => {
    vi.mocked(adminApi.getAllTechnicians).mockResolvedValue([
      {
        id: 1,
        userId: 10,
        name: 'Vikram Singh',
        email: 'technician@autocare.in',
        centerId: 1,
        centerName: 'AutoCare Central Bengaluru',
        specialization: 'Engine & Electrical',
        isDeleted: false,
        availabilities: [
          { dayOfWeek: 1, startTime: '09:00:00', endTime: '18:00:00' },
        ],
      },
    ]);

    vi.mocked(adminApi.getAllCenters).mockResolvedValue([
      {
        id: 1,
        name: 'AutoCare Central Bengaluru',
        address: '123 MG Road',
        phone: '+91 80 1234 5678',
        serviceCount: 5,
        technicianCount: 2,
        isDeleted: false,
      },
    ]);

    vi.mocked(adminApi.createTechnician).mockResolvedValue({
      id: 2,
      userId: 11,
      name: 'Ramesh Kumar',
      email: 'ramesh@autocare.in',
      centerId: 1,
      centerName: 'AutoCare Central Bengaluru',
      specialization: 'Brake Specialist',
      isDeleted: false,
      availabilities: [],
    });

    render(
      <BrowserRouter>
        <AdminTechniciansPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
      expect(screen.getByText('technician@autocare.in')).toBeInTheDocument();
      expect(screen.getByText('Engine & Electrical')).toBeInTheDocument();
    });

    const onboardButton = screen.getByRole('button', { name: /Onboard Technician/i });
    fireEvent.click(onboardButton);

    expect(screen.getByText(/Onboard New Technician/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh Kumar'), {
      target: { value: 'Ramesh Kumar' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. ramesh@autocare.in'), {
      target: { value: 'ramesh@autocare.in' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), {
      target: { value: 'Ramesh@123' },
    });

    const submitButton = screen.getAllByRole('button', { name: /Onboard Technician/i })[1];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(adminApi.createTechnician).toHaveBeenCalled();
    });
  });
});

