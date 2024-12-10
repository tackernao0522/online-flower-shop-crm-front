import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore, Store } from '@reduxjs/toolkit';
import type { AppDispatch } from '@/store';
import statsReducer, {
  setSalesStats,
  setStatsLoading,
  setStatsError,
  clearStats,
  fetchInitialStats,
  selectSalesStats,
  selectSalesStatsStatus,
  selectSalesStatsError,
  selectTotalSales,
  selectChangeRate,
  selectLastUpdated,
} from '../statsSlice';
import { RootState } from '@/store';

type TestStoreState = Pick<RootState, 'stats'>;

describe('statsSlice', () => {
  const mockAxios = new MockAdapter(axios);
  let store: Store<TestStoreState> & { dispatch: AppDispatch };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        stats: statsReducer,
      },
    });
    mockAxios.reset();
  });

  describe('同期アクション', () => {
    it('売上統計を正しく設定できる', () => {
      // 初期状態で設定
      const initialStatsData = {
        totalSales: 1000,
        changeRate: 5.5,
        lastUpdatedAt: new Date().toISOString(),
      };

      store.dispatch(setSalesStats(initialStatsData));
      const initialState = store.getState().stats;

      expect(initialState.totalSales).toBe(1000);
      expect(initialState.changeRate).toBe(0);

      const updatedStatsData = {
        totalSales: 2000,
        changeRate: 5.5,
        lastUpdatedAt: new Date().toISOString(),
      };

      store.dispatch(setSalesStats(updatedStatsData));
      const updatedState = store.getState().stats;

      expect(updatedState.totalSales).toBe(2000);
      expect(updatedState.changeRate).toBe(5.5);
      expect(updatedState.status).toBe('succeeded');
      expect(updatedState.error).toBeNull();
    });

    it('ローディング状態を設定できる', () => {
      store.dispatch(setStatsLoading());
      expect(store.getState().stats.status).toBe('loading');
    });

    it('エラー状態を設定できる', () => {
      const errorMessage = 'テストエラー';
      store.dispatch(setStatsError(errorMessage));

      const state = store.getState().stats;
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });

    it('統計データをクリアできる', () => {
      store.dispatch(
        setSalesStats({
          totalSales: 1000,
          changeRate: 5.5,
        }),
      );

      store.dispatch(clearStats());

      const state = store.getState().stats;
      expect(state.totalSales).toBeNull();
      expect(state.changeRate).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
    });
  });

  describe('非同期アクション', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('初期統計データを正常に取得できる', async () => {
      const mockResponse = {
        stats: {
          totalSales: 2000,
          salesChangeRate: 10,
        },
      };

      mockAxios
        .onGet(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`)
        .reply(200, mockResponse);

      await store.dispatch(fetchInitialStats());
      const state = store.getState().stats;

      expect(state.totalSales).toBe(2000);
      expect(state.changeRate).toBe(0);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });

    it('APIエラー時に適切に処理される', async () => {
      const errorMessage = 'サーバーエラー';
      mockAxios
        .onGet(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`)
        .reply(500, { message: errorMessage });

      await store.dispatch(fetchInitialStats());
      const state = store.getState().stats;

      expect(state.status).toBe('failed');
      expect(state.error).toBeDefined();
    });
  });

  describe('セレクター', () => {
    it('売上統計全体を取得できる', () => {
      const state = store.getState() as RootState;
      const stats = selectSalesStats(state);

      expect(stats).toHaveProperty('totalSales');
      expect(stats).toHaveProperty('changeRate');
      expect(stats).toHaveProperty('lastUpdatedAt');
    });

    it('ステータスを取得できる', () => {
      const state = store.getState() as RootState;
      const status = selectSalesStatsStatus(state);
      expect(status).toBe('idle');
    });

    it('エラーを取得できる', () => {
      const state = store.getState() as RootState;
      const error = selectSalesStatsError(state);
      expect(error).toBeNull();
    });

    it('総売上を取得できる', () => {
      const state = store.getState() as RootState;
      const totalSales = selectTotalSales(state);
      expect(totalSales).toBe(0);
    });

    it('変化率を取得できる', () => {
      const state = store.getState() as RootState;
      const changeRate = selectChangeRate(state);
      expect(changeRate).toBe(0);
    });

    it('最終更新日時を取得できる', () => {
      const state = store.getState() as RootState;
      const lastUpdated = selectLastUpdated(state);
      expect(lastUpdated).toBeUndefined();
    });
  });
});
