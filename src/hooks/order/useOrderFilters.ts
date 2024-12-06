import { useToast } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import { handleDateRangeFilter, handleStatusFilter } from '@/utils/filterUtils';
import type { Order, OrderStatus, DateRange } from '@/types/order';
import type { ApiErrorResponse } from '@/types/api';
import { AxiosError } from 'axios';

interface FilterState {
  currentStatus: OrderStatus | null;
  currentSearchTerm: string;
  currentDateRange: DateRange;
}

interface OrderFiltersProps {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  setTotalCount: (count: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  filterStateRef: React.MutableRefObject<FilterState>;
  setIsSearching: (isSearching: boolean) => void;
  setStatusFilter: (status: OrderStatus | null) => void;
  setDateRange: (dateRange: DateRange) => void;
  setSearchTerm: (searchTerm: string) => void;
}

export const useOrderFilters = ({
  orders,
  setOrders,
  setTotalCount,
  setHasMore,
  setPage,
  filterStateRef,
  setIsSearching,
  setStatusFilter,
  setDateRange,
  setSearchTerm,
}: OrderFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const clearFilters = async (): Promise<void> => {
    try {
      setIsSearching(true);

      filterStateRef.current = {
        currentStatus: null,
        currentSearchTerm: '',
        currentDateRange: { start: null, end: null },
      };

      setSearchTerm('');
      setStatusFilter(null);
      setDateRange({ start: null, end: null });
      setPage(1);

      const response = await dispatch(
        fetchOrdersAction({
          page: 1,
          per_page: 15,
        }),
      ).unwrap();

      setOrders(response.data.data);
      setTotalCount(response.meta.total);
      setHasMore(response.data.data.length === 15);
    } catch (error) {
      console.error('Clear filters error:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast({
        title: 'フィルターのクリアに失敗しました',
        description: axiosError.response?.data?.error?.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleStatusFilterWrapper = async (
    status: OrderStatus,
  ): Promise<void> => {
    await handleStatusFilter(status, {
      dispatch,
      setIsSearching,
      setSearchTerm,
      setDateRange,
      filterStateRef,
      setOrders,
      setTotalCount,
      setHasMore,
      setPage,
      setStatusFilter,
      toast,
    });
  };

  const handleDateRangeFilterWrapper = async (
    range: 'today' | 'week' | 'month' | 'custom',
    customStart?: Date | null,
    customEnd?: Date | null,
  ): Promise<void> => {
    await handleDateRangeFilter(range, {
      dispatch,
      setIsSearching,
      setSearchTerm,
      setStatusFilter,
      setDateRange,
      filterStateRef,
      setOrders,
      setTotalCount,
      setHasMore,
      setPage,
      clearFilters,
      toast,
      customStart,
      customEnd,
    });
  };

  return {
    clearFilters,
    handleStatusFilter: handleStatusFilterWrapper,
    handleDateRangeFilter: handleDateRangeFilterWrapper,
  };
};
