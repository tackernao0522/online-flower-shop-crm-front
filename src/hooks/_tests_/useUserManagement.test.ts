import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useUserManagement } from '../useUserManagement';
import { useDispatch, useSelector } from 'react-redux';
import { useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import type { UnknownAction } from '@reduxjs/toolkit';
import { deleteUser } from '@/features/users/usersSlice';
import { User } from '@/types/user';
import { AppDispatch, RootState } from '@/store';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  username: 'Test User',
  email: 'test@example.com',
  role: 'STAFF',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

type ThunkAction = (...args: any[]) => Promise<any>;
type DispatchResult = UnknownAction | { unwrap: () => Promise<any> };
type MockDispatchType = jest.Mock<
  DispatchResult | Promise<any>,
  [ThunkAction | UnknownAction]
>;
type MockSelectorType = jest.Mock<any, [selector: (state: RootState) => any]>;

jest.mock('react-redux', () => ({
  useDispatch: jest.fn<() => AppDispatch, []>(),
  useSelector: jest.fn<unknown, [(state: RootState) => unknown]>(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
  useDisclosure: jest.fn(),
  useBreakpointValue: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: jest.fn().mockReturnValue({ totalUserCount: null }),
}));

jest.mock('@/features/users/usersSlice', () => ({
  fetchUsers: jest.fn(),
  addUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  resetUsersState: jest.fn(),
}));

describe('useUserManagement フック', () => {
  let mockDispatch: MockDispatchType;
  let mockSelector: MockSelectorType;
  let mockToast: jest.Mock;
  let mockDisclosure: jest.Mock;
  let mockBreakpointValue: jest.Mock;
  let mockRouter: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn(action => {
      if (typeof action === 'function') {
        return {
          unwrap: () => Promise.resolve({ id: 1 }),
        };
      }
      return {
        type: 'TEST_ACTION',
        payload: action,
      };
    }) as MockDispatchType;

    mockSelector = jest.fn().mockReturnValue({
      users: [],
      status: 'idle',
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    }) as MockSelectorType;

    mockToast = jest.fn();
    mockDisclosure = jest.fn().mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });
    mockBreakpointValue = jest.fn().mockReturnValue(false);
    mockRouter = jest.fn().mockReturnValue({
      push: jest.fn(),
    });

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation(mockSelector);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useDisclosure as jest.Mock).mockImplementation(mockDisclosure);
    (useBreakpointValue as jest.Mock).mockImplementation(mockBreakpointValue);
    (useRouter as jest.Mock).mockImplementation(mockRouter);
  });

  test('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useUserManagement());

    expect(result.current.users).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.searchTerm).toBe('');
    expect(result.current.modalMode).toBe('detail');
    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.userToDelete).toBeNull();
    expect(result.current.totalCount).toBe(0);
  });

  test('handleUserClick が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement());
    const mockUser = createMockUser();

    act(() => {
      result.current.handleUserClick(mockUser);
    });

    expect(result.current.activeItem).toEqual(mockUser);
    expect(result.current.modalMode).toBe('detail');
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('handleAddUser が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement());

    act(() => {
      result.current.handleAddUser();
    });

    expect(result.current.isUserRegistrationModalOpen).toBe(true);
  });

  test('handleEditUser が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement());
    const mockUser = createMockUser({
      email: 'edit@example.com',
      username: 'Edit User',
    });

    act(() => {
      result.current.handleEditUser(mockUser);
    });

    expect(result.current.activeItem).toEqual(mockUser);
    expect(result.current.modalMode).toBe('edit');
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('handleDeleteUser が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement());
    const mockUser = createMockUser();

    act(() => {
      result.current.handleDeleteUser(mockUser);
    });

    expect(result.current.userToDelete).toEqual(mockUser);
    expect(result.current.isDeleteAlertOpen).toBe(true);
  });

  test('confirmDelete が正しく動作する', async () => {
    const mockUser = createMockUser();
    const mockDeleteAction = {
      type: 'users/deleteUser/fulfilled',
      payload: mockUser.id,
    };
    const mockDeletePromise = Promise.resolve(mockDeleteAction);

    (deleteUser as unknown as jest.Mock).mockReturnValue(mockDeletePromise);

    mockDispatch = jest.fn().mockReturnValue({
      unwrap: () => mockDeletePromise,
    }) as MockDispatchType;
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    const { result } = renderHook(() => useUserManagement());

    act(() => {
      result.current.handleDeleteUser(mockUser);
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.userToDelete).toBeNull();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'ユーザーを削除しました',
        status: 'warning',
      }),
    );
  });

  test('handleSearch が正しく動作する', async () => {
    const { result } = renderHook(() => useUserManagement());

    act(() => {
      result.current.handleSearch('term');
    });

    await waitFor(() => {
      expect(result.current.lastSearch.type).toBe('term');
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  test('handleNewUserChange が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement());

    act(() => {
      result.current.handleNewUserChange({
        target: { name: 'username', value: 'New Username' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.newUserFormData.username).toBe('New Username');
  });

  test('STAFFユーザーがダッシュボードにリダイレクトされる', () => {
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        users: {
          users: [],
          status: 'idle',
          error: null,
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
        },
        roles: {
          roles: [],
          status: 'idle',
          error: null,
        },
        auth: {
          user: createMockUser(),
          status: 'idle',
          error: null,
        },
      }),
    );

    renderHook(() => useUserManagement());

    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });
});
