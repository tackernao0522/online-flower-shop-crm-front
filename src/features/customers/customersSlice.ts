import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface PurchaseHistory {
  id: string;
  date: string;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  created_at: string;
  updated_at: string;
  purchaseHistory?: PurchaseHistory[];
}

interface CustomersState {
  customers: Customer[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const initialState: CustomersState = {
  customers: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (
    { page, search }: { page: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { page, search },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (
    customerData: Omit<
      Customer,
      "id" | "created_at" | "updated_at" | "purchaseHistory"
    >,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers`,
        customerData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (
    { id, customerData }: { id: string; customerData: Partial<Customer> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers/${id}`,
        customerData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCustomers.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: Customer[];
            meta: {
              currentPage: number;
              totalPages: number;
              totalCount: number;
            };
          }>
        ) => {
          state.status = "succeeded";
          state.customers = action.payload.data;
          state.currentPage = action.payload.meta.currentPage;
          state.totalPages = action.payload.meta.totalPages;
          state.totalCount = action.payload.meta.totalCount;
        }
      )
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An error occurred";
      })
      .addCase(
        addCustomer.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          state.customers.push(action.payload);
          state.totalCount += 1;
        }
      )
      .addCase(
        updateCustomer.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          const index = state.customers.findIndex(
            (customer) => customer.id === action.payload.id
          );
          if (index !== -1) {
            state.customers[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteCustomer.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.customers = state.customers.filter(
            (customer) => customer.id !== action.payload
          );
          state.totalCount -= 1;
        }
      );
  },
});

export default customersSlice.reducer;
