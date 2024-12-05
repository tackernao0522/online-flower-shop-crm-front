import { AxiosError } from 'axios';
import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import type { DateRange, OrderStatus } from '@/types/order';
import type { ApiErrorResponse } from '@/types/api';
import { startOfDay, endOfDay } from 'date-fns';
import type { UseToastOptions } from '@chakra-ui/react';

export const handleStatusFilter = async (
  status: OrderStatus,
  options: {
    dispatch: AppDispatch;
    setIsSearching: (value: boolean) => void;
    setSearchTerm: (value: string) => void;
    setDateRange: (value: DateRange) => void;
    filterStateRef: React.MutableRefObject<any>;
    setOrders: (orders: any[]) => void;
    setTotalCount: (count: number) => void;
    setHasMore: (hasMore: boolean) => void;
    setPage: (page: number) => void;
    setStatusFilter: (status: OrderStatus | null) => void;
    toast: (options: UseToastOptions) => void;
  },
): Promise<void> => {
  const {
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
  } = options;

  try {
    setIsSearching(true);

    setSearchTerm('');
    setDateRange({ start: null, end: null });

    filterStateRef.current = {
      currentStatus: status,
      currentSearchTerm: '',
      currentDateRange: { start: null, end: null },
    };

    const response = await dispatch(
      fetchOrdersAction({
        page: 1,
        per_page: 15,
        status,
      }),
    ).unwrap();

    setOrders(response.data.data);
    setTotalCount(response.meta.total);
    setHasMore(response.data.data.length === 15);
    setPage(1);
    setStatusFilter(status);
  } catch (error) {
    console.error('Status filtering error:', error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    toast({
      title: 'フィルタリングに失敗しました',
      description: axiosError.response?.data?.error?.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsSearching(false);
  }
};

export const handleDateRangeFilter = async (
  range: 'today' | 'week' | 'month' | 'custom',
  options: {
    dispatch: AppDispatch;
    setIsSearching: (value: boolean) => void;
    setSearchTerm: (value: string) => void;
    setStatusFilter: (value: OrderStatus | null) => void;
    setDateRange: (value: DateRange) => void;
    filterStateRef: React.MutableRefObject<any>;
    setOrders: (orders: any[]) => void;
    setTotalCount: (count: number) => void;
    setHasMore: (hasMore: boolean) => void;
    setPage: (page: number) => void;
    clearFilters: () => Promise<void>;
    toast: (options: UseToastOptions) => void;
    customStart?: Date | null;
    customEnd?: Date | null;
  },
): Promise<void> => {
  const {
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
  } = options;

  try {
    setIsSearching(true);

    if (range === 'custom' && (!customStart || !customEnd)) {
      await clearFilters();
      return;
    }

    setSearchTerm('');
    setStatusFilter(null);

    const today = new Date();
    let start: Date;
    let end: Date;

    switch (range) {
      case 'today':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'week':
        const dayOfWeek = today.getDay();
        start = startOfDay(
          new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000),
        );
        end = endOfDay(new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        start = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
        end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case 'custom':
        start = startOfDay(customStart!);
        end = endOfDay(customEnd!);
        break;
      default:
        return;
    }

    const newDateRange = { start, end };
    setDateRange(newDateRange);

    filterStateRef.current = {
      currentStatus: null,
      currentSearchTerm: '',
      currentDateRange: newDateRange,
    };

    const response = await dispatch(
      fetchOrdersAction({
        page: 1,
        per_page: 15,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      }),
    ).unwrap();

    setOrders(response.data.data);
    setTotalCount(response.meta.total);
    setHasMore(response.data.data.length === 15);
    setPage(1);
  } catch (error) {
    console.error('Date range filter error:', error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    toast({
      title: 'フィルタリングに失敗しました',
      description:
        axiosError.response?.data?.error?.message ||
        '期間フィルターの適用中にエラーが発生しました',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsSearching(false);
  }
};
