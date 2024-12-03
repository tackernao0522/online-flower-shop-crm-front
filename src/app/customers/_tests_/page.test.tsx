import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomerManagementPage from '../page';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(selector => {
    return true;
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock('@/components/templates/CustomerManagementTemplate', () => {
  const MockCustomerManagementTemplate = () => (
    <div data-testid="customer-management">Customer Management Template</div>
  );
  return MockCustomerManagementTemplate;
});

jest.mock('@/components/templates/ProtectedPageTemplate', () => ({
  ProtectedPageTemplate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-template">{children}</div>
  ),
}));

describe('CustomerManagementPage', () => {
  it('ページが正常にレンダリングされること', () => {
    render(<CustomerManagementPage />);

    expect(screen.getByTestId('protected-template')).toBeInTheDocument();
    expect(screen.getByTestId('customer-management')).toBeInTheDocument();
    expect(
      screen.getByText('Customer Management Template'),
    ).toBeInTheDocument();
  });
});
