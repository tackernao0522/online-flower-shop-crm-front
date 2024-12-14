import store, { selectUsers } from '../store';
import { login, logout } from '../features/auth/authSlice';
import { waitFor } from '@testing-library/react';

describe('Reduxストアのテスト', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // loggerのログを監視
    jest.spyOn(console, 'log').mockImplementation(() => {}); // ログ出力抑制

    // 環境変数のバックアップを取る
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
    // 環境変数を元に戻す
    process.env = originalEnv;
  });

  it('ストアが初期化されること', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('customers');
    expect(state).toHaveProperty('roles');
    expect(state).toHaveProperty('users');
    expect(state).toHaveProperty('orders');
    expect(state).toHaveProperty('stats');
  });

  it('authReducerが正しく動作すること', async () => {
    // 初期状態でユーザーが認証されていないことを確認
    const initialState = store.getState().auth;
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.user).toBeNull();

    // User型で必須のプロパティを全て定義
    store.dispatch(
      login({
        token: 'sample-token',
        user: {
          id: 'user-id',
          username: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    // ログイン後の状態を確認
    const loggedInState = store.getState().auth;
    expect(loggedInState.isAuthenticated).toBe(true);
    expect(loggedInState.user).toEqual({
      id: 'user-id',
      username: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
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

  it('loggerMiddlewareが呼び出されていること', () => {
    // console.logが呼ばれたかをチェックする
    store.dispatch({ type: 'TEST_ACTION' });
    expect(console.log).toHaveBeenCalledWith(
      'Before dispatch:',
      expect.objectContaining({ action: { type: 'TEST_ACTION' } }),
    );
    expect(console.log).toHaveBeenCalledWith(
      'After dispatch:',
      expect.any(Object),
    );
  });

  it('NODE_ENVがdevelopmentのときの動作確認', () => {
    // NODE_ENVをdevelopmentにモックする
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    // モジュールキャッシュをクリアしてから再取得する
    jest.resetModules();
    const devStore = require('../store').default;

    devStore.dispatch({ type: 'DEV_TEST_ACTION' });

    // 'Store updated:' のログが出力されているか確認
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Store updated:'),
      expect.any(Object),
    );
  });

  it('selectUsersセレクタの動作確認', () => {
    const state = store.getState();
    const usersState = selectUsers(state);
    expect(usersState).toBe(state.users);
  });
});
