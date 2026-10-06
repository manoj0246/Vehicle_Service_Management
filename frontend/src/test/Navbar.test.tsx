import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar';
import * as AuthContext from '../context/AuthContext';

describe('Navbar Component', () => {
  it('renders guest navigation items when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Auto/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-200-8899/i)).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('My Garage')).not.toBeInTheDocument();
    expect(screen.queryByText('My Bookings')).not.toBeInTheDocument();
  });

  it('renders customer links and profile badge when user is logged in as Customer', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        name: 'Rahul Sharma',
        email: 'customer@autocare.in',
        role: 'Customer',
        centerId: null,
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('My Garage')).toBeInTheDocument();
    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.queryByText('Customer')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^home$/i })).not.toBeInTheDocument();
    expect(screen.getByTitle('Sign out')).toBeInTheDocument();
  });

  it('renders technician navigation links when logged in as Technician', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 5,
        name: 'Vikram Singh',
        email: 'technician@autocare.in',
        role: 'Technician',
        centerId: 1,
      },
      token: 'mock-tech-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Job Queue')).toBeInTheDocument();
    expect(screen.getByText('My Schedule')).toBeInTheDocument();
    expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
    expect(screen.getByText('Technician')).toBeInTheDocument();
    expect(screen.queryByText('My Garage')).not.toBeInTheDocument();
  });

  it('renders admin navigation links when logged in as Admin or SuperAdmin', () => {
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

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Centers')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });
});
