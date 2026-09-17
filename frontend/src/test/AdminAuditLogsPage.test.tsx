import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { adminApi } from '../api/adminApi';

vi.mock('../api/adminApi');

describe('AdminAuditLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders system audit logs and inspects change details', async () => {
    vi.mocked(adminApi.getAuditLogs).mockResolvedValue([
      {
        id: 501,
        tableName: 'ServiceRequests',
        recordId: 105,
        action: 'UPDATE',
        changedBy: 'Admin (ID: 1)',
        oldValues: '{"Status":"Pending"}',
        newValues: '{"Status":"Confirmed"}',
        changedAt: '2026-09-16T09:30:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AdminAuditLogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'ServiceRequests' })).toBeInTheDocument();
      expect(screen.getByText('UPDATE')).toBeInTheDocument();
      expect(screen.getByText('Admin (ID: 1)')).toBeInTheDocument();
    });

    const inspectBtn = screen.getByRole('button', { name: /Inspect/i });
    fireEvent.click(inspectBtn);

    expect(screen.getByText(/Audit Inspection: ServiceRequests #105/i)).toBeInTheDocument();
    expect(screen.getByText('{"Status":"Pending"}')).toBeInTheDocument();
    expect(screen.getByText('{"Status":"Confirmed"}')).toBeInTheDocument();
  });
});

