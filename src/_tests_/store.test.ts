import { store } from "../store";
import authReducer, { login, logout } from "../features/auth/authSlice";

describe("Reduxストアのテスト", () => {
  it("ストアが初期化されること", () => {
    const state = store.getState();

    // authReducerがストアに含まれていることを確認
    expect(state).toHaveProperty("auth");
  });

  it("authReducerが正しく動作すること", () => {
    // 初期状態でユーザーが認証されていないことを確認
    const initialState = store.getState().auth;
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.user).toBeNull();

    // ログインアクションをディスパッチ
    store.dispatch(
      login({
        token: "sample-token",
        user: { id: "user-id", name: "Test User" },
      })
    );

    // ログイン後の状態を確認
    const loggedInState = store.getState().auth;
    expect(loggedInState.isAuthenticated).toBe(true);
    expect(loggedInState.user).toEqual({ id: "user-id", name: "Test User" });

    // ログアウトアクションをディスパッチ
    store.dispatch(logout());

    // ログアウト後の状態を確認
    const loggedOutState = store.getState().auth;
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.user).toBeNull();
  });
});
