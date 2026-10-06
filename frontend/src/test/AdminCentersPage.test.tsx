import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminCentersPage } from '../pages/admin/AdminCentersPage';
import { adminApi } from '../api/adminApi';
import * as AuthContext from '../context/AuthContext';

vi.mock('../api/adminApi');

describe('AdminCentersPage', () => {
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

  it('renders workshop center network and handles center creation', async () => {
    vi.mocked(adminApi.getAllCenters).mockResolvedValue([
      {
        id: 1,
        name: 'AutoCare Central Bengaluru',
        address: '123 MG Road, Bengaluru',
        phone: '+91 80 1234 5678',
        serviceCount: 8,
        technicianCount: 3,
        isDeleted: false,
      },
    ]);

    vi.mocked(adminApi.createCenter).mockResolvedValue({
      id: 2,
      name: 'AutoCare Electronic City',
      address: '45 Hosur Road, Bengaluru',
      phone: '+91 80 9876 5432',
      serviceCount: 0,
      technicianCount: 0,
      isDeleted: false,
    });

    render(
      <BrowserRouter>
        <AdminCentersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AutoCare Central Bengaluru')).toBeInTheDocument();
      expect(screen.getByText('123 MG Road, Bengaluru')).toBeInTheDocument();
      expect(screen.getByText('+91 80 1234 5678')).toBeInTheDocument();
    });

    const addCenterBtn = screen.getByRole('button', { name: /Add Service Center/i });
    fireEvent.click(addCenterBtn);

    expect(screen.getByText('Add Workshop Center')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. AutoCare Electronic City'), {
      target: { value: 'AutoCare Electronic City' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Hosur Main Rd/i), {
      target: { value: '45 Hosur Road, Bengaluru' },
    });
    fireEvent.change(screen.getByPlaceholderText(/\+91 80/i), {
      target: { value: '+91 80 9876 5432' },
    });

    const submitBtn = screen.getByRole('button', { name: /Create Center/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createCenter).toHaveBeenCalledWith({
        name: 'AutoCare Electronic City',
        address: '45 Hosur Road, Bengaluru',
        phone: '+91 80 9876 5432',
      });
    });
  });
});

