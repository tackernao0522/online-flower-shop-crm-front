import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast, useDisclosure } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import { useOrderSearch } from './order/useOrderSearch';
import { fetchOrdersHelper } from '@/api/orderApi';
import { useOrderFilters } from './order/useOrderFilters';
import { useOrderItems } from './order/useOrderItems';
import { useOrderOperations } from './order/useOrderOperations';
import type {
  Order,
  OrderStatus,
  OrderForm,
  DateRange,
  FormErrors,
} from '@/types/order';
import type { ApiErrorResponse } from '@/types/api';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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

  const disclosure = useDisclosure();
  const isOpen = disclosure.isOpen;
  const onOpen = disclosure.onOpen;
  const originalOnClose = disclosure.onClose;

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
        };

        if (filterStateRef.current.currentSearchTerm) {
          params.search = filterStateRef.current.currentSearchTerm;
        } else if (filterStateRef.current.currentStatus) {
          params.status = filterStateRef.current.currentStatus;
        } else if (
          filterStateRef.current.currentDateRange.start &&
          filterStateRef.current.currentDateRange.end
        ) {
          params.start_date =
            filterStateRef.current.currentDateRange.start.toISOString();
          params.end_date =
            filterStateRef.current.currentDateRange.end.toISOString();
        }

        const { data, meta } = await fetchOrdersHelper(dispatch, params);

        if (pageNum === 1) {
          setOrders(data);
        } else {
          setOrders(prev => [...prev, ...data]);
        }

        setHasMore(data.length === 15);
        setTotalCount(meta.total);
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
      void fetchOrders(page + 1);
    }
  }, [isSearching, status, hasMore, page, fetchOrders]);

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

  const {
    clearFilters,
    handleStatusFilter: handleStatusFilterWrapper,
    handleDateRangeFilter: handleDateRangeFilterWrapper,
  } = useOrderFilters({
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
  });

  const {
    handleOrderItemChange,
    handleInputChange,
    handleAddOrderItem,
    handleRemoveOrderItem,
  } = useOrderItems({
    newOrder,
    setNewOrder,
    setFormErrors,
  });

  const { handleSearchChange, handleSearchSubmit, handleSearchKeyDown } =
    useOrderSearch({
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
    });

  const {
    handleSubmit,
    handleOrderClick,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    confirmDelete,
    cancelDelete,
  } = useOrderOperations({
    modalMode,
    activeOrder,
    orderToDelete,
    newOrder,
    searchTerm,
    statusFilter,
    dateRange,
    onOpen,
    onClose,
    setOrders,
    setTotalCount,
    setPage,
    setActiveOrder,
    setModalMode,
    setNewOrder,
    setFormErrors,
    setIsDeleteAlertOpen,
    setOrderToDelete,
    fetchOrders,
  });

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
    handleStatusFilter: handleStatusFilterWrapper,
    handleDateRangeFilter: handleDateRangeFilterWrapper,
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
    fetchOrders,
    filterStateRef,
  };
};
