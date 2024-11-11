import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Order } from "@/types/order";

// State type
export interface OrdersState {
  orders: Order[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  totalCount: number;
  changeRate: number;
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  status: "idle",
  error: null,
  totalCount: 0,
  changeRate: 0,
};

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "An error occurred");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for fetching initial stats
export const fetchOrderStats = createAsyncThunk(
  "orders/fetchOrderStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: {
            page: 1,
            per_page: 1,
          },
        }
      );
      return response.data.stats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "An error occurred");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrderStats: {
      reducer: (
        state,
        action: PayloadAction<{ totalCount: number; changeRate: number }>
      ) => {
        console.log("Reducer executing with payload:", action.payload);
        console.log("Previous state:", { ...state });
        state.totalCount = action.payload.totalCount;
        state.changeRate = action.payload.changeRate;
        console.log("Updated state:", { ...state });
      },
      prepare: (payload: { totalCount: number; changeRate: number }) => {
        console.log("Action preparation:", payload);
        return { payload };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload.data;
        if (action.payload.stats) {
          state.totalCount = action.payload.stats.totalCount;
          state.changeRate = action.payload.stats.changeRate;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "An unknown error occurred";
      })
      .addCase(fetchOrderStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          console.log("Updating state with stats:", action.payload);
          state.totalCount = action.payload.totalCount;
          state.changeRate = action.payload.changeRate;
        }
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "An unknown error occurred";
      });
  },
});

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders;
export const selectOrderStats = (state: { orders: OrdersState }) => ({
  totalCount: state.orders.totalCount,
  changeRate: state.orders.changeRate,
});

// Actions
export const { setOrderStats } = ordersSlice.actions;

// Reducer
export default ordersSlice.reducer;
