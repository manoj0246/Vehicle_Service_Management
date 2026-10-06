import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

describe('ProtectedRoute Component', () => {
  it('renders loading state when auth is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/vehicles']}>
        <Routes>
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <div>Protected Garage Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Garage Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login and does not render children', () => {
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
      <MemoryRouter initialEntries={['/vehicles']}>
        <Routes>
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <div>Protected Garage Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Garage Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        name: 'Rahul Sharma',
        email: 'customer@autocare.in',
        role: 'Customer',
        centerId: null,
      },
      token: 'valid-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/vehicles']}>
        <Routes>
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <div>Protected Garage Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Garage Content')).toBeInTheDocument();
  });

  it('redirects to / if user role is not in allowedRoles', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        name: 'Rahul Sharma',
        email: 'customer@autocare.in',
        role: 'Customer',
        centerId: null,
      },
      token: 'valid-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home Page Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page Screen')).toBeInTheDocument();
  });

  it('renders protected content when user role matches allowedRoles', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 2,
        name: 'Admin User',
        email: 'admin@autocare.in',
        role: 'Admin',
        centerId: 1,
      },
      token: 'admin-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});

