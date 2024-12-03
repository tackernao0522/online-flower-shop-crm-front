import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../page';

jest.mock('@/components/templates/DashboardTemplate', () => {
  return function MockDashboardTemplate() {
    return <div data-testid="dashboard-template">Dashboard Template</div>;
  };
});

jest.mock('@/components/templates/ProtectedPageTemplate', () => ({
  ProtectedPageTemplate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-page-template">{children}</div>
  ),
}));

describe('DashboardPage', () => {
  it('ProtectedPageTemplateとDashboardTemplateが正しくレンダリングされること', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('dashboard-template')).toBeInTheDocument();
    expect(screen.getByTestId('protected-page-template')).toBeInTheDocument();
  });
});
