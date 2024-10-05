import { configureStore, Reducer } from "@reduxjs/toolkit";
import axios from "axios";
import customersReducer, {
  CustomersState,
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../customersSlice";

// storeの型を定義
const createTestStore = () =>
  configureStore({
    reducer: {
      customers: customersReducer as Reducer<CustomersState>,
    },
  });

type TestStore = ReturnType<typeof createTestStore>;
type RootState = ReturnType<TestStore["getState"]>;
type AppDispatch = TestStore["dispatch"];

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("customersSlice", () => {
  let store: TestStore;
  let dispatch: AppDispatch;

  beforeEach(() => {
    store = createTestStore();
    dispatch = store.dispatch;
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
      data: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phoneNumber: "123456789",
          address: "123 Street",
          birthDate: "1990-01-01",
          created_at: "2023-01-01",
          updated_at: "2023-01-02",
        },
      ],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    await dispatch(fetchCustomers({ page: 1 }));
    const state = store.getState().customers;

    expect(state.status).toBe("succeeded");
    expect(state.customers).toEqual(mockResponse.data);
    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(1);
    expect(state.totalCount).toBe(1);
  });

  test("addCustomer: 新規顧客の追加が成功する", async () => {
    const newCustomer = {
      name: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "123-456-7890",
      address: "123 Main St",
      birthDate: "1990-01-01",
    };
    const mockResponse = {
      id: "2",
      ...newCustomer,
      created_at: "2023-01-01",
      updated_at: "2023-01-02",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    await dispatch(addCustomer(newCustomer));
    const state = store.getState().customers;

    expect(state.customers).toContainEqual(mockResponse);
    expect(state.totalCount).toBe(1);
  });

  test("updateCustomer: 顧客情報の更新が成功する", async () => {
    const initialCustomer = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "123456789",
      address: "Some Street",
      birthDate: "1990-01-01",
      created_at: "2023-01-01",
      updated_at: "2023-01-02",
    };

    store = createTestStore();
    store.dispatch({
      type: "customers/fetchCustomers/fulfilled",
      payload: {
        data: [initialCustomer],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
      },
    });

    const updatedCustomer = {
      id: "1",
      name: "John Updated",
      email: "john.updated@example.com",
      phoneNumber: "987654321",
      address: "New Street",
      birthDate: "1990-01-01",
      created_at: "2023-01-01",
      updated_at: "2023-02-01",
    };

    mockedAxios.put.mockResolvedValueOnce({ data: updatedCustomer });

    await store.dispatch(
      updateCustomer({
        id: "1",
        customerData: {
          name: "John Updated",
          email: "john.updated@example.com",
          phoneNumber: "987654321",
          address: "New Street",
        },
      })
    );

    const state = store.getState().customers;

    expect(state.customers[0]).toEqual(updatedCustomer);
  });

  test("deleteCustomer: 顧客の削除が成功する", async () => {
    const initialCustomer = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "123456789",
      address: "Some Street",
      birthDate: "1990-01-01",
      created_at: "2023-01-01",
      updated_at: "2023-01-02",
    };

    store = createTestStore();
    store.dispatch({
      type: "customers/fetchCustomers/fulfilled",
      payload: {
        data: [initialCustomer],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
      },
    });

    mockedAxios.delete.mockResolvedValueOnce({});

    await store.dispatch(deleteCustomer("1"));
    const state = store.getState().customers;

    expect(state.customers).toHaveLength(0);
    expect(state.totalCount).toBe(0);
  });

  test("fetchCustomers: エラーハンドリングが正しく機能する", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    await dispatch(fetchCustomers({ page: 1 }));
    const state = store.getState().customers;

    expect(state.status).toBe("failed");
    expect(state.error).toBe("An unknown error occurred");
  });

  test("Reducer: fetchCustomers.fulfilled で状態が正しく更新される", () => {
    const initialState: CustomersState = {
      customers: [],
      status: "idle",
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    };
    const mockResponse = {
      data: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phoneNumber: "123456789",
          address: "123 Street",
          birthDate: "1990-01-01",
          created_at: "2023-01-01",
          updated_at: "2023-01-02",
        },
      ],
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
