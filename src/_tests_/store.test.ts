import store from "../store";
import { login, logout } from "../features/auth/authSlice";
import { waitFor } from "@testing-library/react"; // 追加

describe("Reduxストアのテスト", () => {
  it("ストアが初期化されること", () => {
    const state = store.getState();

    // authReducerがストアに含まれていることを確認
    expect(state).toHaveProperty("auth");
  });

  it("authReducerが正しく動作すること", async () => {
    // 初期状態でユーザーが認証されていないことを確認
    const initialState = store.getState().auth;
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.user).toBeNull();

    // ログインアクションをディスパッチ
    store.dispatch(
      login({
        token: "sample-token",
        user: {
          id: "user-id",
          username: "Test User",
          email: "test@example.com",
          role: "ADMIN",
        }, // 'name'ではなく'username'を使用
      })
    );

    // ログイン後の状態を確認
    const loggedInState = store.getState().auth;
    expect(loggedInState.isAuthenticated).toBe(true);
    expect(loggedInState.user).toEqual({
      id: "user-id",
      username: "Test User", // 'name'ではなく'username'を使用
      email: "test@example.com",
      role: "ADMIN",
    });

    // ログアウトアクションをディスパッチし、非同期処理の完了を待つ
    await store.dispatch(logout());

    // 非同期の状態更新を待つ
    await waitFor(() => {
      const loggedOutState = store.getState().auth;
      expect(loggedOutState.isAuthenticated).toBe(false);
      expect(loggedOutState.user).toBeNull();
    });
  });
});
