import { renderHook } from '@testing-library/react';
import { useOrderSearch } from '../useOrderSearch';
import { useToast } from '@chakra-ui/react';
import { fetchOrders } from '@/features/orders/ordersSlice';
import type { OrderStatus } from '@/types/order';

// モックの設定
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

const mockDispatch = jest.fn();

describe('useOrderSearch', () => {
  // 共通のモック変数
  const mockToast = jest.fn();
  const mockSetSearchTerm = jest.fn();
  const mockSetStatusFilter = jest.fn();
  const mockSetDateRange = jest.fn();
  const mockSetPage = jest.fn();
  const mockSetOrders = jest.fn();
  const mockSetTotalCount = jest.fn();
  const mockSetHasMore = jest.fn();
  const mockSetIsSearching = jest.fn();
  const mockClearFilters = jest.fn();

  const mockFilterStateRef = {
    current: {
      currentStatus: null as OrderStatus | null,
      currentSearchTerm: '',
      currentDateRange: { start: null, end: null },
    },
  };

  // 基本のprops
  const defaultProps = {
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    setStatusFilter: mockSetStatusFilter,
    setDateRange: mockSetDateRange,
    setPage: mockSetPage,
    setOrders: mockSetOrders,
    setTotalCount: mockSetTotalCount,
    setHasMore: mockSetHasMore,
    setIsSearching: mockSetIsSearching,
    clearFilters: mockClearFilters,
    filterStateRef: mockFilterStateRef,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  describe('handleSearchChange', () => {
    test('検索欄の値が変更された場合、正しく状態が更新される', () => {
      const { result } = renderHook(() => useOrderSearch(defaultProps));
      const event = {
        target: { value: 'test search' },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleSearchChange(event);
      expect(mockSetSearchTerm).toHaveBeenCalledWith('test search');
    });

    test('検索欄が空になった場合、フィルターがクリアされる', () => {
      const { result } = renderHook(() => useOrderSearch(defaultProps));
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleSearchChange(event);
      expect(mockClearFilters).toHaveBeenCalled();
    });
  });

  describe('handleSearchSubmit', () => {
    test('検索実行時に正しく状態が更新される', async () => {
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: { data: [] },
            meta: { total: 0 },
          }),
      }));

      const { result } = renderHook(() =>
        useOrderSearch({
          ...defaultProps,
          searchTerm: 'test',
        }),
      );

      await result.current.handleSearchSubmit();

      expect(mockSetIsSearching).toHaveBeenCalledWith(true);
      expect(mockSetPage).toHaveBeenCalledWith(1);
      expect(mockSetStatusFilter).toHaveBeenCalledWith(null);
      expect(mockSetDateRange).toHaveBeenCalledWith({ start: null, end: null });
      expect(mockSetIsSearching).toHaveBeenCalledWith(false);
    });

    test('検索結果が空の場合、適切なトーストメッセージが表示される', async () => {
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: { data: [] },
            meta: { total: 0 },
          }),
      }));

      const { result } = renderHook(() =>
        useOrderSearch({
          ...defaultProps,
          searchTerm: 'nonexistent',
        }),
      );

      await result.current.handleSearchSubmit();

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '検索結果がありません',
          status: 'info',
        }),
      );
    });

    test('検索でエラーが発生した場合、エラートーストが表示される', async () => {
      mockDispatch.mockImplementation(() => ({
        unwrap: () => Promise.reject(new Error('API Error')),
      }));

      const { result } = renderHook(() =>
        useOrderSearch({
          ...defaultProps,
          searchTerm: 'test',
        }),
      );

      await result.current.handleSearchSubmit();

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'エラーが発生しました',
          status: 'error',
        }),
      );
    });

    test('検索結果がある場合、ページネーション情報が正しく更新される', async () => {
      const mockResponse = {
        data: {
          data: Array(15).fill({ id: 1, name: 'Test Order' }),
        },
        meta: {
          total: 30,
        },
      };

      mockDispatch.mockImplementation(() => ({
        unwrap: () => Promise.resolve(mockResponse),
      }));

      const { result } = renderHook(() =>
        useOrderSearch({
          ...defaultProps,
          searchTerm: 'test',
        }),
      );

      await result.current.handleSearchSubmit();

      expect(mockSetOrders).toHaveBeenCalledWith(mockResponse.data.data);
      expect(mockSetTotalCount).toHaveBeenCalledWith(30);
      expect(mockSetHasMore).toHaveBeenCalledWith(true);
    });
  });

  describe('handleSearchKeyDown', () => {
    beforeEach(() => {
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: { data: [] },
            meta: { total: 0 },
          }),
      }));
    });

    test('Enterキーが押された場合、検索が実行される', () => {
      const { result } = renderHook(() => useOrderSearch(defaultProps));
      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      result.current.handleSearchKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('Enter以外のキーが押された場合、検索は実行されない', () => {
      const { result } = renderHook(() => useOrderSearch(defaultProps));
      const event = {
        key: 'Space',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      result.current.handleSearchKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
