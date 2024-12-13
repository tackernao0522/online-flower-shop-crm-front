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
  selectOrders,
  selectOrdersStatus,
  selectOrdersError,
  selectOrderStats,
  selectOrderStatsStatus,
  selectOrderStatsError,
  selectOrdersCurrentPage,
  selectOrdersTotalPages,
  selectOrdersFilterParams,
  selectOrdersWithStatus,
  selectOrderStatsWithStatus,
  selectTotalItems,
  selectPaginationInfo,
} from '../ordersSlice';
import { RootState } from '@/store';
import { Order, OrderItem } from '@/types/order';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 以下はテスト用の最低限のモック型定義例です。
// これまでのエラー内容から、`Product`、`Customer`、`User`に不足しているプロパティを追加しています。
// また、User.roleは"ADMIN" | "MANAGER" | "STAFF"のいずれかしか許容されないため、"admin"から"ADMIN"へ変更します。

type Product = {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  description: string;
  stockQuantity: number;
  category: string;
  is_active: boolean;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  price: 1000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
  description: 'A test product',
  stockQuantity: 50,
  category: 'Flowers',
  is_active: true,
};

const mockOrderItem: OrderItem = {
  id: 'order-item-1',
  orderId: '1',
  productId: 'prod-1',
  quantity: 1,
  unitPrice: 1000,
  product: mockProduct,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

const mockCustomer: Customer = {
  id: 'cust-1',
  name: 'Test Customer',
  email: 'customer@example.com',
  phoneNumber: '000-0000-0000',
  address: '123 Flower St',
  birthDate: '1990-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  username: 'testuser',
  email: 'user@example.com',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const mockOrder: Order = {
  id: '1',
  orderNumber: 'ORD-001',
  orderDate: '2024-01-01',
  totalAmount: 100,
  status: 'PENDING',
  discountApplied: 0,
  customerId: 'cust-1',
  userId: 'user-1',
  campaignId: null,
  customer: mockCustomer,
  order_items: [mockOrderItem],
  orderItems: [mockOrderItem],
  user: mockUser,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

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
      const initialStats = {
        totalCount: 90,
        previousCount: 80,
        changeRate: 10,
      };
      let state = reducer(initialState, setOrderStats(initialStats));

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
        orders: [mockOrder],
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
          data: [mockOrder],
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

      it('注文データの取得に失敗した場合（AxiosError）', async () => {
        const mockError = {
          isAxiosError: true,
          response: {
            data: {
              message: '注文データの取得に失敗しました',
            },
          },
        };
        mockedAxios.get.mockRejectedValueOnce(mockError);

        const thunk = fetchOrders({});
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, rejectedAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrders/pending');
        expect(rejectedAction.type).toBe('orders/fetchOrders/rejected');
        expect(rejectedAction.payload).toBe('予期せぬエラーが発生しました');
      });

      it('注文データの取得に失敗した場合（通常のエラー）', async () => {
        const error = new Error('Unknown error');
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
        expect(rejectedAction.payload).toBe('予期せぬエラーが発生しました');
      });

      it('統計データなしでの注文データ取得に成功した場合', async () => {
        const responseWithoutStats = {
          data: {
            data: [mockOrder],
            meta: {
              current_page: 1,
              total_pages: 5,
              total: 100,
            },
          },
        };
        mockedAxios.get.mockResolvedValueOnce(responseWithoutStats);

        const thunk = fetchOrders({});
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, fulfilledAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrders/pending');
        expect(fulfilledAction.type).toBe('orders/fetchOrders/fulfilled');
        expect(fulfilledAction.payload).toEqual(responseWithoutStats.data);
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

      it('統計データの取得に失敗した場合（AxiosError）', async () => {
        const mockError = {
          isAxiosError: true,
          response: {
            data: {
              message: '統計データの取得に失敗しました',
            },
          },
        };
        mockedAxios.get.mockRejectedValueOnce(mockError);

        const thunk = fetchOrderStats();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, rejectedAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrderStats/pending');
        expect(rejectedAction.type).toBe('orders/fetchOrderStats/rejected');
        expect(rejectedAction.payload).toBe('予期せぬエラーが発生しました');
      });

      it('統計データの取得に失敗した場合（通常のエラー）', async () => {
        const error = new Error('Unknown error');
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
        expect(rejectedAction.payload).toBe('予期せぬエラーが発生しました');
      });

      it('統計データが存在しない場合のエラー処理', async () => {
        const responseWithoutStats = {
          data: {},
        };
        mockedAxios.get.mockResolvedValueOnce(responseWithoutStats);

        const thunk = fetchOrderStats();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await thunk(dispatch, getState, undefined);

        const [pendingAction, rejectedAction] = dispatch.mock.calls.map(
          call => call[0],
        );

        expect(pendingAction.type).toBe('orders/fetchOrderStats/pending');
        expect(rejectedAction.type).toBe('orders/fetchOrderStats/rejected');
        expect(rejectedAction.payload).toBe('予期せぬエラーが発生しました');
      });
    });
  });

  describe('Selectors', () => {
    const mockState: RootState = {
      auth: {} as ReturnType<typeof import('../../auth/authSlice').default>,
      customers: {} as ReturnType<
        typeof import('../../customers/customersSlice').default
      >,
      roles: {} as ReturnType<typeof import('../../roles/rolesSlice').default>,
      users: {} as ReturnType<typeof import('../../users/usersSlice').default>,
      orders: {
        orders: [mockOrder],
        status: 'succeeded',
        error: null,
        stats: {
          totalCount: 100,
          previousCount: 90,
          changeRate: 11.11,
          lastUpdatedAt: '2024-01-01',
        },
        statsStatus: 'succeeded',
        statsError: null,
        currentPage: 2,
        totalPages: 5,
        totalItems: 100,
        filterParams: {
          status: 'PENDING',
        },
      },
      stats: {} as ReturnType<typeof import('../../stats/statsSlice').default>,
    };

    it('注文一覧を選択できること', () => {
      expect(selectOrders(mockState)).toEqual([mockOrder]);
    });

    it('注文ステータスを選択できること', () => {
      expect(selectOrdersStatus(mockState)).toBe('succeeded');
    });

    it('注文エラーを選択できること', () => {
      expect(selectOrdersError(mockState)).toBeNull();
    });

    it('注文統計を選択できること', () => {
      expect(selectOrderStats(mockState)).toEqual({
        totalCount: 100,
        previousCount: 90,
        changeRate: 11.11,
        lastUpdatedAt: '2024-01-01',
      });
    });

    it('統計ステータスを選択できること', () => {
      expect(selectOrderStatsStatus(mockState)).toBe('succeeded');
    });

    it('統計エラーを選択できること', () => {
      expect(selectOrderStatsError(mockState)).toBeNull();
    });

    it('現在のページを選択できること', () => {
      expect(selectOrdersCurrentPage(mockState)).toBe(2);
    });

    it('総ページ数を選択できること', () => {
      expect(selectOrdersTotalPages(mockState)).toBe(5);
    });

    it('フィルターパラメータを選択できること', () => {
      expect(selectOrdersFilterParams(mockState)).toEqual({
        status: 'PENDING',
      });
    });

    it('注文とステータスを一緒に選択できること', () => {
      expect(selectOrdersWithStatus(mockState)).toEqual({
        orders: [mockOrder],
        status: 'succeeded',
      });
    });

    it('統計と統計ステータスを一緒に選択できること', () => {
      expect(selectOrderStatsWithStatus(mockState)).toEqual({
        stats: {
          totalCount: 100,
          previousCount: 90,
          changeRate: 11.11,
          lastUpdatedAt: '2024-01-01',
        },
        status: 'succeeded',
      });
    });

    it('総アイテム数を選択できること', () => {
      expect(selectTotalItems(mockState)).toBe(100);
    });

    it('ページネーション情報を全て選択できること', () => {
      expect(selectPaginationInfo(mockState)).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 100,
      });
    });

    // エッジケースのテスト
    describe('エッジケース', () => {
      const emptyState: RootState = {
        auth: {} as ReturnType<typeof import('../../auth/authSlice').default>,
        customers: {} as ReturnType<
          typeof import('../../customers/customersSlice').default
        >,
        roles: {} as ReturnType<
          typeof import('../../roles/rolesSlice').default
        >,
        users: {} as ReturnType<
          typeof import('../../users/usersSlice').default
        >,
        stats: {} as ReturnType<
          typeof import('../../stats/statsSlice').default
        >,
        orders: {
          ...initialState,
        },
      };

      it('空の状態からセレクターが正しく動作すること', () => {
        expect(selectOrders(emptyState)).toEqual([]);
        expect(selectOrdersStatus(emptyState)).toBe('idle');
        expect(selectOrdersError(emptyState)).toBeNull();
        expect(selectOrderStats(emptyState)).toEqual({
          totalCount: null,
          previousCount: null,
          changeRate: null,
          lastUpdatedAt: undefined,
        });
      });

      const errorState: RootState = {
        auth: {} as ReturnType<typeof import('../../auth/authSlice').default>,
        customers: {} as ReturnType<
          typeof import('../../customers/customersSlice').default
        >,
        roles: {} as ReturnType<
          typeof import('../../roles/rolesSlice').default
        >,
        users: {} as ReturnType<
          typeof import('../../users/usersSlice').default
        >,
        stats: {} as ReturnType<
          typeof import('../../stats/statsSlice').default
        >,
        orders: {
          ...initialState,
          status: 'failed' as const,
          error: 'エラーが発生しました',
          statsStatus: 'failed' as const,
          statsError: '統計データの取得に失敗しました',
        },
      };

      it('エラー状態のセレクターが正しく動作すること', () => {
        expect(selectOrdersError(errorState)).toBe('エラーが発生しました');
        expect(selectOrderStatsError(errorState)).toBe(
          '統計データの取得に失敗しました',
        );
      });

      const stateWithoutFilters: RootState = {
        auth: {} as ReturnType<typeof import('../../auth/authSlice').default>,
        customers: {} as ReturnType<
          typeof import('../../customers/customersSlice').default
        >,
        roles: {} as ReturnType<
          typeof import('../../roles/rolesSlice').default
        >,
        users: {} as ReturnType<
          typeof import('../../users/usersSlice').default
        >,
        stats: {} as ReturnType<
          typeof import('../../stats/statsSlice').default
        >,
        orders: {
          ...initialState,
          filterParams: {},
        },
      };

      it('フィルター未設定時のセレクターが正しく動作すること', () => {
        expect(selectOrdersFilterParams(stateWithoutFilters)).toEqual({});
      });

      it('ページネーション情報が未設定時のセレクターが正しく動作すること', () => {
        expect(selectPaginationInfo(emptyState)).toEqual({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        });
      });
    });
  });

  describe('ExtraReducers', () => {
    describe('fetchOrders', () => {
      it('pending時の状態を正しく更新すること', () => {
        const state = reducer(initialState, {
          type: fetchOrders.pending.type,
        });

        expect(state.status).toBe('loading');
        expect(state.error).toBeNull();
      });

      it('fulfilled時に統計データありの場合、状態を正しく更新すること', () => {
        const mockResponse = {
          data: {
            data: [mockOrder],
          },
          meta: {
            current_page: 2,
            total_pages: 5,
            total: 100,
          },
          stats: {
            totalCount: 100,
            previousCount: 90,
            changeRate: 11.11,
          },
        };

        const state = reducer(initialState, {
          type: fetchOrders.fulfilled.type,
          payload: mockResponse,
        });

        expect(state.status).toBe('succeeded');
        expect(state.orders).toEqual(mockResponse.data.data);
        expect(state.stats.totalCount).toBe(100);
        expect(state.currentPage).toBe(2);
        expect(state.totalPages).toBe(5);
        expect(state.totalItems).toBe(100);
      });

      it('fulfilled時に統計データなしの場合、状態を正しく更新すること', () => {
        const mockResponse = {
          data: {
            data: [mockOrder],
          },
          meta: {
            current_page: 2,
            total_pages: 5,
            total: 100,
          },
        };

        const state = reducer(initialState, {
          type: fetchOrders.fulfilled.type,
          payload: mockResponse,
        });

        expect(state.status).toBe('succeeded');
        expect(state.orders).toEqual(mockResponse.data.data);
        expect(state.stats).toEqual(initialState.stats);
      });

      it('rejected時の状態を正しく更新すること', () => {
        const state = reducer(initialState, {
          type: fetchOrders.rejected.type,
          payload: 'エラーが発生しました',
        });

        expect(state.status).toBe('failed');
        expect(state.error).toBe('エラーが発生しました');
      });
    });

    describe('fetchOrderStats', () => {
      it('pending時の状態を正しく更新すること', () => {
        const state = reducer(initialState, {
          type: fetchOrderStats.pending.type,
        });

        expect(state.statsStatus).toBe('loading');
        expect(state.statsError).toBeNull();
      });

      it('fulfilled時の初期状態からの更新を正しく処理すること', () => {
        const mockStats = {
          totalCount: 100,
          previousCount: 90,
          changeRate: 11.11,
        };

        const state = reducer(initialState, {
          type: fetchOrderStats.fulfilled.type,
          payload: mockStats,
        });

        expect(state.statsStatus).toBe('succeeded');
        expect(state.stats.totalCount).toBe(100);
        expect(state.stats.previousCount).toBe(100);
        expect(state.stats.changeRate).toBe(0);
        expect(state.stats.lastUpdatedAt).toBeDefined();
      });

      it('fulfilled時の既存データからの更新を正しく処理すること', () => {
        const existingState = {
          ...initialState,
          stats: {
            totalCount: 90,
            previousCount: 80,
            changeRate: 10,
            lastUpdatedAt: '2024-01-01',
          },
        };

        const mockStats = {
          totalCount: 100,
          previousCount: 90,
          changeRate: 11.11,
        };

        const state = reducer(existingState, {
          type: fetchOrderStats.fulfilled.type,
          payload: mockStats,
        });

        expect(state.statsStatus).toBe('succeeded');
        expect(state.stats.totalCount).toBe(100);
        expect(state.stats.previousCount).toBe(90);
        expect(state.stats.changeRate).toBe(11.11);
        expect(state.stats.lastUpdatedAt).toBeDefined();
      });

      it('rejected時の状態を正しく更新すること', () => {
        const state = reducer(initialState, {
          type: fetchOrderStats.rejected.type,
          payload: '統計データの取得に失敗しました',
        });

        expect(state.statsStatus).toBe('failed');
        expect(state.statsError).toBe('統計データの取得に失敗しました');
      });
    });
  });
});
