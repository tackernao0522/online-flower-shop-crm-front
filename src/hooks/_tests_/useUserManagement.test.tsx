import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useUserManagement } from '../useUserManagement';
import { useDispatch, useSelector } from 'react-redux';
import { useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { AppDispatch, RootState } from '@/store';

type MockDispatch = jest.Mock<ReturnType<AppDispatch>>;

jest.mock('@/features/roles/rolesSlice', () => {
  const mockDeleteRole = jest.fn(id => ({
    type: 'roles/deleteRole',
    payload: id,
  }));
  return {
    fetchRoles: jest.fn(),
    deleteRole: mockDeleteRole,
  };
});

const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});

beforeAll(() => {
  window.IntersectionObserver = mockIntersectionObserver;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

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
        type: 'users/action',
        payload: action,
        meta: { requestId: 'test-request-id', requestStatus: 'fulfilled' },
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
        user: createMockUser({ role: 'STAFF' }),
      },
    });

    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector(mockState),
    );

    renderHook(() => useUserManagement(), { wrapper });
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
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
      renderHook(() => useUserManagement(), { wrapper });
      mockDispatch.mockClear();
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

      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent;

      mockDispatch.mockClear();

      act(() => {
        result.current.handleKeyPress(mockEvent, 'term');
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('検索機能の詳細テスト', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      const mockFetchUsers = jest.fn().mockImplementation(params => ({
        type: 'users/fetchUsers',
        payload: params,
      }));

      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve({ users: [] }),
      });

      (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (require('@/features/users/usersSlice') as any).fetchUsers =
        mockFetchUsers;
    });

    test('検索条件のリセットが正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.setSearchTerm('test');
        result.current.setSearchRole('ADMIN');
      });

      mockDispatch.mockClear();

      act(() => {
        result.current.handleResetSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchRole).toBe('');
      expect(result.current.lastSearch).toEqual({ type: '', value: '' });
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    test('無効な検索条件での検索ボタンの状態', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      expect(result.current.isSearchTermEmpty).toBe(true);
      expect(result.current.isSearchRoleEmpty).toBe(true);

      act(() => {
        result.current.setSearchTerm('   ');
      });

      expect(result.current.isSearchTermEmpty).toBe(true);
    });

    test('連続した検索リクエストの処理', async () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      mockDispatch.mockClear();

      await act(async () => {
        result.current.setSearchTerm('first');
      });

      await act(async () => {
        await result.current.handleSearch('term');
      });

      await act(async () => {
        result.current.setSearchTerm('second');
      });

      await act(async () => {
        await result.current.handleSearch('term');
      });

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(result.current.lastSearch).toEqual({
        type: 'term',
        value: 'second',
      });
    });

    test('roleでの検索が正しく動作する', async () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      mockDispatch.mockClear();

      await act(async () => {
        result.current.setSearchRole('ADMIN');
      });

      await act(async () => {
        await result.current.handleSearch('role');
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(result.current.lastSearch).toEqual({
        type: 'role',
        value: 'ADMIN',
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'users/fetchUsers',
          payload: expect.objectContaining({
            role: 'ADMIN',
            isNewSearch: true,
          }),
        }),
      );
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

    test('新規ユーザーフォームの初期状態', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      expect(result.current.newUserFormData).toEqual({
        username: '',
        email: '',
        password: '',
        role: 'STAFF',
        isActive: true,
      });
    });

    test('フォームデータの更新が正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleNewUserChange({
          target: { name: 'username', value: 'New User' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.newUserFormData.username).toBe('New User');
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

      rerender();
      expect(result.current.totalUsers).toBe(newTotalCount);
    });
  });

  describe('モーダル操作とイベント処理', () => {
    test('削除確認モーダルのキャンセル', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      act(() => {
        result.current.handleDeleteUser(mockUser);
      });

      act(() => {
        result.current.cancelDelete();
      });

      expect(result.current.isDeleteAlertOpen).toBe(false);
      expect(result.current.userToDelete).toBeNull();
    });

    test('ユーザー登録モーダルの開閉', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleAddUser();
      });

      expect(result.current.isUserRegistrationModalOpen).toBe(true);

      act(() => {
        result.current.setIsUserRegistrationModalOpen(false);
      });

      expect(result.current.isUserRegistrationModalOpen).toBe(false);
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

    test('マネージャーユーザーの権限確認', () => {
      const mockState = createMockReduxState({
        auth: {
          user: createMockUser({ role: 'MANAGER' }),
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      expect(result.current.canDeleteUser).toBe(false);
    });
  });

  describe('無限スクロール機能', () => {
    beforeEach(() => {
      mockDispatch.mockClear();
      window.IntersectionObserver = jest.fn().mockImplementation(callback => ({
        observe: jest.fn(() =>
          callback([{ isIntersecting: true }], {} as IntersectionObserver),
        ),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }));
    });

    test('追加データのロードが正しく動作する', () => {
      const mockState = createMockReduxState({
        users: {
          currentPage: 1,
          totalPages: 2,
          status: 'idle',
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });

      mockDispatch.mockClear();

      const mockElement = document.createElement('div');
      act(() => {
        result.current.lastElementRef(mockElement);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    test('最後のページで追加ロードが発生しない', () => {
      const mockState = createMockReduxState({
        users: {
          currentPage: 2,
          totalPages: 2,
          status: 'idle',
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(
        (selector: any) => selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });

      mockDispatch.mockClear();

      const mockElement = document.createElement('div');
      act(() => {
        result.current.lastElementRef(mockElement);
      });

      expect(result.current.hasMore).toBe(false);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('クリーンアップ', () => {
    test('コンポーネントのアンマウント時にリソースが解放される', () => {
      const { unmount } = renderHook(() => useUserManagement(), { wrapper });
      unmount();
    });
  });

  describe('追加のエッジケースとエラーハンドリング', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('新規ユーザー登録時の重大なエラーハンドリング', async () => {
      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.reject(new Error('Critical system error')),
      });
      (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleNewUserSubmit(mockEvent);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: 'ユーザー登録に失敗しました',
        }),
      );
    });

    test('ユーザー更新時のバリデーションエラー', async () => {
      mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.reject(new Error('Invalid user data')),
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

    test('モーダル操作時の状態変更', () => {
      const mockOnClose = jest.fn();
      mockDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: jest.fn(),
        onClose: mockOnClose,
      });

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      act(() => {
        result.current.handleEditUser(mockUser);
      });

      expect(result.current.modalMode).toBe('edit');

      act(() => {
        result.current.onClose();
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('無限スクロールの状態管理', () => {
      const mockState = createMockReduxState({
        users: {
          currentPage: 2,
          totalPages: 3,
          status: 'loading',
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(selector =>
        selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      mockDispatch.mockClear();

      act(() => {
        result.current.lastElementRef(document.createElement('div'));
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    test('ユーザー編集時のロール更新', async () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser({ role: 'STAFF' });

      act(() => {
        result.current.handleEditUser(mockUser);
      });

      act(() => {
        result.current.handleEditUserChange({
          target: { name: 'role', value: 'MANAGER' },
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      expect(result.current.activeItem).toEqual(
        expect.objectContaining({
          role: 'MANAGER',
        }),
      );
    });

    test('ビュー切り替え時の状態管理', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      expect(result.current.currentView).toBe('users');

      act(() => {
        result.current.handleViewChange('roles');
      });

      expect(result.current.currentView).toBe('roles');
    });
  });

  describe('ユーザー情報の永続化と更新', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    test('ローカルストレージからユーザー情報を読み込む', () => {
      const mockUser = createMockUser({ role: 'ADMIN' });
      localStorage.setItem('user', JSON.stringify(mockUser));

      renderHook(() => useUserManagement(), { wrapper });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('auth/setUser'),
          payload: mockUser,
        }),
      );
    });

    test('totalUserCountの更新が正しく反映される', () => {
      const mockState = createMockReduxState({
        users: {
          totalCount: 100,
        },
      });

      const mockTotalUserCount = 150;

      (require('@/hooks/useWebSocket') as any).useWebSocket = jest
        .fn()
        .mockReturnValue({
          totalUserCount: mockTotalUserCount,
        });

      (useSelector as unknown as jest.Mock).mockImplementation(selector =>
        selector(mockState),
      );

      const { result } = renderHook(() => useUserManagement(), { wrapper });

      expect(result.current.totalUsers).toBe(mockTotalUserCount);
    });

    test('ロールタイプのアイテム編集が正しく動作する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockRole = createMockRole();

      act(() => {
        result.current.handleEditRole(mockRole);
      });

      act(() => {
        result.current.handleEditUserChange({
          target: { name: 'description', value: '更新後の説明' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.activeItem).toEqual(
        expect.objectContaining({
          description: '更新後の説明',
        }),
      );
    });

    test('自分自身のユーザー情報を更新した際のロール更新', async () => {
      const mockCurrentUser = createMockUser({
        id: '1',
        role: 'MANAGER' as const,
      });
      const mockState = createMockReduxState({
        auth: {
          user: mockCurrentUser,
        },
      });

      (useSelector as unknown as jest.Mock).mockImplementation(selector =>
        selector(mockState),
      );

      const updatedUser = {
        ...mockCurrentUser,
        role: 'ADMIN' as const,
      };

      const mockAction = {
        type: 'users/updateUser/fulfilled',
        payload: updatedUser,
      };

      mockDispatch.mockReturnValue({
        unwrap: () => Promise.resolve(updatedUser),
        ...mockAction,
      });

      const { result } = renderHook(() => useUserManagement(), { wrapper });

      await act(async () => {
        await result.current.handleSaveUser(updatedUser);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('auth/updateUserRole'),
          payload: 'ADMIN',
        }),
      );
    });

    test('ユーザー情報更新時の重大なエラーハンドリング', async () => {
      const criticalError = new Error('Network error');
      const mockAction = {
        type: 'users/updateUser/rejected',
        error: criticalError,
      };

      mockDispatch.mockReturnValue({
        unwrap: () => Promise.reject(criticalError),
        ...mockAction,
      });

      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockUser = createMockUser();

      await act(async () => {
        await result.current.handleSaveUser(mockUser);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: 'ユーザー情報の更新に失敗しました',
          description: 'Network error',
        }),
      );
    });
  });

  describe('ユーザー管理の高度な操作', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockDispatch.mockReturnValue({
        type: 'TEST_ACTION',
        payload: undefined,
      });
    });

    test('handleEditUserChangeがnull状態を正しく処理する', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleEditUserChange({
          target: { name: 'username', value: 'test' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.activeItem).toBeNull();
    });

    test('役割管理機能の一連の操作', () => {
      const { deleteRole } = require('@/features/roles/rolesSlice');

      const { result } = renderHook(() => useUserManagement(), { wrapper });

      act(() => {
        result.current.handleRolesAndPermissions();
      });
      expect(result.current.currentView).toBe('roles');

      act(() => {
        result.current.handleAddRole();
      });
      expect(result.current.activeItem).toBeNull();
      expect(result.current.modalMode).toBe('add');
      expect(mockDisclosure().onOpen).toHaveBeenCalled();

      mockDispatch.mockClear();
      const roleId = 1;

      act(() => {
        result.current.handleDeleteRole(roleId);
      });

      expect(deleteRole).toHaveBeenCalledWith(roleId);

      const expectedAction = {
        type: 'roles/deleteRole',
        payload: roleId,
      };

      expect(mockDispatch).toHaveBeenCalledWith(expectedAction);
    });

    test('役割管理の状態遷移テスト', () => {
      const { result } = renderHook(() => useUserManagement(), { wrapper });
      const mockRole: Role = {
        id: 1,
        name: 'Test Role',
        description: 'Test Description',
      };

      act(() => {
        result.current.handleRolesAndPermissions();
      });

      act(() => {
        result.current.handleAddRole();
      });

      act(() => {
        result.current.handleEditRole(mockRole);
      });

      act(() => {
        result.current.handleDeleteRole(mockRole.id);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
