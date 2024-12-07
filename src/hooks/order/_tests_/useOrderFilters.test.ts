import { renderHook, act } from '@testing-library/react';
import { useOrderFilters } from '../useOrderFilters';
import { useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { handleDateRangeFilter, handleStatusFilter } from '@/utils/filterUtils';
import type { Order } from '@/types/order';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

jest.mock('@/utils/filterUtils', () => ({
  handleDateRangeFilter: jest.fn(),
  handleStatusFilter: jest.fn(),
}));

describe('useOrderFilters フック', () => {
  let mockDispatch: jest.Mock;
  let mockToast: jest.Mock;
  let mockSetOrders: jest.Mock;
  let mockSetTotalCount: jest.Mock;
  let mockSetHasMore: jest.Mock;
  let mockSetPage: jest.Mock;
  let mockSetIsSearching: jest.Mock;
  let mockSetStatusFilter: jest.Mock;
  let mockSetDateRange: jest.Mock;
  let mockSetSearchTerm: jest.Mock;
  let mockFilterStateRef: React.MutableRefObject<any>;

  beforeEach(() => {
    mockDispatch = jest.fn(action => {
      if (typeof action === 'function') {
        return action(mockDispatch);
      }
      return action;
    });
    mockToast = jest.fn();
    mockSetOrders = jest.fn();
    mockSetTotalCount = jest.fn();
    mockSetHasMore = jest.fn();
    mockSetPage = jest.fn();
    mockSetIsSearching = jest.fn();
    mockSetStatusFilter = jest.fn();
    mockSetDateRange = jest.fn();
    mockSetSearchTerm = jest.fn();
    mockFilterStateRef = {
      current: {
        currentStatus: null,
        currentSearchTerm: '',
        currentDateRange: { start: null, end: null },
      },
    };

    // 型の問題を解消するために unknown を使う
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useToast as unknown as jest.Mock).mockReturnValue(mockToast);

    jest.clearAllMocks();
  });

  test('初期化時に必要な関数が返される', () => {
    const { result } = renderHook(() =>
      useOrderFilters({
        orders: [],
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setHasMore: mockSetHasMore,
        setPage: mockSetPage,
        filterStateRef: mockFilterStateRef,
        setIsSearching: mockSetIsSearching,
        setStatusFilter: mockSetStatusFilter,
        setDateRange: mockSetDateRange,
        setSearchTerm: mockSetSearchTerm,
      }),
    );

    expect(result.current).toHaveProperty('clearFilters');
    expect(result.current).toHaveProperty('handleStatusFilter');
    expect(result.current).toHaveProperty('handleDateRangeFilter');
  });

  test('clearFilters が正しく動作する', async () => {
    const mockOrders: Order[] = [
      {
        id: '1',
        customerId: 'customer1',
        userId: 'user1',
        status: 'PENDING',
        orderItems: [],
        totalAmount: 1000,
        orderNumber: '123',
        orderDate: '2024-01-01',
        discountApplied: 0,
        campaignId: 'campaign1',
        customer: {
          id: 'customer1',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '1234567890',
          address: '123 Test St',
          birthDate: '1990-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        order_items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
      },
    ];

    (fetchOrders as unknown as jest.Mock).mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        data: { data: mockOrders },
        meta: { total: 1 },
      }),
    });

    const { result } = renderHook(() =>
      useOrderFilters({
        orders: [],
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setHasMore: mockSetHasMore,
        setPage: mockSetPage,
        filterStateRef: mockFilterStateRef,
        setIsSearching: mockSetIsSearching,
        setStatusFilter: mockSetStatusFilter,
        setDateRange: mockSetDateRange,
        setSearchTerm: mockSetSearchTerm,
      }),
    );

    await act(async () => {
      await result.current.clearFilters();
    });

    expect(mockSetIsSearching).toHaveBeenCalledWith(true);
    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
    expect(mockSetStatusFilter).toHaveBeenCalledWith(null);
    expect(mockSetDateRange).toHaveBeenCalledWith({ start: null, end: null });
    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect(mockSetOrders).toHaveBeenCalledWith(mockOrders);
    expect(mockSetTotalCount).toHaveBeenCalledWith(1);
    expect(mockSetHasMore).toHaveBeenCalledWith(false);
  });

  test('handleStatusFilter が正しく動作する', async () => {
    const { result } = renderHook(() =>
      useOrderFilters({
        orders: [],
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setHasMore: mockSetHasMore,
        setPage: mockSetPage,
        filterStateRef: mockFilterStateRef,
        setIsSearching: mockSetIsSearching,
        setStatusFilter: mockSetStatusFilter,
        setDateRange: mockSetDateRange,
        setSearchTerm: mockSetSearchTerm,
      }),
    );

    await act(async () => {
      await result.current.handleStatusFilter('PENDING');
    });

    expect(handleStatusFilter).toHaveBeenCalledWith('PENDING', {
      dispatch: mockDispatch,
      setIsSearching: mockSetIsSearching,
      setSearchTerm: mockSetSearchTerm,
      setDateRange: mockSetDateRange,
      filterStateRef: mockFilterStateRef,
      setOrders: mockSetOrders,
      setTotalCount: mockSetTotalCount,
      setHasMore: mockSetHasMore,
      setPage: mockSetPage,
      setStatusFilter: mockSetStatusFilter,
      toast: mockToast,
    });
  });

  test('handleDateRangeFilter が正しく動作する', async () => {
    const { result } = renderHook(() =>
      useOrderFilters({
        orders: [],
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setHasMore: mockSetHasMore,
        setPage: mockSetPage,
        filterStateRef: mockFilterStateRef,
        setIsSearching: mockSetIsSearching,
        setStatusFilter: mockSetStatusFilter,
        setDateRange: mockSetDateRange,
        setSearchTerm: mockSetSearchTerm,
      }),
    );

    await act(async () => {
      await result.current.handleDateRangeFilter('today');
    });

    expect(handleDateRangeFilter).toHaveBeenCalledWith('today', {
      dispatch: mockDispatch,
      setIsSearching: mockSetIsSearching,
      setSearchTerm: mockSetSearchTerm,
      setStatusFilter: mockSetStatusFilter,
      setDateRange: mockSetDateRange,
      filterStateRef: mockFilterStateRef,
      setOrders: mockSetOrders,
      setTotalCount: mockSetTotalCount,
      setHasMore: mockSetHasMore,
      setPage: mockSetPage,
      clearFilters: result.current.clearFilters,
      toast: mockToast,
      customStart: undefined,
      customEnd: undefined,
    });
  });
});
