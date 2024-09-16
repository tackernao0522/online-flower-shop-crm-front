import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import customersReducer, {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../customersSlice.ts";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("customersSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        customers: customersReducer,
      },
    });
    localStorage.setItem("token", "test-token");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("初期状態が正しく設定される", () => {
    const state = store.getState().customers;
    expect(state).toEqual({
      customers: [],
      status: "idle",
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    });
  });

  test("fetchCustomers: 顧客データの取得が成功する", async () => {
    const mockResponse = {
      data: [{ id: "1", name: "John Doe" }],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    await store.dispatch(fetchCustomers({ page: 1 }));
    const state = store.getState().customers;

    expect(state.status).toBe("succeeded");
    expect(state.customers).toEqual(mockResponse.data);
    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(1);
    expect(state.totalCount).toBe(1);
  });

  test("addCustomer: 新規顧客の追加が成功する", async () => {
    const newCustomer = { name: "Jane Doe", email: "jane@example.com" };
    const mockResponse = { id: "2", ...newCustomer };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    await store.dispatch(addCustomer(newCustomer));
    const state = store.getState().customers;

    expect(state.customers).toContainEqual(mockResponse);
    expect(state.totalCount).toBe(1);
  });

  test("updateCustomer: 顧客情報の更新が成功する", async () => {
    const initialCustomer = { id: "1", name: "John Doe" };
    store = configureStore({
      reducer: {
        customers: customersReducer,
      },
      preloadedState: {
        customers: {
          customers: [initialCustomer],
          status: "idle",
          error: null,
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      },
    });

    const updatedCustomer = { id: "1", name: "John Updated" };
    mockedAxios.put.mockResolvedValueOnce({ data: updatedCustomer });

    await store.dispatch(
      updateCustomer({ id: "1", customerData: { name: "John Updated" } })
    );
    const state = store.getState().customers;

    expect(state.customers[0]).toEqual(updatedCustomer);
  });

  test("deleteCustomer: 顧客の削除が成功する", async () => {
    const initialCustomer = { id: "1", name: "John Doe" };
    store = configureStore({
      reducer: {
        customers: customersReducer,
      },
      preloadedState: {
        customers: {
          customers: [initialCustomer],
          status: "idle",
          error: null,
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      },
    });

    mockedAxios.delete.mockResolvedValueOnce({});

    await store.dispatch(deleteCustomer("1"));
    const state = store.getState().customers;

    expect(state.customers).toHaveLength(0);
    expect(state.totalCount).toBe(0);
  });

  test("fetchCustomers: エラーハンドリングが正しく機能する", async () => {
    const errorMessage = "Network Error";
    mockedAxios.get.mockRejectedValueOnce({ response: { data: errorMessage } });

    await store.dispatch(fetchCustomers({ page: 1 }));
    const state = store.getState().customers;

    expect(state.status).toBe("failed");
    expect(state.error).toBe("Rejected");
  });

  test("Reducer: fetchCustomers.fulfilled で状態が正しく更新される", () => {
    const initialState = {
      customers: [],
      status: "idle",
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    };
    const mockResponse = {
      data: [{ id: "1", name: "John Doe" }],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
    };
    const action = {
      type: fetchCustomers.fulfilled.type,
      payload: mockResponse,
    };
    const state = customersReducer(initialState, action);

    expect(state.status).toBe("succeeded");
    expect(state.customers).toEqual(mockResponse.data);
    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(1);
    expect(state.totalCount).toBe(1);
  });
});
