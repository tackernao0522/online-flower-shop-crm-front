import { configureStore, Reducer } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import customersReducer, {
  CustomersState,
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from '../customersSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      customers: customersReducer as Reducer<CustomersState>,
    },
  });

type TestStore = ReturnType<typeof createTestStore>;
type AppDispatch = TestStore['dispatch'];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createMockAxiosError = (responseData: any) => {
  const error = new Error() as AxiosError;
  error.isAxiosError = true;
  error.response = {
    data: responseData,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  };
  return error;
};

describe('customersSlice', () => {
  let store: TestStore;
  let dispatch: AppDispatch;

  beforeEach(() => {
    store = createTestStore();
    dispatch = store.dispatch;
    localStorage.setItem('token', 'test-token');
    jest
      .spyOn(axios, 'isAxiosError')
      .mockImplementation(error => error?.isAxiosError ?? false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態が正しく設定される', () => {
    const state = store.getState().customers;
    expect(state).toEqual({
      customers: [],
      status: 'idle',
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    });
  });

  describe('fetchCustomers', () => {
    test('顧客データの取得が成功する', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            address: '123 Street',
            birthDate: '1990-01-01',
            created_at: '2023-01-01',
            updated_at: '2023-01-02',
          },
        ],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      await dispatch(fetchCustomers({ page: 1 }));
      const state = store.getState().customers;

      expect(state.status).toBe('succeeded');
      expect(state.customers).toEqual(mockResponse.data);
      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(1);
      expect(state.totalCount).toBe(1);
    });

    test('検索パラメータ付きで顧客データを取得できる', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            address: '123 Street',
            birthDate: '1990-01-01',
            created_at: '2023-01-01',
            updated_at: '2023-01-02',
          },
        ],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      await dispatch(fetchCustomers({ page: 1, search: 'John' }));

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { page: 1, search: 'John' },
        }),
      );
    });

    test('AxiosErrorでエラーハンドリングが正しく機能する', async () => {
      const error = createMockAxiosError('Customer not found');
      mockedAxios.get.mockRejectedValueOnce(error);

      await dispatch(fetchCustomers({ page: 1 }));
      const state = store.getState().customers;

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Customer not found');
    });

    test('未知のエラーが正しく処理される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unknown Error'));

      await dispatch(fetchCustomers({ page: 1 }));
      const state = store.getState().customers;

      expect(state.status).toBe('failed');
      expect(state.error).toBe('An unknown error occurred');
    });
  });

  describe('addCustomer', () => {
    test('新規顧客の追加が成功する', async () => {
      const newCustomer = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '123-456-7890',
        address: '123 Main St',
        birthDate: '1990-01-01',
      };
      const mockResponse = {
        id: '2',
        ...newCustomer,
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      await dispatch(addCustomer(newCustomer));
      const state = store.getState().customers;

      expect(state.customers).toContainEqual(mockResponse);
      expect(state.totalCount).toBe(1);
    });

    test('顧客追加時のAxiosErrorが正しく処理される', async () => {
      const error = createMockAxiosError('Validation failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      const result = await dispatch(
        addCustomer({
          name: 'Test',
          email: 'invalid-email',
          phoneNumber: '123',
          address: 'Test',
          birthDate: '2000-01-01',
        }),
      );

      expect(result.type).toBe('customers/addCustomer/rejected');
      expect(result.payload).toBe('Validation failed');
    });

    test('未知のエラーが正しく処理される', async () => {
      const unknownError = new Error('System error');
      mockedAxios.post.mockRejectedValueOnce(unknownError);

      const result = await dispatch(
        addCustomer({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '123-456-7890',
          address: 'Test Address',
          birthDate: '1990-01-01',
        }),
      );

      expect(result.type).toBe('customers/addCustomer/rejected');
      expect(result.payload).toBe('An unknown error occurred');
    });
  });

  describe('updateCustomer', () => {
    test('顧客情報の更新が成功する', async () => {
      const initialCustomer = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '123456789',
        address: 'Some Street',
        birthDate: '1990-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      };

      store.dispatch({
        type: 'customers/fetchCustomers/fulfilled',
        payload: {
          data: [initialCustomer],
          meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
        },
      });

      const updatedCustomer = {
        ...initialCustomer,
        name: 'John Updated',
        email: 'john.updated@example.com',
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedCustomer });

      await store.dispatch(
        updateCustomer({
          id: '1',
          customerData: {
            name: 'John Updated',
            email: 'john.updated@example.com',
          },
        }),
      );

      const state = store.getState().customers;
      expect(state.customers[0]).toEqual(updatedCustomer);
    });

    test('存在しない顧客IDの更新を試みた場合でも正しく処理される', async () => {
      const updatedCustomer = {
        id: '999',
        name: 'Non Existent',
        email: 'none@example.com',
        phoneNumber: '999999999',
        address: 'Nowhere',
        birthDate: '1990-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedCustomer });

      await store.dispatch(
        updateCustomer({
          id: '999',
          customerData: { name: 'Non Existent' },
        }),
      );

      const state = store.getState().customers;
      expect(state.customers.find(c => c.id === '999')).toBeUndefined();
    });

    test('顧客更新時のAxiosErrorが正しく処理される', async () => {
      const error = createMockAxiosError('Customer not found');
      mockedAxios.put.mockRejectedValueOnce(error);

      const result = await store.dispatch(
        updateCustomer({
          id: '999',
          customerData: { name: 'Non Existent' },
        }),
      );

      expect(result.type).toBe('customers/updateCustomer/rejected');
      expect(result.payload).toBe('Customer not found');
    });

    test('未知のエラーが正しく処理される', async () => {
      const unknownError = new Error('System error');
      mockedAxios.put.mockRejectedValueOnce(unknownError);

      const result = await dispatch(
        updateCustomer({
          id: '1',
          customerData: { name: 'Updated Name' },
        }),
      );

      expect(result.type).toBe('customers/updateCustomer/rejected');
      expect(result.payload).toBe('An unknown error occurred');
    });
  });

  describe('deleteCustomer', () => {
    test('顧客の削除が成功する', async () => {
      const initialCustomer = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '123456789',
        address: 'Some Street',
        birthDate: '1990-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      };

      store.dispatch({
        type: 'customers/fetchCustomers/fulfilled',
        payload: {
          data: [initialCustomer],
          meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
        },
      });

      mockedAxios.delete.mockResolvedValueOnce({});

      await store.dispatch(deleteCustomer('1'));
      const state = store.getState().customers;

      expect(state.customers).toHaveLength(0);
      expect(state.totalCount).toBe(0);
    });

    test('顧客削除時のエラーが正しく処理される', async () => {
      const error = createMockAxiosError('Customer has active orders');
      mockedAxios.delete.mockRejectedValueOnce(error);

      const result = await dispatch(deleteCustomer('1'));

      expect(result.type).toBe('customers/deleteCustomer/rejected');
      expect(result.payload).toBe('Customer has active orders');
    });

    test('未知のエラーが正しく処理される', async () => {
      const unknownError = new Error('System error');
      mockedAxios.delete.mockRejectedValueOnce(unknownError);

      const result = await dispatch(deleteCustomer('1'));

      expect(result.type).toBe('customers/deleteCustomer/rejected');
      expect(result.payload).toBe('An unknown error occurred');
    });

    test('レスポンスデータがないAxiosErrorが正しく処理される', async () => {
      const error = new Error() as AxiosError;
      error.isAxiosError = true;
      error.response = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
        data: undefined,
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await dispatch(fetchCustomers({ page: 1 }));
      const state = store.getState().customers;

      expect(state.status).toBe('failed');
      expect(state.error).toBe('An error occurred');
    });
  });

  describe('Reducers', () => {
    test('fetchCustomers.pending で状態が正しく更新される', () => {
      const action = { type: fetchCustomers.pending.type };
      const state = customersReducer(undefined, action);
      expect(state.status).toBe('loading');
    });

    test('fetchCustomers.fulfilled で状態が正しく更新される', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            address: '123 Street',
            birthDate: '1990-01-01',
            created_at: '2023-01-01',
            updated_at: '2023-01-02',
          },
        ],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
      };
      const action = {
        type: fetchCustomers.fulfilled.type,
        payload: mockResponse,
      };
      const state = customersReducer(undefined, action);

      expect(state.status).toBe('succeeded');
      expect(state.customers).toEqual(mockResponse.data);
      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(1);
      expect(state.totalCount).toBe(1);
    });

    test('fetchCustomers.rejected で状態が正しく更新される', () => {
      const action = {
        type: fetchCustomers.rejected.type,
        payload: 'Error message',
      };
      const state = customersReducer(undefined, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Error message');
    });

    test('fetchCustomers.rejected でpayloadがない場合も状態が正しく更新される', () => {
      const action = {
        type: fetchCustomers.rejected.type,
        payload: undefined,
      };
      const state = customersReducer(undefined, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('An unknown error occurred');
    });
  });
});
