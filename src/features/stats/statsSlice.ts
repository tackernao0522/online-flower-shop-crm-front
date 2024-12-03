import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';

export interface SalesStats {
  totalSales: number | null;
  changeRate: number | null;
  lastUpdatedAt?: string;
}

interface StatsState {
  totalSales: number | null;
  changeRate: number | null;
  lastUpdatedAt?: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StatsState = {
  totalSales: null,
  changeRate: null,
  lastUpdatedAt: undefined,
  status: 'idle',
  error: null,
};

// Async Thunk
export const fetchInitialStats = createAsyncThunk(
  'stats/fetchInitialStats',
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
      return response.data.stats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'エラーが発生しました');
      }
      return rejectWithValue('予期せぬエラーが発生しました');
    }
  },
);

// Slice
const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setSalesStats(state, action: PayloadAction<SalesStats>) {
      if (state.totalSales === null || state.changeRate === null) {
        state.totalSales = Number(action.payload.totalSales);
        state.changeRate = 0;
        state.lastUpdatedAt = new Date().toISOString();
        state.status = 'succeeded';
        state.error = null;
      } else {
        state.totalSales = Number(action.payload.totalSales);
        state.changeRate = action.payload.changeRate;
        state.lastUpdatedAt = new Date().toISOString();
        state.status = 'succeeded';
        state.error = null;
      }
    },
    setStatsLoading(state) {
      state.status = 'loading';
    },
    setStatsError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    clearStats(state) {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInitialStats.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchInitialStats.fulfilled, (state, action) => {
        if (action.payload) {
          if (state.totalSales === null || state.changeRate === null) {
            // 初回のデータ取得時
            state.totalSales = Number(action.payload.totalSales);
            state.changeRate = 0;
            state.lastUpdatedAt = new Date().toISOString();
            state.status = 'succeeded';
            state.error = null;
          } else {
            // 2回目以降の更新
            state.totalSales = Number(action.payload.totalSales);
            state.changeRate = Number(action.payload.salesChangeRate);
            state.lastUpdatedAt = new Date().toISOString();
            state.status = 'succeeded';
            state.error = null;
          }
        }
      })
      .addCase(fetchInitialStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setSalesStats, setStatsLoading, setStatsError, clearStats } =
  statsSlice.actions;

// Base selector
const selectStatsState = (state: RootState) => state.stats;

// Memoized selectors
export const selectSalesStats = createSelector([selectStatsState], stats => ({
  totalSales: stats.totalSales ?? 0,
  changeRate: stats.changeRate ?? 0,
  lastUpdatedAt: stats.lastUpdatedAt,
}));

export const selectSalesStatsStatus = createSelector(
  [selectStatsState],
  stats => stats.status,
);

export const selectSalesStatsError = createSelector(
  [selectStatsState],
  stats => stats.error,
);

// Additional memoized selectors for specific values if needed
export const selectTotalSales = createSelector(
  [selectStatsState],
  stats => stats.totalSales ?? 0,
);

export const selectChangeRate = createSelector(
  [selectStatsState],
  stats => stats.changeRate ?? 0,
);

export const selectLastUpdated = createSelector(
  [selectStatsState],
  stats => stats.lastUpdatedAt,
);

// Reducer
export default statsSlice.reducer;
