import { configureStore } from '@reduxjs/toolkit';
import rolesReducer, {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
} from '../rolesSlice';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

const createAsyncError = (message: string) => {
  return {
    name: 'Error',
    message,
  };
};

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      roles: rolesReducer,
    },
  });
  return store;
};

type RootState = ReturnType<ReturnType<typeof createTestStore>['getState']>;
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

describe('rolesSliceのテスト', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  test('ロールの初期状態が正しいか', () => {
    const state = store.getState().roles;
    expect(state.roles).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  test('ロールのフェッチが成功する場合', async () => {
    await (store.dispatch as AppDispatch)(fetchRoles());
    const state = store.getState().roles;
    expect(state.status).toBe('succeeded');
    expect(state.roles.length).toBe(3);
    expect(state.roles[0].name).toBe('管理者');
  });

  test('新しいロールの追加が成功する場合', async () => {
    const newRole = { name: 'エディター', description: 'コンテンツ編集権限' };
    await (store.dispatch as AppDispatch)(addRole(newRole));
    const state = store.getState().roles;
    expect(state.roles.length).toBe(1);
    expect(state.roles[0].name).toBe('エディター');
  });

  test('ロールの更新が成功する場合', async () => {
    const role = {
      id: 1,
      name: '管理者',
      description: 'システム全体の管理権限を持つ',
    };
    await (store.dispatch as AppDispatch)(addRole(role));
    const updatedRole = {
      id: 1,
      name: '管理者',
      description: '更新された権限',
    };
    await (store.dispatch as AppDispatch)(updateRole(updatedRole));
    const state = store.getState().roles;
    expect(state.roles[0].description).toBe('更新された権限');
  });

  test('ロールの削除が成功する場合', async () => {
    const role = {
      id: 1,
      name: '管理者',
      description: 'システム全体の管理権限を持つ',
    };
    await (store.dispatch as AppDispatch)(addRole(role));
    await (store.dispatch as AppDispatch)(deleteRole(1));
    const state = store.getState().roles;
    expect(state.roles.length).toBe(0);
  });

  test('ロールのフェッチが失敗する場合のエラーハンドリング', async () => {
    const errorMessage = 'ネットワークエラーが発生しました';

    store.dispatch(
      fetchRoles.rejected(
        createAsyncError(errorMessage),
        'requestId',
        undefined,
      ),
    );

    const state = store.getState().roles;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(errorMessage);
  });

  test('ロールのフェッチが失敗し、エラーメッセージがない場合', async () => {
    store.dispatch(
      fetchRoles.rejected(createAsyncError(''), 'requestId', undefined),
    );

    const state = store.getState().roles;
    expect(state.status).toBe('failed');
    expect(state.error).toBeNull();
  });

  test('ロールの追加が失敗する場合', async () => {
    const errorMessage = 'ロールの追加に失敗しました';
    store.dispatch(
      addRole.rejected(createAsyncError(errorMessage), 'requestId', {
        name: 'テストロール',
        description: '説明',
      }),
    );

    const state = store.getState().roles;
    expect(state.roles.length).toBe(0);
  });

  test('ロールの更新が失敗する場合', async () => {
    const errorMessage = 'ロールの更新に失敗しました';
    store.dispatch(
      updateRole.rejected(createAsyncError(errorMessage), 'requestId', {
        id: 1,
        name: 'テストロール',
        description: '説明',
      }),
    );

    const state = store.getState().roles;
    expect(state.roles.length).toBe(0);
  });
});
