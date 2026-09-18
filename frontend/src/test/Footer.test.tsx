import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Footer } from '../components/Footer';

describe('Footer Component', () => {
  it('renders branding, support phone, and payment badges', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText(/1800-200-8899/i)).toBeInTheDocument();
    expect(screen.getByText('support@autocareindia.in')).toBeInTheDocument();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('RuPay')).toBeInTheDocument();
    expect(screen.getByText(/India's multi-brand car service network/i)).toBeInTheDocument();
  });
});

