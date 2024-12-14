import store, { selectUsers } from '../store';
import { login, logout } from '../features/auth/authSlice';
import { waitFor } from '@testing-library/react';

describe('Reduxストアのテスト', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    originalEnv = { ...process.env };
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
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
    const initialState = store.getState().auth;
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.user).toBeNull();

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

    await store.dispatch(logout());

    await waitFor(() => {
      const loggedOutState = store.getState().auth;
      expect(loggedOutState.isAuthenticated).toBe(false);
      expect(loggedOutState.user).toBeNull();
    });
  });

  it('loggerMiddlewareが呼び出されていること', () => {
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
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    jest.resetModules();
    const devStore = require('../store').default;

    devStore.dispatch({ type: 'DEV_TEST_ACTION' });

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
