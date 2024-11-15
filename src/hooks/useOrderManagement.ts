import { useState, useEffect, useCallback } from "react";
import { useToast, useDisclosure } from "@chakra-ui/react";
import axios, { AxiosResponse } from "axios";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

interface OrderState {
  customerId: string;
  orderItems: OrderItem[];
  status: OrderStatus; // string から OrderStatus に変更
}

interface FormErrors {
  customerId?: string;
  orderItems?: string;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export const useOrderManagement = () => {
  type OrderManagementStatus = "idle" | "loading" | "succeeded" | "failed";
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderManagementStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "add" | "edit">(
    "detail"
  );
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  // useDisclosureフックを使用
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();

  const toast = useToast();

  // 新規注文用の状態
  const [newOrder, setNewOrder] = useState<OrderState>({
    customerId: "",
    orderItems: [],
    status: "PENDING",
  });

  // モーダルを閉じる処理
  const onClose = useCallback(() => {
    originalOnClose();
    // モーダルが完全に閉じた後にstateをリセット
    setTimeout(() => {
      setActiveOrder(null);
      setModalMode("detail");
      setNewOrder({
        customerId: "",
        orderItems: [],
        status: "PENDING",
      });
      setFormErrors({});
    }, 300);
  }, [originalOnClose]);

  // 注文一覧の取得
  const fetchOrders = useCallback(async () => {
    try {
      setStatus("loading");
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (dateRange.start)
        params.append("start_date", dateRange.start.toISOString());
      if (dateRange.end) params.append("end_date", dateRange.end.toISOString());

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params,
        }
      );
      setOrders(response.data.data);
      setStatus("succeeded");
    } catch (error) {
      setStatus("failed");
      setError("注文データの取得に失敗しました");
      console.error("Error fetching orders:", error);
    }
  }, [searchTerm, statusFilter, dateRange, setStatus]);

  // 注文詳細の表示
  const handleOrderClick = useCallback(
    (order: Order) => {
      setModalMode("detail");
      setActiveOrder(order);
      onOpen();
    },
    [onOpen]
  );

  // 新規注文作成
  const handleAddOrder = useCallback(() => {
    setActiveOrder(null);
    setNewOrder({
      customerId: "",
      orderItems: [],
      status: "PENDING",
    });
    setFormErrors({});
    setModalMode("add");
    onOpen();
  }, [onOpen]);

  // 注文編集
  const handleEditOrder = useCallback(
    (order: Order) => {
      console.log("編集する注文データ:", order);
      setActiveOrder(order);

      // orderItemsの整形（IDと商品情報を保持）
      const formattedOrderItems =
        order.orderItems?.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.product.id,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          product: item.product,
        })) || [];

      setNewOrder({
        customerId: order.customer.id,
        orderItems: formattedOrderItems,
        status: order.status,
      });

      setFormErrors({});
      setModalMode("edit");
      onOpen();
    },
    [onOpen]
  );

  // 削除確認ダイアログを開く
  const handleDeleteOrder = useCallback((order: Order) => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  }, []);

  // 削除の実行
  const confirmDelete = useCallback(async () => {
    if (!orderToDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderToDelete.id)
      );
      toast({
        title: "注文を削除しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteAlertOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      toast({
        title: "削除に失敗しました",
        description: "注文の削除中にエラーが発生しました。",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [orderToDelete, toast]);

  // 削除のキャンセル
  const cancelDelete = useCallback(() => {
    setIsDeleteAlertOpen(false);
    setOrderToDelete(null);
  }, []);

  // 検索処理
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSearchSubmit = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // フィルター処理
  const handleStatusFilter = useCallback((status: OrderStatus) => {
    setStatusFilter(status);
  }, []);

  const handleDateRangeFilter = useCallback(
    (range: "today" | "week" | "month" | "custom") => {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (range) {
        case "today":
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case "week":
          start.setDate(today.getDate() - 7);
          break;
        case "month":
          start.setMonth(today.getMonth() - 1);
          break;
        case "custom":
          break;
      }

      setDateRange({ start, end });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter(null);
    setDateRange({ start: null, end: null });
  }, []);

  // 商品関連の処理
  const handleOrderItemChange = useCallback(
    (index: number, field: string, value: string | number) => {
      setNewOrder((prev) => {
        const items = [...prev.orderItems];
        let parsedValue;
        if (field === "quantity") {
          parsedValue =
            typeof value === "number"
              ? Math.max(1, value)
              : Math.max(1, parseInt(value.toString(), 10) || 1);
        } else {
          parsedValue = value;
        }

        items[index] = {
          ...items[index],
          [field]: parsedValue,
        };
        return { ...prev, orderItems: items };
      });
    },
    []
  );

  const handleAddOrderItem = useCallback(() => {
    setNewOrder((prev) => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        {
          id: "",
          orderId: "",
          productId: "",
          quantity: 1,
          unitPrice: 0,
          product: {
            id: "",
            name: "",
            description: "",
            price: 0,
            stockQuantity: 0,
            category: "",
            is_active: true,
          },
        },
      ],
    }));
  }, []);

  const handleRemoveOrderItem = useCallback((index: number) => {
    setNewOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  }, []);

  // フォーム入力の処理
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name.startsWith("orderItems.")) {
        const [, index, field] = name.split(".");
        const items = [...newOrder.orderItems];
        items[Number(index)] = {
          ...items[Number(index)],
          [field]:
            field === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
        };
        setNewOrder((prev) => ({ ...prev, orderItems: items }));
      } else {
        setNewOrder((prev) => ({ ...prev, [name]: value }));
      }
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [newOrder]
  );

  // 保存処理
  const handleSubmit = useCallback(async () => {
    // バリデーション処理
    const errors: FormErrors = {};
    if (!newOrder.customerId) {
      errors.customerId = "顧客IDは必須です";
    }
    if (newOrder.orderItems.length === 0) {
      errors.orderItems = "商品を1つ以上追加してください";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let response: AxiosResponse<Order>;

      if (modalMode === "add") {
        response = await axios.post<Order>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
          newOrder,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setOrders((prevOrders) => [response.data, ...prevOrders]);
      } else if (modalMode === "edit") {
        const orderId = activeOrder?.id;
        if (!orderId) return;

        // 注文商品の更新
        const itemsResponse = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/items`,
          { orderItems: newOrder.orderItems },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // ステータスの更新
        response = await axios.put<Order>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/status`,
          { status: newOrder.status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const updatedOrder = {
          ...response.data,
          orderItems: itemsResponse.data.orderItems,
        };

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? updatedOrder : order
          )
        );

        setModalMode("detail");
        setActiveOrder(updatedOrder);
      }

      toast({
        title:
          modalMode === "add" ? "注文を作成しました" : "注文を更新しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (modalMode === "add") {
        onClose();
      }
      // 編集時はモーダルを閉じない
    } catch (error: any) {
      console.error("エラーの詳細:", error);
      toast({
        title: "エラーが発生しました",
        description:
          error.response?.data?.message || "注文の処理中にエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [modalMode, newOrder, toast, onClose, activeOrder]);

  // 初期データ取得
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    // 状態
    orders,
    status,
    error,
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

    // アクション
    handleSearchChange,
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
