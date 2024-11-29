import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast, useDisclosure } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchOrders as fetchOrdersAction,
  setFilterParams,
} from '@/features/orders/ordersSlice';
import type {
  Order,
  OrderStatus,
  OrderForm,
  OrderFormItem,
  DateRange,
  FormErrors,
} from '@/types/order';
import type { ApiErrorResponse } from '@/types/api';
import { startOfDay, endOfDay } from 'date-fns';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

type OrderItemField = keyof OrderFormItem;

interface FilterState {
  currentStatus: OrderStatus | null;
  currentSearchTerm: string;
  currentDateRange: DateRange;
}

interface OrderParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export const useOrderManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  // Local State
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'succeeded' | 'failed'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'add' | 'edit'>(
    'detail',
  );
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newOrder, setNewOrder] = useState<OrderForm>({
    customerId: '',
    orderItems: [],
    status: 'PENDING',
  });

  const filterStateRef = useRef<FilterState>({
    currentStatus: null,
    currentSearchTerm: '',
    currentDateRange: { start: null, end: null },
  });

  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const onClose = useCallback(() => {
    originalOnClose();
    setTimeout(() => {
      setActiveOrder(null);
      setModalMode('detail');
      setNewOrder({
        customerId: '',
        orderItems: [],
        status: 'PENDING',
      });
      setFormErrors({});
    }, 300);
  }, [originalOnClose]);

  const fetchOrders = useCallback(
    async (pageNum: number = page) => {
      try {
        setStatus('loading');
        const params: OrderParams = {
          page: pageNum,
          per_page: 15,
          search: filterStateRef.current.currentSearchTerm || undefined,
          status: filterStateRef.current.currentStatus || undefined,
          start_date:
            filterStateRef.current.currentDateRange.start?.toISOString() ||
            undefined,
          end_date:
            filterStateRef.current.currentDateRange.end?.toISOString() ||
            undefined,
        };

        const response = await dispatch(fetchOrdersAction(params)).unwrap();

        if (pageNum === 1) {
          setOrders(response.data.data);
        } else {
          setOrders(prev => [...prev, ...response.data.data]);
        }

        setHasMore(response.data.data.length === 15);
        setTotalCount(response.meta.total);
        setPage(pageNum);
        setStatus('succeeded');
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setStatus('failed');
        setError(
          axiosError.response?.data?.error?.message ||
            '注文データの取得に失敗しました',
        );
        throw error;
      }
    },
    [dispatch, page],
  );

  const loadMore = useCallback(() => {
    if (!isSearching && status !== 'loading' && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isSearching, status, hasMore]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;
      if (name.startsWith('orderItems.')) {
        const [, index, field] = name.split('.');
        setNewOrder(prev => {
          const items = [...prev.orderItems];
          items[Number(index)] = {
            ...items[Number(index)],
            [field]:
              field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
          };
          return { ...prev, orderItems: items };
        });
      } else {
        setNewOrder(prev => ({ ...prev, [name]: value }));
      }
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    },
    [],
  );

  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    if (page > 1) {
      void fetchOrders(page);
    }
  }, [page, fetchOrders]);

  useEffect(() => {
    const initialFetch = async (): Promise<void> => {
      try {
        setStatus('loading');
        const params: OrderParams = {
          page: 1,
          per_page: 15,
          status: statusFilter || undefined,
          start_date: dateRange.start?.toISOString() || undefined,
          end_date: dateRange.end?.toISOString() || undefined,
        };
        const response = await dispatch(fetchOrdersAction(params)).unwrap();
        setOrders(response.data.data);
        if (totalCount === 0) {
          setTotalCount(response.meta.total);
        }
        setStatus('succeeded');
        setIsInitialLoad(false);
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setStatus('failed');
        setError(
          axiosError.response?.data?.error?.message ||
            '注文データの取得に失敗しました',
        );
      }
    };

    if (isInitialLoad) {
      void initialFetch();
    }
  }, [dispatch, statusFilter, dateRange, totalCount, isInitialLoad]);

  const clearFilters = useCallback(async (): Promise<void> => {
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

      const [_, response] = await Promise.all([
        dispatch(setFilterParams({})),
        dispatch(
          fetchOrdersAction({
            page: 1,
            per_page: 15,
          }),
        ).unwrap(),
      ]);

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
  }, [dispatch, toast]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setSearchTerm(value);
      if (!value) {
        void clearFilters();
      }
    },
    [clearFilters],
  );

  const handleSearchSubmit = useCallback(async (): Promise<void> => {
    if (isSearching) return;

    try {
      setIsSearching(true);
      setPage(1);

      filterStateRef.current = {
        currentStatus: null,
        currentSearchTerm: searchTerm,
        currentDateRange: { start: null, end: null },
      };

      setStatusFilter(null);
      setDateRange({ start: null, end: null });

      const searchParams: OrderParams = {
        page: 1,
        per_page: 15,
        search: searchTerm || undefined,
      };

      await dispatch(
        setFilterParams({
          searchTerm,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
        }),
      );

      const response = await dispatch(fetchOrdersAction(searchParams)).unwrap();

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response data structure');
      }

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
      } else {
        toast({
          title: '検索が完了しました',
          status: 'success',
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
        position: 'top',
      });

      setOrders([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, searchTerm, dispatch, toast]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  const handleSubmit = useCallback(async () => {
    try {
      if (modalMode === 'add') {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
          newOrder,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          },
        );

        toast({
          title: '注文を作成しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } else if (modalMode === 'edit' && activeOrder) {
        await Promise.all([
          axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${activeOrder.id}/items`,
            { orderItems: newOrder.orderItems },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            },
          ),
          axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${activeOrder.id}/status`,
            { status: newOrder.status },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        ]);

        toast({
          title: '注文を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }

      setPage(1);
      await fetchOrders(1);
      onClose();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error submitting order:', error);
      toast({
        title: 'エラーが発生しました',
        description:
          axiosError.response?.data?.error?.message ||
          '注文の処理中にエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [modalMode, newOrder, activeOrder, toast, onClose, fetchOrders]);

  // ここに修正を加えた日付範囲フィルター関数を追加します
  const handleDateRangeFilter = useCallback(
    async (
      range: 'today' | 'week' | 'month' | 'custom',
      customStart?: Date | null,
      customEnd?: Date | null,
    ): Promise<void> => {
      try {
        setIsSearching(true);

        if (range === 'custom' && (!customStart || !customEnd)) {
          // クリアの場合
          filterStateRef.current.currentDateRange = { start: null, end: null };
          setDateRange({ start: null, end: null });

          const response = await dispatch(
            fetchOrdersAction({
              page: 1,
              per_page: 15,
              search: filterStateRef.current.currentSearchTerm || undefined,
              status: filterStateRef.current.currentStatus || undefined,
            }),
          ).unwrap();

          setOrders(response.data.data);
          setTotalCount(response.meta.total);
          setHasMore(response.data.data.length === 15);
          setPage(1);

          toast({
            title: '期間フィルターをクリアしました',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });

          setIsSearching(false);
          return;
        }

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
            start = startOfDay(
              new Date(today.getFullYear(), today.getMonth(), 1),
            );
            end = endOfDay(
              new Date(today.getFullYear(), today.getMonth() + 1, 0),
            );
            break;
          case 'custom':
            start = startOfDay(customStart!);
            end = endOfDay(customEnd!);
            break;
          default:
            return;
        }

        setSearchTerm('');
        setStatusFilter(null);

        const newDateRange = { start, end };
        setDateRange(newDateRange);
        filterStateRef.current.currentDateRange = newDateRange;

        const params: OrderParams = {
          page: 1,
          per_page: 15,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        };

        await dispatch(
          setFilterParams({
            searchTerm: '',
            status: undefined,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          }),
        );

        const response = await dispatch(fetchOrdersAction(params)).unwrap();

        setOrders(response.data.data);
        setTotalCount(response.meta.total);
        setHasMore(response.data.data.length === 15);
        setPage(1);

        toast({
          title: '期間フィルターを適用しました',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
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
    },
    [dispatch, toast],
  );

  const handleStatusFilter = useCallback(
    async (status: OrderStatus): Promise<void> => {
      try {
        setIsSearching(true);
        setStatusFilter(status);

        filterStateRef.current = {
          currentStatus: status,
          currentSearchTerm: '',
          currentDateRange: { start: null, end: null },
        };

        setDateRange({ start: null, end: null });
        setSearchTerm('');
        setPage(1);

        const response = await dispatch(
          fetchOrdersAction({
            page: 1,
            per_page: 15,
            status: status || undefined,
          }),
        ).unwrap();

        if (response && response.data) {
          setOrders(response.data.data);
          setTotalCount(response.meta.total);
          setHasMore(response.data.data.length === 15);
        }
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
    },
    [dispatch, toast],
  );

  const handleOrderClick = useCallback(
    async (order: Order): Promise<void> => {
      try {
        setModalMode('detail');
        const response = await axios.get<Order>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        const data = response.data;
        data.orderItems = data.order_items;
        setActiveOrder(data);
        onOpen();
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        console.error('注文詳細データの取得に失敗しました:', axiosError);
        toast({
          title: 'エラーが発生しました',
          description: '注文詳細の取得に失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [onOpen, toast],
  );

  const handleAddOrder = useCallback((): void => {
    setActiveOrder(null);
    setNewOrder({
      customerId: '',
      orderItems: [],
      status: 'PENDING',
    });
    setFormErrors({});
    setModalMode('add');
    onOpen();
  }, [onOpen]);

  const handleEditOrder = useCallback(
    (order: Order): void => {
      setActiveOrder(order);
      const formattedOrderItems = (order.order_items ?? []).map(item => ({
        productId: item.product.id,
        quantity: Number(item.quantity),
      }));

      setNewOrder({
        customerId: order.customer.id,
        orderItems: formattedOrderItems,
        status: order.status,
      });
      setFormErrors({});
      setModalMode('edit');
      onOpen();
    },
    [onOpen],
  );

  const handleDeleteOrder = useCallback((order: Order): void => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!orderToDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      const response = await dispatch(
        fetchOrdersAction({
          page: 1,
          per_page: 15,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          start_date: dateRange.start?.toISOString() || undefined,
          end_date: dateRange.end?.toISOString() || undefined,
        }),
      ).unwrap();

      setOrders(response.data.data);
      setTotalCount(response.meta.total);

      toast({
        title: '注文を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setIsDeleteAlertOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast({
        title: '削除に失敗しました',
        description:
          axiosError.response?.data?.error?.message ||
          '注文の削除中にエラーが発生しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [orderToDelete, toast, dispatch, statusFilter, dateRange, searchTerm]);

  const cancelDelete = useCallback((): void => {
    setIsDeleteAlertOpen(false);
    setOrderToDelete(null);
  }, []);

  const handleOrderItemChange = useCallback(
    (index: number, field: OrderItemField, value: string | number): void => {
      setNewOrder(prev => {
        const items = [...prev.orderItems];
        const parsedValue =
          field === 'quantity'
            ? Math.max(
                1,
                typeof value === 'number'
                  ? value
                  : parseInt(String(value), 10) || 1,
              )
            : value;

        items[index] = {
          ...items[index],
          [field]: parsedValue,
        };
        return { ...prev, orderItems: items };
      });
    },
    [],
  );

  const handleAddOrderItem = useCallback((): void => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        {
          productId: '',
          quantity: 1,
        },
      ],
    }));
  }, []);

  const handleRemoveOrderItem = useCallback((index: number): void => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    orders,
    totalCount,
    status,
    error,
    activeOrder,
    modalMode,
    isDeleteAlertOpen,
    orderToDelete,
    newOrder,
    formErrors,
    searchTerm,
    dateRange,
    isOpen,
    onClose,
    hasMore,
    isSearching,
    lastElementRef,
    handleSearchChange,
    handleSearchSubmit,
    handleSubmit,
    handleStatusFilter,
    handleDateRangeFilter,
    handleOrderClick,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    confirmDelete,
    cancelDelete,
    handleOrderItemChange,
    handleInputChange,
    handleSearchKeyDown,
    handleAddOrderItem,
    handleRemoveOrderItem,
    clearFilters,
  };
};
