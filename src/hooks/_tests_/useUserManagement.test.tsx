import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useUserManagement } from '../useUserManagement';
import { useDispatch, useSelector } from 'react-redux';
import { useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import type { UnknownAction } from '@reduxjs/toolkit';
import { deleteUser } from '@/features/users/usersSlice';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { AppDispatch, RootState } from '@/store';

// console.log と console.error のモック化
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

// モックデータ作成のヘルパー関数
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

const createMockRole = (): Role => ({
  id: 1,
  name: 'TestRole',
  description: 'テストロール',
});

// Redux状態のモック
const createMockReduxState = (overrides = {}) =>
  ({
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
    },
    auth: {
      user: null,
    },
    customers: { customers: [] },
    orders: { orders: [] },
    stats: { stats: null },
    ...overrides,
  }) as unknown as RootState;

// 型定義
type ThunkAction = (...args: any[]) => Promise<any>;
type DispatchResult = UnknownAction | { unwrap: () => Promise<any> };
type MockDispatch = jest.Mock<ReturnType<AppDispatch>>;
type MockSelector = jest.Mock<any, [selector: (state: RootState) => any]>;

// モック設定
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  Provider: ({ children }: { children: React.ReactNode }) => children,
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

// テスト用のラッパーコンポーネント
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = configureStore({
    reducer: {
      users: (state = createMockReduxState().users) => state,
      roles: (state = createMockReduxState().roles) => state,
      auth: (state = createMockReduxState().auth) => state,
      customers: (state = createMockReduxState().customers) => state,
      orders: (state = createMockReduxState().orders) => state,
      stats: (state = createMockReduxState().stats) => state,
    },
  });

  return <Provider store={store}>{children}</Provider>;
};

describe('useUserManagement フック', () => {
  let mockDispatch: MockDispatch;
  let mockSelector: jest.Mock;
  let mockToast: jest.Mock;
  let mockDisclosure: jest.Mock;
  let mockBreakpointValue: jest.Mock;
  let mockRouter: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn((action): any => {
      if (typeof action === 'function') {
        return {
          unwrap: () => Promise.resolve({ id: 1 }),
        };
      }
      return {
        type: 'TEST_ACTION',
        payload: action,
      };
    }) as MockDispatch;

    mockSelector = jest.fn(selector => {
      const state = createMockReduxState();
      return selector(state as RootState);
    });

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

    // 型アサーションを追加
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation(mockSelector);
    (useToast as unknown as jest.Mock).mockReturnValue(mockToast);
    (useDisclosure as unknown as jest.Mock).mockImplementation(mockDisclosure);
    (useBreakpointValue as unknown as jest.Mock).mockImplementation(
      mockBreakpointValue,
    );
    (useRouter as unknown as jest.Mock).mockImplementation(mockRouter);
  });

  test('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper });

    expect(result.current.users).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.searchTerm).toBe('');
    expect(result.current.modalMode).toBe('detail');
    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.userToDelete).toBeNull();
  });

  test('handleUserClick が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper });
    const mockUser = createMockUser();

    act(() => {
      result.current.handleUserClick(mockUser);
    });

    expect(result.current.activeItem).toEqual(mockUser);
    expect(result.current.modalMode).toBe('detail');
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('STAFFユーザーがダッシュボードにリダイレクトされる', () => {
    const mockRouterPush = jest.fn();
    (useRouter as unknown as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    const mockState = createMockReduxState({
      auth: {
        user: createMockUser(),
      },
    });

    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector(mockState),
    );

    renderHook(() => useUserManagement(), { wrapper });

    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  describe('役割管理機能', () => {
    test('handleRolesAndPermissions が正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleRolesAndPermissions();
      });

      expect(result.current.currentView).toBe('roles');
    });

    test('handleAddRole が正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleAddRole();
      });

      expect(result.current.activeItem).toBeNull();
      expect(result.current.modalMode).toBe('add');
      expect(mockDisclosure().onOpen).toHaveBeenCalled();
    });
  });

  test('handleDeleteUser が正しく動作する', () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper });
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
    });
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    const { result } = renderHook(() => useUserManagement(), { wrapper });

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

  describe('エラーハンドリング', () => {
    test('ユーザー削除時のエラーハンドリング', async () => {
      const mockError = new Error('Delete failed');
      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.reject(mockError),
      });
      (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      act(() => {
        result.current.handleDeleteUser(mockUser);
      });

      await act(async () => {
        await result.current.confirmDelete();
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: 'ユーザーの削除に失敗しました',
        }),
      );
    });

    test('ユーザー更新時のエラーハンドリング', async () => {
      const mockError = new Error('Update failed');
      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.reject(mockError),
      });
      (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      await act(async () => {
        await result.current.handleSaveUser(mockUser);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: 'ユーザー情報の更新に失敗しました',
        }),
      );
    });
  });

  describe('キーボードイベント', () => {
    beforeEach(() => {
      mockDispatch.mockClear();
      jest.clearAllMocks();
    });

    test('検索フィールドでのEnterキー処理', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent, 'term');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    test('Enter以外のキー入力では検索が実行されない', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      mockDispatch.mockClear();

      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent, 'term');
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('検索機能の詳細テスト', () => {
    test('検索条件のリセットが正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.setSearchTerm('test');
        result.current.setSearchRole('ADMIN');
      });

      act(() => {
        result.current.handleResetSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchRole).toBe('');
      expect(result.current.lastSearch).toEqual({ type: '', value: '' });
      expect(mockDispatch).toHaveBeenCalled();
    });

    test('無効な検索条件での検索ボタンの状態', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      expect(result.current.isSearchTermEmpty).toBe(true);
      expect(result.current.isSearchRoleEmpty).toBe(true);

      act(() => {
        result.current.setSearchTerm('   '); // 空白のみの入力
      });

      expect(result.current.isSearchTermEmpty).toBe(true);
    });

    test('有効な検索条件で検索ボタンが活性化される', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.setSearchTerm('validSearch');
      });

      expect(result.current.isSearchTermEmpty).toBe(false);
    });
  });

  describe('WebSocket機能', () => {
    test('totalUserCountが更新された時の動作確認', () => {
      const totalUserCount = 100;
      const mockState = createMockReduxState({
        users: {
          users: [],
          status: 'idle',
          error: null,
          currentPage: 1,
          totalPages: 1,
          totalCount: totalUserCount,
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      expect(result.current.totalUsers).toBe(totalUserCount);
    });

    test('WebSocketからの更新が反映される', () => {
      const { result, rerender } = renderHook(() => useUserManagement(), {
        wrapper,
      });
      const newTotalCount = 150;

      act(() => {
        (useSelector as unknown as jest.Mock).mockImplementation(
          (selector: any) =>
            selector(
              createMockReduxState({
                users: { totalCount: newTotalCount },
              }),
            ),
        );
      });

      // モック結果変更後に再レンダーを実行
      rerender();

      expect(result.current.totalUsers).toBe(newTotalCount);
    });
  });

  describe('フォーム状態管理', () => {
    test('handleNewUserSubmit が正しく動作する', async () => {
      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve({ id: '1', username: 'New User' }),
      });
      (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleNewUserSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          title: 'ユーザーが登録されました',
        }),
      );
      expect(result.current.isUserRegistrationModalOpen).toBe(false);
    });

    test('handleEditUserChange が正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      act(() => {
        result.current.handleEditUser(mockUser);
      });

      act(() => {
        result.current.handleEditUserChange({
          target: { name: 'username', value: 'Updated Name' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.activeItem).toEqual(
        expect.objectContaining({
          username: 'Updated Name',
        }),
      );
    });

    test('フォームのリセットが正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleResetSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchRole).toBe('');
      expect(result.current.lastSearch).toEqual({ type: '', value: '' });
    });
  });

  describe('ユーザー権限の確認', () => {
    test('管理者ユーザーの権限確認', () => {
      const mockState = createMockReduxState({
        auth: {
          user: createMockUser({ role: 'ADMIN' }),
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      expect(result.current.canDeleteUser).toBe(true);
    });

    test('一般ユーザーの権限確認', () => {
      const mockState = createMockReduxState({
        auth: {
          user: createMockUser({ role: 'STAFF' }),
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      expect(result.current.canDeleteUser).toBe(false);
    });
  });
});
