import { handleStatusFilter, handleDateRangeFilter } from '../filterUtils';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { OrderStatus, DateRange } from '@/types/order';
import { UseToastOptions } from '@chakra-ui/react';
import { AppDispatch } from '@/store';

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

describe('フィルタリング機能', () => {
  interface MockResponse {
    data: {
      data: Array<{ id: number }>;
    };
    meta: {
      total: number;
    };
  }

  const mockResponse: MockResponse = {
    data: {
      data: Array(5).fill({ id: 1 }),
    },
    meta: {
      total: 5,
    },
  };

  interface MockOptions {
    dispatch: jest.MockedFunction<AppDispatch>;
    setIsSearching: jest.Mock<void, [boolean]>;
    setSearchTerm: jest.Mock<void, [string]>;
    setDateRange: jest.Mock<void, [DateRange]>;
    filterStateRef: { current: any };
    setOrders: jest.Mock<void, [any[]]>;
    setTotalCount: jest.Mock<void, [number]>;
    setHasMore: jest.Mock<void, [boolean]>;
    setPage: jest.Mock<void, [number]>;
    setStatusFilter: jest.Mock<void, [OrderStatus | null]>;
    toast: jest.Mock<void, [UseToastOptions]>;
    clearFilters: jest.Mock<Promise<void>, []>;
  }

  const mockDispatch = jest.fn(action => ({
    unwrap: () => Promise.resolve(mockResponse),
    type: 'TEST_ACTION',
  })) as unknown as jest.MockedFunction<AppDispatch>;

  const createMockOptions = (): MockOptions => ({
    dispatch: mockDispatch,
    setIsSearching: jest.fn(),
    setSearchTerm: jest.fn(),
    setDateRange: jest.fn(),
    filterStateRef: { current: {} },
    setOrders: jest.fn(),
    setTotalCount: jest.fn(),
    setHasMore: jest.fn(),
    setPage: jest.fn(),
    setStatusFilter: jest.fn(),
    toast: jest.fn(),
    clearFilters: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchOrders as unknown as jest.Mock).mockClear();
  });

  describe('handleStatusFilter', () => {
    it('ステータスフィルターが正常に適用される', async () => {
      const mockOptions = createMockOptions();

      await handleStatusFilter('pending' as OrderStatus, mockOptions);

      expect(mockOptions.setIsSearching).toHaveBeenNthCalledWith(1, true);
      expect(mockOptions.setSearchTerm).toHaveBeenCalledWith('');
      expect(mockOptions.setDateRange).toHaveBeenCalledWith({
        start: null,
        end: null,
      });
      expect(mockOptions.setStatusFilter).toHaveBeenCalledWith('pending');
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('フィルター適用時にエラーが発生した場合、適切なエラーハンドリングが行われる', async () => {
      const mockOptions = createMockOptions();
      const error = new Error('Network error');
      mockOptions.dispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject(error),
        type: 'TEST_ERROR_ACTION',
      }));

      await handleStatusFilter('pending' as OrderStatus, mockOptions);

      expect(mockOptions.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'フィルタリングに失敗しました',
          status: 'error',
        }),
      );
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });
  });

  describe('handleDateRangeFilter', () => {
    it('今日の日付範囲フィルターが正常に適用される', async () => {
      const mockOptions = createMockOptions();

      await handleDateRangeFilter('today', mockOptions);

      expect(mockOptions.setIsSearching).toHaveBeenNthCalledWith(1, true);
      expect(mockOptions.setSearchTerm).toHaveBeenCalledWith('');
      expect(mockOptions.setStatusFilter).toHaveBeenCalledWith(null);
      expect(mockOptions.setDateRange).toHaveBeenCalled();
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('今週の日付範囲フィルターが正常に適用される', async () => {
      const mockOptions = createMockOptions();

      await handleDateRangeFilter('week', mockOptions);

      expect(mockOptions.setIsSearching).toHaveBeenNthCalledWith(1, true);
      expect(mockOptions.setSearchTerm).toHaveBeenCalledWith('');
      expect(mockOptions.setStatusFilter).toHaveBeenCalledWith(null);
      expect(mockOptions.setDateRange).toHaveBeenCalled();
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('今月の日付範囲フィルターが正常に適用される', async () => {
      const mockOptions = createMockOptions();

      await handleDateRangeFilter('month', mockOptions);

      expect(mockOptions.setIsSearching).toHaveBeenNthCalledWith(1, true);
      expect(mockOptions.setSearchTerm).toHaveBeenCalledWith('');
      expect(mockOptions.setStatusFilter).toHaveBeenCalledWith(null);
      expect(mockOptions.setDateRange).toHaveBeenCalled();
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('カスタム日付範囲フィルターが正常に適用される', async () => {
      const mockOptions = createMockOptions();
      const customStart = new Date('2024-01-01');
      const customEnd = new Date('2024-01-31');

      await handleDateRangeFilter('custom', {
        ...mockOptions,
        customStart,
        customEnd,
      });

      expect(mockOptions.setIsSearching).toHaveBeenNthCalledWith(1, true);
      expect(mockOptions.setSearchTerm).toHaveBeenCalledWith('');
      expect(mockOptions.setStatusFilter).toHaveBeenCalledWith(null);
      expect(mockOptions.setDateRange).toHaveBeenCalled();
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('カスタム日付が未設定の場合、フィルターがクリアされる', async () => {
      const mockOptions = createMockOptions();

      await handleDateRangeFilter('custom', mockOptions);

      expect(mockOptions.clearFilters).toHaveBeenCalled();
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });

    it('日付範囲フィルター適用時にエラーが発生した場合、適切なエラーハンドリングが行われる', async () => {
      const mockOptions = createMockOptions();
      const error = new Error('Network error');
      mockOptions.dispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject(error),
        type: 'TEST_ERROR_ACTION',
      }));

      await handleDateRangeFilter('today', mockOptions);

      expect(mockOptions.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'フィルタリングに失敗しました',
          status: 'error',
        }),
      );
      expect(mockOptions.setIsSearching).toHaveBeenLastCalledWith(false);
    });
  });
});
