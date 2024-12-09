import { fetchOrdersHelper } from '../orderApi';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { AppDispatch } from '@/store';

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

describe('注文API', () => {
  const mockOrderData = {
    data: {
      data: [
        {
          id: '1',
          customer_name: 'テスト顧客',
          total_amount: 1000,
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    },
    meta: {
      total: 1,
    },
  };

  const mockDispatch = jest.fn(() => ({
    unwrap: () => Promise.resolve(mockOrderData),
  })) as unknown as AppDispatch;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchOrders as unknown as jest.Mock).mockReturnValue({
      type: 'orders/fetchOrders',
      payload: mockOrderData,
    });
  });

  it('注文データを正しく取得できる', async () => {
    const params = {
      page: 1,
      per_page: 10,
    };

    const result = await fetchOrdersHelper(mockDispatch, params);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(fetchOrders).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      data: mockOrderData.data.data,
      meta: mockOrderData.meta,
    });
  });

  it('検索パラメータ付きで注文データを取得できる', async () => {
    const params = {
      page: 1,
      per_page: 10,
      search: 'テスト',
    };

    await fetchOrdersHelper(mockDispatch, params);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(fetchOrders).toHaveBeenCalledWith(params);
  });

  it('ステータスフィルター付きで注文データを取得できる', async () => {
    const params = {
      page: 1,
      per_page: 10,
      status: 'pending',
    };

    await fetchOrdersHelper(mockDispatch, params);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(fetchOrders).toHaveBeenCalledWith(params);
  });

  it('日付範囲フィルター付きで注文データを取得できる', async () => {
    const params = {
      page: 1,
      per_page: 10,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    };

    await fetchOrdersHelper(mockDispatch, params);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(fetchOrders).toHaveBeenCalledWith(params);
  });

  it('レスポンスデータが正しい形式に整形される', async () => {
    const params = {
      page: 1,
      per_page: 10,
    };

    const result = await fetchOrdersHelper(mockDispatch, params);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.data).toEqual(mockOrderData.data.data);
    expect(result.meta).toEqual(mockOrderData.meta);
  });

  it('取得した注文データに必要なプロパティが含まれている', async () => {
    const params = {
      page: 1,
      per_page: 10,
    };

    const result = await fetchOrdersHelper(mockDispatch, params);

    expect(result.data[0]).toHaveProperty('id');
    expect(result.data[0]).toHaveProperty('customer_name');
    expect(result.data[0]).toHaveProperty('total_amount');
    expect(result.data[0]).toHaveProperty('status');
    expect(result.data[0]).toHaveProperty('created_at');
  });
});
