import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehiclesPage } from '../pages/customer/VehiclesPage';
import * as AuthContext from '../context/AuthContext';
import * as vehicleApi from '../api/vehicleApi';

describe('VehiclesPage Component', () => {
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

  it('renders registered cars list from API', async () => {
    vi.spyOn(vehicleApi, 'getMyVehicles').mockResolvedValue([
      { id: 10, customerId: 1, make: 'Tata', model: 'Nexon EV', year: 2024, licensePlate: 'KA-01-MJ-9999', color: 'Teal' },
    ]);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading your garage/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Tata Nexon EV')).toBeInTheDocument();
      expect(screen.getByText('KA-01-MJ-9999')).toBeInTheDocument();
    });
  });

  it('shows dynamic custom company input field when Other is selected in modal', async () => {
    vi.spyOn(vehicleApi, 'getMyVehicles').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('+ Register New Car')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Register New Car'));

    expect(screen.getByText('Add Car to Garage')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/e\.g\. BYD, Jeep, Volvo/i)).not.toBeInTheDocument();

    const makeSelect = screen.getByRole('combobox');
    fireEvent.change(makeSelect, { target: { value: 'Other' } });

    expect(screen.getByText('Enter Car Company / Manufacturer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. BYD, Jeep, Volvo/i)).toBeInTheDocument();
  });

  it('opens in-app confirmation modal when clicking remove car button', async () => {
    vi.spyOn(vehicleApi, 'getMyVehicles').mockResolvedValue([
      { id: 10, customerId: 1, make: 'Hyundai', model: 'Creta', year: 2023, licensePlate: 'MH-02-AB-1234', color: 'White' },
    ]);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hyundai Creta')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle('Remove Vehicle');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Remove Car from Garage?')).toBeInTheDocument();
    expect(screen.getByText('Keep Car')).toBeInTheDocument();
    expect(screen.getByText('Yes, Remove')).toBeInTheDocument();
  });
});

