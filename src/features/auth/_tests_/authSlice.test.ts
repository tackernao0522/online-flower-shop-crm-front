import authReducer, {
  login,
  logout,
  setAuthState,
  setUser,
  selectIsAuthenticated,
  selectUser,
  selectToken,
} from "../authSlice";
import { RootState } from "@/store";

describe("認証スライス", () => {
  let mockLocalStorage: { [key: string]: string };
  let originalWindow: any;

  beforeEach(() => {
    mockLocalStorage = {};
    originalWindow = global.window;
    global.window = undefined as any;
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: jest.fn((key) => mockLocalStorage[key]),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  const initialState = {
    token: null,
    user: null,
    isAuthenticated: false,
  };

  it("初期状態を正しく処理すること", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("ローカルストレージから初期状態を正しく読み込むこと", () => {
    const token = "test-token";
    const user = { id: "1", email: "test@example.com", username: "testuser" };
    mockLocalStorage = {
      token: token,
      user: JSON.stringify(user),
    };

    // モジュールをリセットしてキャッシュをクリアする
    jest.resetModules();
    const authSlice = require("../authSlice");
    const newInitialState = authSlice.default(undefined, { type: "unknown" });

    expect(newInitialState).toEqual({
      token: token,
      user: user,
      isAuthenticated: false,
    });
  });

  it("window オブジェクトが存在しない環境で初期状態を正しく処理すること", () => {
    const newInitialState = authReducer(undefined, { type: "unknown" });
    expect(newInitialState).toEqual({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("window オブジェクトが存在する環境で初期状態を正しく処理すること", () => {
    global.window = {} as any;
    const token = "test-token";
    const user = { id: "1", email: "test@example.com", username: "testuser" };
    mockLocalStorage = {
      token: token,
      user: JSON.stringify(user),
    };

    jest.resetModules();
    const authSlice = require("../authSlice");
    const newInitialState = authSlice.default(undefined, { type: "unknown" });

    expect(newInitialState).toEqual({
      token: token,
      user: user,
      isAuthenticated: false,
    });
  });

  it("ログイン処理を正しく処理すること", () => {
    const user = { id: "1", email: "test@example.com", username: "testuser" };
    const action = login({ token: "test-token", user });
    const state = authReducer(initialState, action);
    expect(state).toEqual({
      token: "test-token",
      user,
      isAuthenticated: true,
    });
  });

  it("ログアウト処理を正しく処理すること", () => {
    const loggedInState = {
      token: "test-token",
      user: { id: "1", email: "test@example.com", username: "testuser" },
      isAuthenticated: true,
    };
    const state = authReducer(loggedInState, logout());
    expect(state).toEqual(initialState);
  });

  it("認証状態の設定を正しく処理すること", () => {
    const state = authReducer(initialState, setAuthState(true));
    expect(state.isAuthenticated).toBe(true);
  });

  it("ユーザー情報の設定を正しく処理すること", () => {
    const user = { id: "1", email: "test@example.com", username: "testuser" };
    const state = authReducer(initialState, setUser(user));
    expect(state.user).toEqual(user);
  });

  describe("セレクター", () => {
    const mockRootState: RootState = {
      auth: {
        token: "test-token",
        user: { id: "1", email: "test@example.com", username: "testuser" },
        isAuthenticated: true,
      },
    } as RootState;

    it("認証状態を正しく選択すること", () => {
      expect(selectIsAuthenticated(mockRootState)).toBe(true);
    });

    it("ユーザー情報を正しく選択すること", () => {
      expect(selectUser(mockRootState)).toEqual(mockRootState.auth.user);
    });

    it("トークンを正しく選択すること", () => {
      expect(selectToken(mockRootState)).toBe("test-token");
    });
  });
});