import reducer, {
  OrdersState,
  setOrderStats,
  setStatsLoading,
  setStatsError,
  clearOrderStats,
  setFilterParams,
  clearFilters,
  resetOrderState,
  updatePaginationInfo,
  fetchOrders,
  fetchOrderStats,
} from '../ordersSlice';
import { Order } from '@/types/order';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ordersSlice', () => {
  const initialState: OrdersState = {
    orders: [],
    status: 'idle',
    error: null,
    stats: {
      totalCount: null,
      previousCount: null,
      changeRate: null,
      lastUpdatedAt: undefined,
    },
    statsStatus: 'idle',
    statsError: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    filterParams: {},
  };

  describe('Reducer', () => {
    it('初期ステートを返すこと', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('初期の注文統計を設定できること', () => {
      const statsPayload = {
        totalCount: 100,
        previousCount: 90,
        changeRate: 11.11,
      };

      const state = reducer(initialState, setOrderStats(statsPayload));
      expect(state.stats.totalCount).toBe(100);
      expect(state.stats.previousCount).toBe(100);
      expect(state.stats.changeRate).toBe(0);
      expect(state.statsStatus).toBe('succeeded');
      expect(state.stats.lastUpdatedAt).toBeDefined();
    });

    it('既存の注文統計を更新できること', () => {
      // まず初期値を設定
      const initialStats = {
        totalCount: 90,
        previousCount: 80,
        changeRate: 10,
      };
      let state = reducer(initialState, setOrderStats(initialStats));

      // 次に新しい値で更新
      const updatedStats = {
        totalCount: 100,
        previousCount: 90,
        changeRate: 11.11,
      };
      state = reducer(state, setOrderStats(updatedStats));

      expect(state.stats.totalCount).toBe(100);
      expect(state.stats.previousCount).toBe(90);
      expect(state.stats.changeRate).toBe(11.11);
      expect(state.statsStatus).toBe('succeeded');
      expect(state.stats.lastUpdatedAt).toBeDefined();
    });

    it('統計ローディング状態を設定できること', () => {
      const state = reducer(initialState, setStatsLoading());
      expect(state.statsStatus).toBe('loading');
      expect(state.statsError).toBeNull();
    });

    it('統計エラー状態を設定できること', () => {
      const error = 'エラーが発生しました';
      const state = reducer(initialState, setStatsError(error));
      expect(state.statsStatus).toBe('failed');
      expect(state.statsError).toBe(error);
    });

    it('注文統計をクリアできること', () => {
      const state = reducer(
        {
          ...initialState,
          stats: {
            totalCount: 100,
            previousCount: 90,
            changeRate: 11.11,
            lastUpdatedAt: '2024-01-01',
          },
        },
        clearOrderStats(),
      );
      expect(state.stats).toEqual(initialState.stats);
    });

    it('フィルターパラメータを設定できること', () => {
      const filterParams = {
        status: 'PENDING',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const state = reducer(initialState, setFilterParams(filterParams));
      expect(state.filterParams).toEqual(filterParams);
      expect(state.currentPage).toBe(1);
    });

    it('フィルターをクリアできること', () => {
      const state = reducer(
        {
          ...initialState,
          filterParams: {
            status: 'PENDING',
            startDate: '2024-01-01',
          },
        },
        clearFilters(),
      );
      expect(state.filterParams).toEqual({});
      expect(state.currentPage).toBe(1);
    });

    it('ページネーション情報を更新できること', () => {
      const paginationInfo = {
        currentPage: 2,
        totalPages: 5,
        totalItems: 100,
      };
      const state = reducer(initialState, updatePaginationInfo(paginationInfo));
      expect(state.currentPage).toBe(2);
      expect(state.totalPages).toBe(5);
      expect(state.totalItems).toBe(100);
    });

    it('状態をリセットできること', () => {
      const modifiedState: OrdersState = {
        ...initialState,
        orders: [{ id: '1' } as Order],
        status: 'succeeded',
        currentPage: 2,
      };
      const state = reducer(modifiedState, resetOrderState());
      expect(state).toEqual(initialState);
    });
  });

  describe('Async Thunks', () => {
    describe('fetchOrders', () => {
      const mockOrdersResponse = {
        data: {
          data: [{ id: '1', orderNumber: 'ORD-001' }],
          meta: {
            current_page: 1,
            total_pages: 5,
            total: 100,
          },
          stats: {
            totalCount: 100,
            previousCount: 90,
            changeRate: 11.11,
          },
        },
      };

      it('注文データの取得に成功した場合', async () => {
        mockedAxios.get.mockResolvedValueOnce(mockOrdersResponse);

        const thunk = fetchOrders({});
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, fulfilledAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrders/pending');
        expect(fulfilledAction.type).toBe('orders/fetchOrders/fulfilled');
        expect(fulfilledAction.payload).toEqual(mockOrdersResponse.data);
      });

      it('注文データの取得に失敗した場合', async () => {
        const error = new Error('API Error');
        mockedAxios.get.mockRejectedValueOnce(error);

        const thunk = fetchOrders({});
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, rejectedAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrders/pending');
        expect(rejectedAction.type).toBe('orders/fetchOrders/rejected');
      });
    });

    describe('fetchOrderStats', () => {
      const mockStatsResponse = {
        data: {
          stats: {
            totalCount: 100,
            previousCount: 90,
            changeRate: 11.11,
          },
        },
      };

      it('統計データの取得に成功した場合', async () => {
        mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

        const thunk = fetchOrderStats();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, fulfilledAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrderStats/pending');
        expect(fulfilledAction.type).toBe('orders/fetchOrderStats/fulfilled');
        expect(fulfilledAction.payload).toEqual(mockStatsResponse.data.stats);
      });

      it('統計データの取得に失敗した場合', async () => {
        const error = new Error('API Error');
        mockedAxios.get.mockRejectedValueOnce(error);

        const thunk = fetchOrderStats();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, rejectedAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrderStats/pending');
        expect(rejectedAction.type).toBe('orders/fetchOrderStats/rejected');
      });
    });
  });
});
