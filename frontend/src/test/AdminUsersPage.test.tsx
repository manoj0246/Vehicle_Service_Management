import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { adminApi } from '../api/adminApi';
import * as AuthContext from '../context/AuthContext';

vi.mock('../api/adminApi');

describe('AdminUsersPage', () => {
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

  it('renders user list and handles role update', async () => {
    vi.mocked(adminApi.getAllUsers).mockResolvedValue([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Customer',
        centerId: null,
        centerName: null,
        createdAt: '2026-09-01T00:00:00Z',
        isDeleted: false,
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

    vi.mocked(adminApi.updateUserRole).mockResolvedValue();

    render(
      <BrowserRouter>
        <AdminUsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    const changeRoleBtn = screen.getByRole('button', { name: /Change Role/i });
    fireEvent.click(changeRoleBtn);

    expect(screen.getByText(/Change Role \(John Doe\)/i)).toBeInTheDocument();

    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'Admin' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Role Change/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.updateUserRole).toHaveBeenCalledWith(1, {
        role: 'Admin',
        centerId: null,
      });
    });
  });

  it('allows SuperAdmin to onboard a new branch Admin user assigned to a center', async () => {
    vi.mocked(adminApi.getAllUsers).mockResolvedValue([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Customer',
        centerId: null,
        centerName: null,
        createdAt: '2026-09-01T00:00:00Z',
        isDeleted: false,
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

    vi.mocked(adminApi.createAdmin).mockResolvedValue({
      id: 25,
      name: 'Kavita Iyer',
      email: 'kavita@autocare.in',
      role: 'Admin',
      centerId: 1,
      centerName: 'AutoCare Central Bengaluru',
      createdAt: '2026-09-17T00:00:00Z',
      isDeleted: false,
    });

    render(
      <BrowserRouter>
        <AdminUsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Admin User/i })).toBeInTheDocument();
    });

    const addAdminBtn = screen.getByRole('button', { name: /Add Admin User/i });
    fireEvent.click(addAdminBtn);

    expect(screen.getByRole('heading', { name: /Create Branch Admin/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Sharma'), {
      target: { value: 'Kavita Iyer' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. rajesh.admin@autocare.in'), {
      target: { value: 'kavita@autocare.in' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), {
      target: { value: 'Admin@123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Create Branch Admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdmin).toHaveBeenCalledWith({
        name: 'Kavita Iyer',
        email: 'kavita@autocare.in',
        password: 'Admin@123',
        centerId: 1,
      });
    });
  });
});

