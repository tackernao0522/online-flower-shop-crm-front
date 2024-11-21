import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';
import { Order } from '@/types/order';

// State types
export interface OrderStats {
  totalCount: number | null;
  previousCount: number | null;
  changeRate: number | null;
  lastUpdatedAt?: string;
}

export interface OrdersState {
  orders: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  stats: OrderStats;
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  statsError: string | null;
  currentPage: number;
  totalPages: number;
  filterParams: {
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  };
}

interface FetchOrdersParams {
  page?: number;
  per_page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

// Initial state
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
  filterParams: {},
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: {
            ...params,
            per_page: params.per_page || 15,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '注文データの取得に失敗しました',
        );
      }
      return rejectWithValue('予期せぬエラーが発生しました');
    }
  },
);

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: {
            page: 1,
            per_page: 1,
          },
        },
      );

      if (!response.data.stats) {
        throw new Error('統計データが見つかりません');
      }

      return response.data.stats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '統計データの取得に失敗しました',
        );
      }
      return rejectWithValue('予期せぬエラーが発生しました');
    }
  },
);

// Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderStats: {
      reducer: (
        state,
        action: PayloadAction<{
          totalCount: number;
          previousCount: number;
          changeRate: number;
        }>,
      ) => {
        if (
          state.stats.totalCount === null ||
          state.stats.previousCount === null ||
          state.stats.changeRate === null
        ) {
          state.stats = {
            totalCount: action.payload.totalCount,
            previousCount: action.payload.totalCount,
            changeRate: 0,
            lastUpdatedAt: new Date().toISOString(),
          };
        } else {
          state.stats = {
            ...action.payload,
            lastUpdatedAt: new Date().toISOString(),
          };
        }
        state.statsStatus = 'succeeded';
        state.statsError = null;
      },
      prepare: (payload: {
        totalCount: number;
        previousCount: number;
        changeRate: number;
      }) => {
        return { payload };
      },
    },
    setStatsLoading: state => {
      state.statsStatus = 'loading';
      state.statsError = null;
    },
    setStatsError: (state, action: PayloadAction<string>) => {
      state.statsStatus = 'failed';
      state.statsError = action.payload;
    },
    clearOrderStats: state => {
      state.stats = { ...initialState.stats };
      state.statsStatus = 'idle';
      state.statsError = null;
    },
    setFilterParams: (
      state,
      action: PayloadAction<OrdersState['filterParams']>,
    ) => {
      state.filterParams = action.payload;
    },
    clearFilters: state => {
      state.filterParams = {};
    },
    resetOrderState: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        console.log('Fetch Orders Response:', action.payload);
        state.status = 'succeeded';
        state.orders = action.payload.data.data;
        state.currentPage = action.payload.meta.current_page;
        state.totalPages = action.payload.meta.total_pages;

        if (action.payload.stats) {
          if (state.stats.totalCount === null) {
            state.stats = {
              totalCount: action.payload.stats.totalCount,
              previousCount: action.payload.stats.totalCount,
              changeRate: 0,
              lastUpdatedAt: new Date().toISOString(),
            };
          } else {
            state.stats = {
              totalCount: action.payload.stats.totalCount,
              previousCount: action.payload.stats.previousCount,
              changeRate: action.payload.stats.changeRate,
              lastUpdatedAt: new Date().toISOString(),
            };
          }
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchOrderStats.pending, state => {
        state.statsStatus = 'loading';
        state.statsError = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded';
        if (state.stats.totalCount === null) {
          state.stats = {
            totalCount: action.payload.totalCount,
            previousCount: action.payload.totalCount,
            changeRate: 0,
            lastUpdatedAt: new Date().toISOString(),
          };
        } else {
          state.stats = {
            totalCount: action.payload.totalCount,
            previousCount: action.payload.previousCount,
            changeRate: action.payload.changeRate,
            lastUpdatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.statsError = action.payload as string;
      });
  },
});

// Base selector
const selectOrdersState = (state: RootState) => state.orders;

// Memoized selectors
export const selectOrders = createSelector(
  [selectOrdersState],
  state => state.orders,
);

export const selectOrdersStatus = createSelector(
  [selectOrdersState],
  state => state.status,
);

export const selectOrdersError = createSelector(
  [selectOrdersState],
  state => state.error,
);

export const selectOrderStats = createSelector(
  [selectOrdersState],
  state => state.stats,
);

export const selectOrderStatsStatus = createSelector(
  [selectOrdersState],
  state => state.statsStatus,
);

export const selectOrderStatsError = createSelector(
  [selectOrdersState],
  state => state.statsError,
);

export const selectOrdersCurrentPage = createSelector(
  [selectOrdersState],
  state => state.currentPage,
);

export const selectOrdersTotalPages = createSelector(
  [selectOrdersState],
  state => state.totalPages,
);

export const selectOrdersFilterParams = createSelector(
  [selectOrdersState],
  state => state.filterParams,
);

// Additional composed selectors
export const selectOrdersWithStatus = createSelector(
  [selectOrders, selectOrdersStatus],
  (orders, status) => ({ orders, status }),
);

export const selectOrderStatsWithStatus = createSelector(
  [selectOrderStats, selectOrderStatsStatus],
  (stats, status) => ({ stats, status }),
);

// Actions
export const {
  setOrderStats,
  setStatsLoading,
  setStatsError,
  clearOrderStats,
  setFilterParams,
  clearFilters,
  resetOrderState,
} = ordersSlice.actions;

// Reducer
export default ordersSlice.reducer;
