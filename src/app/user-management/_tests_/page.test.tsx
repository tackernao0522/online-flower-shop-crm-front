import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagementPage from '@/app/user-management/page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ChakraProvider } from '@chakra-ui/react';

const initialState = {
  auth: {
    isAuthenticated: true,
    token: 'dummy-token',
  },
};

const store = configureStore({
  reducer: {
    auth: (state = initialState.auth) => state,
  },
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock('@/components/templates/UserManagementTemplate', () => {
  return function MockUserManagementTemplate() {
    return <div data-testid="user-management">UserManagementTemplate</div>;
  };
});

jest.mock('@/components/templates/ProtectedPageTemplate', () => ({
  ProtectedPageTemplate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-template">{children}</div>
  ),
}));

describe('UserManagementPage', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <ChakraProvider>{ui}</ChakraProvider>
      </Provider>,
    );
  };

  it('全てのコンポーネントが正しく表示されること', () => {
    renderWithProviders(<UserManagementPage />);

    expect(screen.getByTestId('protected-template')).toBeInTheDocument();
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    expect(screen.getByText('UserManagementTemplate')).toBeInTheDocument();
  });
});
