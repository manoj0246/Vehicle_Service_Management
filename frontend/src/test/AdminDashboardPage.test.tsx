import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { adminApi } from '../api/adminApi';
import * as AuthContext from '../context/AuthContext';

vi.mock('../api/adminApi');

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        name: 'Admin Manoj',
        email: 'admin@autocare.in',
        role: 'Admin',
        centerId: 1,
      },
      token: 'mock-admin-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders stats overview and recent booking activities', async () => {
    vi.mocked(adminApi.getDashboardStats).mockResolvedValue({
      totalUsers: 45,
      totalVehicles: 60,
      totalServices: 12,
      totalTechnicians: 8,
      totalBookings: 150,
      pendingBookings: 5,
      confirmedBookings: 20,
      inProgressBookings: 8,
      completedBookings: 110,
      cancelledBookings: 7,
      totalRevenue: 285000,
      monthlyBookings: [
        { month: '2026-09', count: 42, revenue: 110000 },
        { month: '2026-08', count: 38, revenue: 95000 },
      ],
      recentBookings: [
        {
          id: 101,
          customerName: 'Aakash Sharma',
          vehicleName: 'Hyundai Creta',
          serviceName: 'Periodic Maintenance Service',
          status: 'InProgress',
          scheduledDate: '2026-09-16T10:00:00Z',
        },
      ],
    });

    vi.mocked(adminApi.getRevenueReport).mockResolvedValue([
      { month: '2026-09', count: 42, revenue: 110000 },
    ]);

    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Executive Overview/i)).toBeInTheDocument();
      expect(screen.getByText('₹2,85,000')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Aakash Sharma')).toBeInTheDocument();
      expect(screen.getByText('Hyundai Creta')).toBeInTheDocument();
    });
  });

  it('allows SuperAdmin to create and assign branch admin to a service center', async () => {
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

    vi.mocked(adminApi.getDashboardStats).mockResolvedValue({
      totalUsers: 10,
      totalVehicles: 15,
      totalServices: 5,
      totalTechnicians: 3,
      totalBookings: 25,
      pendingBookings: 2,
      confirmedBookings: 3,
      inProgressBookings: 1,
      completedBookings: 18,
      cancelledBookings: 1,
      totalRevenue: 50000,
      monthlyBookings: [],
      recentBookings: [],
    });

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
      id: 20,
      name: 'Rajesh Sharma',
      email: 'rajesh.admin@autocare.in',
      role: 'Admin',
      centerId: 1,
      centerName: 'AutoCare Central Bengaluru',
      createdAt: '2026-09-17T00:00:00Z',
      isDeleted: false,
    });

    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Branch Admin/i })).toBeInTheDocument();
    });

    const createAdminBtn = screen.getByRole('button', { name: /Create Branch Admin/i });
    fireEvent.click(createAdminBtn);

    expect(screen.getByRole('heading', { name: /Create Branch Admin/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Sharma'), {
      target: { value: 'Rajesh Sharma' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. rajesh.admin@autocare.in'), {
      target: { value: 'rajesh.admin@autocare.in' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), {
      target: { value: 'Admin@123' },
    });

    const submitButtons = screen.getAllByRole('button', { name: /Create Branch Admin/i });
    fireEvent.click(submitButtons[1]);

    await waitFor(() => {
      expect(adminApi.createAdmin).toHaveBeenCalledWith({
        name: 'Rajesh Sharma',
        email: 'rajesh.admin@autocare.in',
        password: 'Admin@123',
        centerId: 1,
      });
    });
  });
});

