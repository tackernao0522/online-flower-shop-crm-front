import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import type { ApiErrorResponse } from '@/types/api';
import type { OrderStatus, DateRange } from '@/types/order';
import { AxiosError } from 'axios';

interface FilterState {
  currentStatus: OrderStatus | null;
  currentSearchTerm: string;
  currentDateRange: DateRange;
}

type SearchProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: OrderStatus | null) => void;
  setDateRange: (range: DateRange) => void;
  setPage: (page: number) => void;
  setOrders: (orders: any[]) => void;
  setTotalCount: (count: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearFilters: () => Promise<void>;
  filterStateRef: React.MutableRefObject<FilterState>;
};

export const useOrderSearch = ({
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  setDateRange,
  setPage,
  setOrders,
  setTotalCount,
  setHasMore,
  setIsSearching,
  clearFilters,
  filterStateRef,
}: SearchProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setSearchTerm(value);
      if (!value) {
        void clearFilters();
      }
    },
    [clearFilters, setSearchTerm],
  );

  const handleSearchSubmit = useCallback(async (): Promise<void> => {
    try {
      setIsSearching(true);
      setPage(1);

      // 他のフィルターをクリア
      setStatusFilter(null);
      setDateRange({ start: null, end: null });

      // 検索のみの状態を設定
      filterStateRef.current = {
        currentStatus: null,
        currentSearchTerm: searchTerm,
        currentDateRange: { start: null, end: null },
      };

      const response = await dispatch(
        fetchOrdersAction({
          page: 1,
          per_page: 15,
          search: searchTerm,
        }),
      ).unwrap();

      setOrders(response.data.data);
      setTotalCount(response.meta.total);
      setHasMore(response.data.data.length === 15);

      if (response.data.data.length === 0) {
        toast({
          title: '検索結果がありません',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Search operation failed:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast({
        title: 'エラーが発生しました',
        description:
          axiosError.response?.data?.error?.message ||
          '検索中にエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  }, [
    dispatch,
    searchTerm,
    toast,
    setIsSearching,
    setPage,
    setStatusFilter,
    setDateRange,
    setOrders,
    setTotalCount,
    setHasMore,
    filterStateRef,
  ]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  return {
    handleSearchChange,
    handleSearchSubmit,
    handleSearchKeyDown,
  };
};
