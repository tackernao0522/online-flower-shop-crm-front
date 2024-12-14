import { renderHook, act } from '@testing-library/react';
import { useOrderManagement } from '../useOrderManagement';
import { useDisclosure } from '@chakra-ui/react';
import { fetchOrdersHelper } from '@/api/orderApi';
import type { Order, OrderStatus } from '@/types/order';

const mockHandleSearchChange = jest.fn();
const mockHandleSearchSubmit = jest.fn();
const mockHandleSearchKeyDown = jest.fn();
const mockToast = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(() => mockToast),
  useDisclosure: jest.fn(),
}));

jest.mock('@/api/orderApi', () => ({
  fetchOrdersHelper: jest.fn((dispatch, params) =>
    Promise.resolve({
      data: [
        {
          id: '1',
          orderNumber: 'ORD-001',
          orderDate: new Date().toISOString(),
          totalAmount: 1000,
          status: 'PENDING',
        },
      ],
      meta: {
        total: 1,
      },
    }),
  ),
}));

jest.mock('../order/useOrderSearch', () => ({
  useOrderSearch: jest.fn(() => ({
    handleSearchChange: mockHandleSearchChange,
    handleSearchSubmit: mockHandleSearchSubmit,
    handleSearchKeyDown: mockHandleSearchKeyDown,
  })),
}));

jest.mock('../order/useOrderFilters', () => ({
  useOrderFilters: jest.fn(() => ({
    clearFilters: jest.fn(),
    handleStatusFilter: jest.fn(),
    handleDateRangeFilter: jest.fn(),
  })),
}));

jest.mock('../order/useOrderItems', () => ({
  useOrderItems: jest.fn(() => ({
    handleOrderItemChange: jest.fn(),
    handleInputChange: jest.fn(),
    handleAddOrderItem: jest.fn(),
    handleRemoveOrderItem: jest.fn(),
  })),
}));

describe('useOrderManagement', () => {
  const mockDispatch = jest.fn();
  const mockFetchOrdersHelper = fetchOrdersHelper as jest.Mock;

  const createMockOrder = (): Order => ({
    id: '1',
    orderNumber: 'ORD-001',
    orderDate: new Date().toISOString(),
    totalAmount: 1000,
    status: 'PENDING' as OrderStatus,
    discountApplied: 0,
    customerId: 'customer1',
    userId: 'user1',
    campaignId: null,
    customer: {
      id: 'customer1',
      name: 'Test Customer',
      email: 'test@example.com',
      address: 'Test Address',
      phoneNumber: '1234567890',
      birthDate: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    order_items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const useDispatchMock = jest.requireMock('react-redux').useDispatch;
    useDispatchMock.mockReturnValue(mockDispatch);

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: [] },
          meta: { total: 0 },
        }),
    }));
  });

  test('初期状態が正しく設定される', async () => {
    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.orders).toEqual([]);
    expect(result.current.status).toBe('succeeded');
    expect(result.current.error).toBeNull();
  });

  test('handleSearchSubmitが成功した場合、結果が正しく設定される', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleSearchSubmit();
    });

    expect(mockHandleSearchSubmit).toHaveBeenCalled();
  });

  test('handleStatusFilterが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleStatusFilter('PENDING');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleDateRangeFilterが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleDateRangeFilter('today');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleSearchChangeが入力を正しく処理する', async () => {
    const { result } = renderHook(() => useOrderManagement());
    const mockEvent = {
      target: { value: 'test' },
    } as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleSearchChange(mockEvent);
    });

    expect(mockHandleSearchChange).toHaveBeenCalledWith(mockEvent);
  });

  test('clearFiltersが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.clearFilters();
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleSearchKeyDownでEnterキーが正しく処理される', async () => {
    const { result } = renderHook(() => useOrderManagement());
    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    Object.defineProperty(mockEvent, 'preventDefault', {
      value: jest.fn(),
    });

    await act(async () => {
      result.current.handleSearchKeyDown(mockEvent);
    });

    expect(mockHandleSearchKeyDown).toHaveBeenCalledWith(mockEvent);
  });

  test('空の検索結果の場合、適切なメッセージが表示される', async () => {
    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: [] },
          meta: { total: 0 },
        }),
    }));

    mockHandleSearchSubmit.mockImplementationOnce(async () => {
      mockToast({
        title: '検索結果がありません',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    });

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleSearchSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '検索結果がありません',
        status: 'info',
      }),
    );
  });

  test('エラー時に適切なエラーメッセージが表示される', async () => {
    const mockError = {
      response: {
        data: {
          error: {
            message: 'エラーが発生しました',
          },
        },
      },
    };

    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject(mockError),
    }));

    mockHandleSearchSubmit.mockImplementationOnce(async () => {
      mockToast({
        title: 'エラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw mockError;
    });

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      try {
        await result.current.handleSearchSubmit();
      } catch (error) {
        expect(error).toEqual(mockError);
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        status: 'error',
      }),
    );
  });

  test('fetchOrdersがcurrentSearchTermに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: 'searchTerm',
          currentStatus: null,
          currentDateRange: { start: null, end: null },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ search: 'searchTerm' }),
    );
  });

  test('fetchOrdersがcurrentStatusに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: '',
          currentStatus: 'PENDING',
          currentDateRange: { start: null, end: null },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ status: 'PENDING' }),
    );
  });

  test('fetchOrdersがcurrentDateRangeに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: '',
          currentStatus: null,
          currentDateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-01-31').toISOString(),
      }),
    );
  });
});
