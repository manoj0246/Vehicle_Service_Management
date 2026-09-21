import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from '../components/Footer';
import * as AuthContext from '../context/AuthContext';

describe('Footer Component', () => {
  it('renders branding, support phone, and payment badges for guest', () => {
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
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText(/1800-200-8899/i)).toBeInTheDocument();
    expect(screen.getByText('support@autocareindia.in')).toBeInTheDocument();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('RuPay')).toBeInTheDocument();
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders technician workspace links in footer for Technician role', () => {
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
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText('Technician Workspace')).toBeInTheDocument();
    expect(screen.getByText('Workshop Standards')).toBeInTheDocument();
    expect(screen.queryByText('Customer Portal')).not.toBeInTheDocument();
  });
});
