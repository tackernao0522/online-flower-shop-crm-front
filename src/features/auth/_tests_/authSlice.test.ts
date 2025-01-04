import authReducer, {
  login,
  logout,
  setAuthState,
  setUser,
  selectIsAuthenticated,
  selectUser,
  selectToken,
  AuthState,
  updateUserRole,
} from '../authSlice';
import { User } from '../../../types/user';
import { RootState } from '@/store';

interface CustomersState {
  customers: any[];
  status: string;
  error: null | string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface RolesState {
  roles: any[];
  status: string;
  error: null | string;
}

interface UserState {
  users: any[];
  status: string;
  error: null | string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

describe('認証スライス', () => {
  let mockLocalStorage: { [key: string]: string };
  let originalWindow: any;

  beforeEach(() => {
    mockLocalStorage = {};
    originalWindow = global.window;
    global.window = undefined as any;
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockLocalStorage[key]),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    jest.clearAllMocks();
  });

  const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
  };

  const mockCustomersState: CustomersState = {
    customers: [],
    status: 'idle',
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  };

  const mockRolesState: RolesState = {
    roles: [],
    status: 'idle',
    error: null,
  };

  const mockUsersState: UserState = {
    users: [],
    status: 'idle',
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  };

  describe('初期状態のブラウザ環境依存処理', () => {
    it('ブラウザ環境でない場合、nullを返すこと', () => {
      global.window = undefined as any;

      const newState = authReducer(undefined, { type: 'unknown' });
      expect(newState.token).toBeNull();
      expect(newState.user).toBeNull();
    });

    it('ブラウザ環境で、かつlocalStorageが空の場合、nullを返すこと', () => {
      global.window = {
        localStorage: {
          getItem: () => null,
        },
      } as any;

      const newState = authReducer(undefined, { type: 'unknown' });
      expect(newState.token).toBeNull();
      expect(newState.user).toBeNull();
    });

    it('ブラウザ環境で不正なJSONがある場合、nullを返すこと', () => {
      global.window = {
        localStorage: {
          getItem: (key: string) => (key === 'user' ? 'invalid-json' : null),
        },
      } as any;

      const newState = authReducer(undefined, { type: 'unknown' });
      expect(newState.user).toBeNull();
    });
  });

  it('初期状態を正しく処理すること', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('ローカルストレージから初期状態を正しく読み込むこと', () => {
    const token = 'test-token';
    const user: User = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'STAFF',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
    mockLocalStorage = {
      token: token,
      user: JSON.stringify(user),
    };

    jest.resetModules();
    const authSlice = require('../authSlice');
    const newInitialState = authSlice.default(undefined, { type: 'unknown' });

    expect(newInitialState).toEqual({
      token: token,
      user: user,
      isAuthenticated: false,
    });
  });

  it('ログイン処理を正しく処理すること', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'STAFF',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
    const action = login({ token: 'test-token', user });
    const state = authReducer(initialState, action);
    expect(state).toEqual({
      token: 'test-token',
      user,
      isAuthenticated: true,
    });
  });

  it('ログアウト処理を正しく処理すること', () => {
    const loggedInState: AuthState = {
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'STAFF',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    };

    const action = { type: logout.fulfilled.type };
    const state = authReducer(loggedInState, action);

    expect(state).toEqual({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('認証状態の設定を正しく処理すること', () => {
    const state = authReducer(initialState, setAuthState(true));
    expect(state.isAuthenticated).toBe(true);
  });

  it('ユーザー情報の設定を正しく処理すること', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'STAFF',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
    const state = authReducer(initialState, setUser(user));
    expect(state.user).toEqual(user);
  });

  describe('セレクター', () => {
    const mockRootState: RootState = {
      auth: {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'STAFF',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        isAuthenticated: true,
      },
      customers: mockCustomersState,
      roles: mockRolesState,
      users: mockUsersState,
    } as RootState;

    it('認証状態を正しく選択すること', () => {
      expect(selectIsAuthenticated(mockRootState)).toBe(true);
    });

    it('ユーザー情報を正しく選択すること', () => {
      expect(selectUser(mockRootState)).toEqual(mockRootState.auth.user);
    });

    it('トークンを正しく選択すること', () => {
      expect(selectToken(mockRootState)).toBe('test-token');
    });
  });

  describe('updateUserRole', () => {
    it('ユーザーのロールを正しく更新すること', () => {
      const initialStateWithUser: AuthState = {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'STAFF',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        isAuthenticated: true,
      };

      const newRole = 'ADMIN';
      const state = authReducer(initialStateWithUser, updateUserRole(newRole));

      expect(state.user?.role).toBe(newRole);
    });

    it('ユーザーが存在しない場合は状態を変更しないこと', () => {
      const stateWithoutUser: AuthState = {
        token: null,
        user: null,
        isAuthenticated: false,
      };

      const newRole = 'MANAGER';
      const state = authReducer(stateWithoutUser, updateUserRole(newRole));

      expect(state).toEqual(stateWithoutUser);
    });
  });
});
