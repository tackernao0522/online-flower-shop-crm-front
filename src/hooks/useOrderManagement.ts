import { useState, useEffect, useCallback } from 'react';
import { useToast, useDisclosure } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchOrders as fetchOrdersAction,
  setFilterParams,
  selectOrders,
  selectOrdersStatus,
  selectOrdersError,
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

export const useOrderManagement = () => {
  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders) || [];
  const reduxStatus = useSelector(selectOrdersStatus);
  const reduxError = useSelector(selectOrdersError);

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Hooks
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const toast = useToast();

  // 新規注文の初期状態
  const [newOrder, setNewOrder] = useState<OrderForm>({
    customerId: '',
    orderItems: [],
    status: 'PENDING',
  });

  // モーダルを閉じる処理
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

  // 注文一覧の取得
  const fetchOrders = useCallback(
    async (pageNum = page) => {
      try {
        setStatus('loading');
        const params: Record<string, any> = {
          page: pageNum,
          per_page: 15,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          start_date: dateRange.start?.toISOString() || undefined,
          end_date: dateRange.end?.toISOString() || undefined,
        };

        const response = await dispatch(fetchOrdersAction(params)).unwrap();

        if (pageNum === 1) {
          setLocalOrders(response.data.data);
        } else {
          setLocalOrders(prev => [...prev, ...response.data.data]);
        }

        setHasMore(response.data.data.length === 15);
        setPage(pageNum);
        setStatus('succeeded');

        return response;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setStatus('failed');
        setError(
          axiosError.response?.data?.error?.message ||
            '注文データの取得に失敗しました',
        );
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    [dispatch, searchTerm, statusFilter, dateRange, page],
  );

  // 追加ロード用の関数
  const loadMore = useCallback(() => {
    if (!isSearching && status !== 'loading' && hasMore) {
      fetchOrders(page + 1);
    }
  }, [fetchOrders, page, isSearching, status, hasMore]);

  // 検索入力のハンドラー
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  // 検索実行処理
  const handleSearchSubmit = useCallback(async () => {
    setIsSearching(true);
    setPage(1);
    try {
      dispatch(setFilterParams({ searchTerm }));
      const response = await fetchOrders(1);
      setTotalCount(response.meta.total); // 検索時にも総数を更新
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [dispatch, fetchOrders, searchTerm]);

  const fetchOrderDetails = useCallback(async (orderId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );

      const data = response.data;
      data.orderItems = data.order_items;
      setActiveOrder(data);
    } catch (error) {
      console.error('注文詳細データの取得に失敗しました:', error);
    }
  }, []);

  // 注文詳細の表示
  const handleOrderClick = useCallback(
    (order: Order) => {
      setModalMode('detail');
      fetchOrderDetails(order.id);
      onOpen();
    },
    [onOpen, fetchOrderDetails],
  );

  // 新規注文作成
  const handleAddOrder = useCallback(() => {
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

  // 注文編集
  const handleEditOrder = useCallback(
    (order: Order) => {
      setActiveOrder(order);

      const formattedOrderItems = (order.order_items ?? []).map(item => ({
        ...item,
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

  // 削除関連の処理
  const handleDeleteOrder = useCallback((order: Order) => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
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

      // 削除後に最新データを取得
      const response = await dispatch(
        fetchOrdersAction({
          page: 1,
          per_page: 15,
          status: statusFilter || undefined,
          start_date: dateRange.start?.toISOString() || undefined,
          end_date: dateRange.end?.toISOString() || undefined,
        }),
      ).unwrap();

      // ローカルの注文リストと総数を更新
      setLocalOrders(response.data.data);
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
  }, [orderToDelete, toast, dispatch, statusFilter, dateRange]);

  const cancelDelete = useCallback(() => {
    setIsDeleteAlertOpen(false);
    setOrderToDelete(null);
  }, []);

  // フィルター関連の処理
  const handleStatusFilter = useCallback(
    (status: OrderStatus) => {
      setStatusFilter(status);
      setPage(1); // ページをリセット
      dispatch(setFilterParams({ status }));
      fetchOrders(1);
    },
    [dispatch, fetchOrders],
  );

  const handleDateRangeFilter = useCallback(
    (range: 'today' | 'week' | 'month' | 'custom') => {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (range) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'week':
          start.setDate(today.getDate() - 7);
          break;
        case 'month':
          start.setMonth(today.getMonth() - 1);
          break;
        case 'custom':
          break;
      }

      setDateRange({ start, end });
      setPage(1); // ページをリセット
      dispatch(
        setFilterParams({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      );
      fetchOrders(1);
    },
    [dispatch, fetchOrders],
  );

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter(null);
    setDateRange({ start: null, end: null });
    setPage(1); // ページをリセット
    dispatch(setFilterParams({}));
    fetchOrders(1);
  }, [dispatch, fetchOrders]);

  // 注文アイテムの処理
  const handleOrderItemChange = useCallback(
    (index: number, field: string, value: string | number) => {
      setNewOrder(prev => {
        const items = [...prev.orderItems];
        const parsedValue =
          field === 'quantity'
            ? Math.max(
                1,
                typeof value === 'number'
                  ? value
                  : parseInt(value.toString(), 10) || 1,
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

  const handleAddOrderItem = useCallback(() => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        {
          productId: '',
          quantity: 1,
        } satisfies OrderFormItem,
      ],
    }));
  }, []);

  const handleRemoveOrderItem = useCallback((index: number) => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  }, []);

  // フォーム処理
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = useCallback(async () => {
    // バリデーション
    const errors: FormErrors = {};
    if (!newOrder.customerId) errors.customerId = '顧客IDは必須です';
    if (newOrder.orderItems.length === 0)
      errors.orderItems = '商品を1つ以上追加してください';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (modalMode === 'add') {
        // 新規作成
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

        // 総数をインクリメントする
        setTotalCount(prevCount => (prevCount !== null ? prevCount + 1 : 1));
      } else if (modalMode === 'edit' && activeOrder) {
        // 編集の場合、注文アイテムとステータスの両方を更新
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
      }

      await fetchOrders(1);
      toast({
        title:
          modalMode === 'add' ? '注文を作成しました' : '注文を更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

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

  // 初期データ取得
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setStatus('loading');
        const params: Record<string, any> = {
          page: 1,
          per_page: 15,
          status: statusFilter || undefined,
          start_date: dateRange.start?.toISOString() || undefined,
          end_date: dateRange.end?.toISOString() || undefined,
        };
        const response = await dispatch(fetchOrdersAction(params)).unwrap();
        setLocalOrders(response.data.data);
        if (totalCount === null) {
          setTotalCount(response.meta.total);
        }
        setStatus('succeeded');
      } catch (error) {
        setStatus('failed');
        setError('注文データの取得に失敗しました');
      }
    };
    initialFetch();
  }, [dispatch, statusFilter, dateRange, totalCount, setTotalCount]);

  return {
    // 状態
    orders: localOrders,
    status: status === 'loading' ? 'loading' : reduxStatus,
    error: error || reduxError,
    activeOrder,
    modalMode,
    isDeleteAlertOpen,
    orderToDelete,
    newOrder,
    formErrors,
    searchTerm,
    isOpen,
    onOpen,
    onClose,
    hasMore,
    loadMore,
    totalCount: totalCount || 0,

    // アクション
    handleSearchChange,
    isSearching,
    handleSearchSubmit,
    handleStatusFilter,
    handleDateRangeFilter,
    handleOrderClick,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    confirmDelete,
    cancelDelete,
    handleInputChange,
    handleSubmit,
    handleAddOrderItem,
    handleRemoveOrderItem,
    handleOrderItemChange,
    clearFilters,
  };
};
