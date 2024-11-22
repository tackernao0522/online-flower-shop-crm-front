import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

type OrderItemField = keyof OrderFormItem;

interface UseOrderManagementState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  activeOrder: Order | null;
  modalMode: 'detail' | 'add' | 'edit';
  isDeleteAlertOpen: boolean;
  orderToDelete: Order | null;
  formErrors: FormErrors;
  isInitialLoad: boolean;
  isSearching: boolean;
  searchTerm: string;
  statusFilter: OrderStatus | null;
  dateRange: DateRange;
  page: number;
  hasMore: boolean;
  localOrders: Order[];
  totalCount: number;
  newOrder: OrderForm;
}

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

interface FetchOrdersResponse {
  data: {
    data: Order[];
    meta: {
      total: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export const useOrderManagement = () => {
  // Redux - 型付きで状態を取得
  const dispatch = useDispatch<AppDispatch>();
  const reduxOrders = useSelector(selectOrders);
  const orders = useMemo(() => reduxOrders || [], [reduxOrders]);
  const reduxStatus = useSelector(selectOrdersStatus);
  const reduxError = useSelector(selectOrdersError);

  // Local State - すべての状態に明示的な型を指定
  const [status, setStatus] =
    useState<UseOrderManagementState['status']>('idle');
  const [error, setError] = useState<UseOrderManagementState['error']>(null);
  const [activeOrder, setActiveOrder] =
    useState<UseOrderManagementState['activeOrder']>(null);
  const [modalMode, setModalMode] =
    useState<UseOrderManagementState['modalMode']>('detail');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  // Pagination State - 型付きでページネーション状態を管理
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Hooks
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const toast = useToast();

  // Refs - フィルター状態を参照として保持
  const filterStateRef = useRef<FilterState>({
    currentStatus: null,
    currentSearchTerm: '',
    currentDateRange: { start: null, end: null },
  });

  // 新規注文の初期状態
  const [newOrder, setNewOrder] = useState<OrderForm>({
    customerId: '',
    orderItems: [],
    status: 'PENDING',
  });

  // 基本的なハンドラー - モーダル制御
  const onClose = useCallback((): void => {
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

  // 注文一覧の取得 - 型安全な実装
  const fetchOrders = useCallback(
    async (pageNum: number = page): Promise<FetchOrdersResponse> => {
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
          setLocalOrders(response.data.data);
        } else {
          setLocalOrders(prev => [...prev, ...response.data.data]);
        }

        setHasMore(response.data.data.length === 15);
        setTotalCount(response.meta.total);
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
        throw error;
      }
    },
    [dispatch, page],
  );

  // 無限スクロール用のローディング処理
  const loadMore = useCallback((): void => {
    if (!isSearching && status !== 'loading' && hasMore) {
      fetchOrders(page + 1);
    }
  }, [fetchOrders, page, isSearching, status, hasMore]);

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

  // 注文フォームの送信処理を追加
  const handleSubmit = useCallback(async () => {
    // バリデーション
    const errors: FormErrors = {};
    if (!newOrder.customerId) errors.customerId = '顧客IDは必須です';
    if (newOrder.orderItems.length === 0) {
      errors.orderItems = '商品を1つ以上追加してください';
    }

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

        toast({
          title: '注文を作成しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
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

        toast({
          title: '注文を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }

      // データを再取得してモーダルを閉じる
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

  // フィルターをクリアする処理
  const clearFilters = useCallback(async (): Promise<void> => {
    try {
      setIsSearching(true);

      // フィルター状態を完全にリセット
      filterStateRef.current = {
        currentStatus: null,
        currentSearchTerm: '',
        currentDateRange: { start: null, end: null },
      };

      // ローカルステートをリセット
      setSearchTerm('');
      setStatusFilter(null);
      setDateRange({ start: null, end: null });
      setPage(1);

      // Redux状態のクリアとデータの再取得を一括で実行
      const [_, response] = await Promise.all([
        dispatch(setFilterParams({})),
        dispatch(
          fetchOrdersAction({
            page: 1,
            per_page: 15,
          }),
        ).unwrap(),
      ]);

      // 状態を更新
      setLocalOrders(response.data.data);
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

  // 検索入力の変更ハンドラー
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setSearchTerm(value);
      if (!value) {
        clearFilters();
      }
    },
    [clearFilters],
  );

  // 検索実行処理
  const handleSearchSubmit = useCallback(async (): Promise<void> => {
    if (isSearching) return;

    try {
      setIsSearching(true);
      setPage(1);

      // 検索条件のみで検索
      filterStateRef.current = {
        currentStatus: null, // ステータスをリセット
        currentSearchTerm: searchTerm, // 検索語句のみ設定
        currentDateRange: { start: null, end: null }, // 日付範囲をリセット
      };

      // 他のフィルター状態をリセット
      setStatusFilter(null);
      setDateRange({ start: null, end: null });

      const searchParams: OrderParams = {
        page: 1,
        per_page: 15,
        search: searchTerm || undefined,
      };

      // Redux状態を更新
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

      setLocalOrders(response.data.data);
      setTotalCount(response.meta.total);
      setHasMore(response.data.data.length === 15);

      toast({
        title: '検索が完了しました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
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

      setLocalOrders([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, searchTerm, dispatch, toast]);

  // 検索のキーダウンハンドラー（Enterキー）
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  // 注文詳細の取得
  const fetchOrderDetails = useCallback(
    async (orderId: string): Promise<void> => {
      try {
        const response = await axios.get<Order>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        const data = response.data;
        data.orderItems = data.order_items;
        setActiveOrder(data);
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
    [toast],
  );

  // 注文詳細を表示
  const handleOrderClick = useCallback(
    (order: Order): void => {
      setModalMode('detail');
      void fetchOrderDetails(order.id);
      onOpen();
    },
    [onOpen, fetchOrderDetails],
  );

  // 新規注文作成モーダルを開く
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

  // 注文編集モーダルを開く
  const handleEditOrder = useCallback(
    (order: Order): void => {
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

  // 削除確認モーダルを開く
  const handleDeleteOrder = useCallback((order: Order): void => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  }, []);

  // 注文を削除
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
  }, [orderToDelete, toast, dispatch, statusFilter, dateRange, searchTerm]);

  // 削除をキャンセル
  const cancelDelete = useCallback((): void => {
    setIsDeleteAlertOpen(false);
    setOrderToDelete(null);
  }, []);

  // 注文アイテムの操作
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

  // 注文アイテムを追加
  const handleAddOrderItem = useCallback((): void => {
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

  // 注文アイテムを削除
  const handleRemoveOrderItem = useCallback((index: number): void => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  }, []);

  // ステータスフィルターの処理
  const handleStatusFilter = useCallback(
    async (status: OrderStatus): Promise<void> => {
      try {
        setIsSearching(true);
        setStatusFilter(status);

        // ステータスのみで検索
        filterStateRef.current = {
          currentStatus: status,
          currentSearchTerm: '',
          currentDateRange: { start: null, end: null },
        };

        // 他のフィルター状態をリセット
        setDateRange({ start: null, end: null });
        setSearchTerm('');
        setPage(1);

        // ステータスのみでAPIリクエスト
        const response = await dispatch(
          fetchOrdersAction({
            page: 1,
            per_page: 15,
            status: status || undefined,
          }),
        ).unwrap();

        if (response && response.data) {
          setLocalOrders(response.data.data);
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

  // 日付範囲フィルターの処理
  const handleDateRangeFilter = useCallback(
    (range: 'today' | 'week' | 'month' | 'custom'): void => {
      const today = new Date();
      let start: Date;
      let end: Date;

      switch (range) {
        case 'today':
          start = new Date();
          end = new Date();
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'week':
          start = new Date();
          end = new Date();
          start.setDate(today.getDate() - 7);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          break;
        case 'custom':
          start = new Date();
          end = new Date();
          break;
      }

      try {
        setIsSearching(true);
        const newDateRange = { start, end };
        setDateRange(newDateRange);

        // 日付範囲のみで検索
        filterStateRef.current = {
          currentStatus: null,
          currentSearchTerm: '',
          currentDateRange: newDateRange,
        };

        // 他のフィルター状態をリセット
        setStatusFilter(null);
        setSearchTerm('');
        setPage(1);

        // 日付範囲のみでAPIリクエスト
        void dispatch(
          fetchOrdersAction({
            page: 1,
            per_page: 15,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          }),
        )
          .unwrap()
          .then(response => {
            setLocalOrders(response.data.data);
            setTotalCount(response.meta.total);
            setHasMore(response.data.data.length === 15);
          })
          .catch(error => {
            console.error('Date range filter error:', error);
            const axiosError = error as AxiosError<ApiErrorResponse>;
            toast({
              title: 'フィルタリングに失敗しました',
              description: axiosError.response?.data?.error?.message,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          })
          .finally(() => {
            setIsSearching(false);
          });
      } catch (error) {
        console.error('Date range filter error:', error);
        const axiosError = error as AxiosError<ApiErrorResponse>;
        toast({
          title: 'フィルタリングに失敗しました',
          description: axiosError.response?.data?.error?.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsSearching(false);
      }
    },
    [dispatch, toast],
  );

  // 初期データ取得
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
        setLocalOrders(response.data.data);
        if (totalCount === null) {
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

  // フックの返り値
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
    statusFilter,
    dateRange,
    isOpen,
    onOpen,
    onClose,
    hasMore,
    loadMore,
    totalCount: totalCount || 0,
    isSearching,

    // アクション
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

export type UseOrderManagementReturn = ReturnType<typeof useOrderManagement>;
