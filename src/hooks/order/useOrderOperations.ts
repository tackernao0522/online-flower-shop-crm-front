import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import type {
  Order,
  OrderForm,
  OrderStatus,
  DateRange,
  FormErrors,
} from '@/types/order';
import type { ApiErrorResponse } from '@/types/api';

interface UseOrderOperationsProps {
  modalMode: 'detail' | 'add' | 'edit';
  activeOrder: Order | null;
  orderToDelete: Order | null;
  newOrder: OrderForm;
  searchTerm: string;
  statusFilter: OrderStatus | null;
  dateRange: DateRange;
  onOpen: () => void;
  onClose: () => void;
  setOrders: (orders: Order[]) => void;
  setTotalCount: (count: number) => void;
  setPage: (page: number) => void;
  setActiveOrder: (order: Order | null) => void;
  setModalMode: (mode: 'detail' | 'add' | 'edit') => void;
  setNewOrder: (order: OrderForm | ((prev: OrderForm) => OrderForm)) => void;
  setFormErrors: (
    errors: FormErrors | ((prev: FormErrors) => FormErrors),
  ) => void;
  setIsDeleteAlertOpen: (isOpen: boolean) => void;
  setOrderToDelete: (order: Order | null) => void;
  fetchOrders: (page?: number) => Promise<void>;
}

export const useOrderOperations = ({
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
}: UseOrderOperationsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

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
  }, [modalMode, newOrder, activeOrder, toast, onClose, fetchOrders, setPage]);

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
    [onOpen, setActiveOrder, setModalMode, toast],
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
  }, [onOpen, setActiveOrder, setNewOrder, setFormErrors, setModalMode]);

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
    [onOpen, setActiveOrder, setNewOrder, setFormErrors, setModalMode],
  );

  const handleDeleteOrder = useCallback(
    (order: Order): void => {
      setOrderToDelete(order);
      setIsDeleteAlertOpen(true);
    },
    [setOrderToDelete, setIsDeleteAlertOpen],
  );

  const confirmDelete = useCallback(async (): Promise<void> => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderToDelete?.id}`,
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
  }, [
    orderToDelete?.id,
    dispatch,
    searchTerm,
    statusFilter,
    dateRange,
    setOrders,
    setTotalCount,
    toast,
    setIsDeleteAlertOpen,
    setOrderToDelete,
  ]);

  const cancelDelete = useCallback((): void => {
    setIsDeleteAlertOpen(false);
    setOrderToDelete(null);
  }, [setIsDeleteAlertOpen, setOrderToDelete]);

  return {
    handleSubmit,
    handleOrderClick,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    confirmDelete,
    cancelDelete,
  };
};
