import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore, Store } from '@reduxjs/toolkit';
import type { AppDispatch } from '@/store';
import usersReducer, {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  resetUsers,
  resetUsersState,
} from '../usersSlice';
import type { User, UserState } from '@/types/user';

type TestState = {
  users: UserState;
};

const mockUsers: User[] = [
  {
    id: '1',
    email: 'test1@example.com',
    username: 'Test User 1',
    role: 'STAFF',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'test2@example.com',
    username: 'Test User 2',
    role: 'ADMIN',
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('usersSlice', () => {
  let mockAxios: MockAdapter;
  let store: Store<TestState> & { dispatch: AppDispatch };

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
    }) as Store<TestState> & { dispatch: AppDispatch };
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  describe('ユーザー一覧取得機能', () => {
    it('ユーザー一覧を正常に取得できる', async () => {
      const mockResponse = {
        data: mockUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
        },
      };

      mockAxios
        .onGet(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`)
        .reply(200, mockResponse);

      await store.dispatch(fetchUsers({ page: 1 }));
      const state = store.getState().users;

      expect(state.users).toHaveLength(2);
      expect(state.status).toBe('succeeded');
      expect(state.currentPage).toBe(1);
      expect(state.totalCount).toBe(2);
    });

    it('検索条件付きでユーザー一覧を取得できる', async () => {
      const mockResponse = {
        data: [mockUsers[0]],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAxios
        .onGet(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`)
        .reply(200, mockResponse);

      await store.dispatch(
        fetchUsers({
          page: 1,
          search: 'test1',
          role: 'STAFF',
          isNewSearch: true,
        }),
      );
      const state = store.getState().users;

      expect(state.users).toHaveLength(1);
      expect(state.users[0].email).toBe('test1@example.com');
    });

    it('エラー時に適切に処理される', async () => {
      mockAxios
        .onGet(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`)
        .reply(500);

      await store.dispatch(fetchUsers({ page: 1 }));
      const state = store.getState().users;

      expect(state.status).toBe('failed');
      expect(state.error).toBeDefined();
    });
  });

  describe('ユーザー追加機能', () => {
    it('新規ユーザーを正常に追加できる', async () => {
      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: 'new@example.com',
        username: 'New User',
        role: 'STAFF',
        isActive: true,
      };

      const mockResponse: User = {
        id: '3',
        ...newUser,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      mockAxios
        .onPost(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`)
        .reply(200, mockResponse);

      await store.dispatch(addUser(newUser));
      const state = store.getState().users;

      expect(state.users[0].email).toBe(newUser.email);
      expect(state.totalCount).toBe(1);
    });
  });

  describe('ユーザー更新機能', () => {
    it('既存ユーザーを正常に更新できる', async () => {
      store.dispatch(resetUsersState());
      const initialState = {
        data: mockUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
        },
        isNewSearch: true,
      };
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: initialState,
      });

      const updatedUserData: Partial<User> = {
        username: 'Updated Name',
        isActive: false,
      };

      mockAxios
        .onPut(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/1`)
        .reply(200, { ...mockUsers[0], ...updatedUserData });

      await store.dispatch(updateUser({ id: '1', userData: updatedUserData }));
      const state = store.getState().users;

      expect(state.users.find(u => u.id === '1')?.username).toBe(
        'Updated Name',
      );
      expect(state.users.find(u => u.id === '1')?.isActive).toBe(false);
    });
  });

  describe('ユーザー削除機能', () => {
    it('ユーザーを正常に削除できる', async () => {
      store.dispatch(resetUsersState());
      const initialState = {
        data: mockUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
        },
        isNewSearch: true,
      };
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: initialState,
      });

      mockAxios
        .onDelete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/1`)
        .reply(200);

      await store.dispatch(deleteUser('1'));
      const state = store.getState().users;

      expect(state.users).toHaveLength(1);
      expect(state.users.find(u => u.id === '1')).toBeUndefined();
      expect(state.totalCount).toBe(1);
    });
  });

  describe('状態リセット機能', () => {
    it('ユーザー一覧をリセットできる', () => {
      store.dispatch(resetUsersState());
      const initialState = {
        data: mockUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
        },
        isNewSearch: true,
      };
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: initialState,
      });

      store.dispatch(resetUsers());
      const state = store.getState().users;

      expect(state.users).toHaveLength(0);
      expect(state.currentPage).toBe(1);
      expect(state.totalCount).toBe(0);
      expect(state.status).toBe('idle');
    });

    it('ユーザー状態を完全にリセットできる', () => {
      const initialState = {
        data: mockUsers,
        meta: {
          currentPage: 2,
          totalPages: 3,
          totalCount: 5,
        },
        isNewSearch: true,
      };
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: initialState,
      });

      store.dispatch(resetUsersState());
      const state = store.getState().users;

      expect(state).toEqual({
        users: [],
        status: 'idle',
        error: null,
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
      });
    });
  });
});
