import { renderHook, act } from '@testing-library/react';
import { useOrderOperations } from '../useOrderOperations';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import { Order, OrderStatus } from '@/types/order';

jest.mock('axios');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));
jest.mock('@/features/orders/ordersSlice');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchOrders = fetchOrdersAction as unknown as jest.Mock;

const mockOrderData: Order = {
  id: 'order1',
  orderNumber: 'ON001',
  orderDate: new Date().toISOString(),
  customerId: 'customer1',
  userId: 'user1',
  campaignId: null,
  customer: {
    id: 'customer1',
    name: 'Test Customer',
    email: 'test@example.com',
    address: '123 Test St',
    phoneNumber: '1234567890',
    birthDate: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  order_items: [
    {
      id: 'item1',
      orderId: 'order1',
      productId: 'product1',
      product: {
        id: 'product1',
        name: 'Test Product',
        price: 1000,
        description: 'Test Description',
        stockQuantity: 100,
        category: 'TEST',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      quantity: 1,
      unitPrice: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ],
  totalAmount: 1000,
  discountApplied: 0,
  status: 'PENDING' as OrderStatus,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

describe('useOrderOperations フック', () => {
  let mockDispatch: jest.Mock;
  let mockToast: jest.Mock;
  let mockSetIsDeleteAlertOpen: jest.Mock;
  let mockSetOrderToDelete: jest.Mock;
  let mockSetOrders: jest.Mock;
  let mockSetTotalCount: jest.Mock;
  let mockFetchOrders: jest.Mock;
  let mockSetPage: jest.Mock;
  let mockOnClose: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockToast = jest.fn();
    mockSetIsDeleteAlertOpen = jest.fn();
    mockSetOrderToDelete = jest.fn();
    mockSetOrders = jest.fn();
    mockSetTotalCount = jest.fn();
    mockFetchOrders = jest.fn().mockResolvedValue(undefined);
    mockSetPage = jest.fn();
    mockOnClose = jest.fn();

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useToast as jest.Mock).mockReturnValue(mockToast);

    Storage.prototype.getItem = jest.fn(() => 'test-token');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockedFetchOrders.mockImplementation(() => ({
      type: 'orders/fetchOrders',
      payload: undefined,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  test('handleSubmit が新規注文作成時に正しく動作する', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 'order1' } });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
        activeOrder: null,
        orderToDelete: null,
        newOrder: {
          customerId: 'customer1',
          orderItems: [{ productId: 'product1', quantity: 1 }],
          status: 'PENDING',
        },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: mockOnClose,
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: mockSetPage,
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      await result.current!.handleSubmit();
    });

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '注文を作成しました',
        status: 'success',
      }),
    );
    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect(mockFetchOrders).toHaveBeenCalledWith(1);
    expect(mockOnClose).toHaveBeenCalled();
  }, 10000);

  test('handleSubmit が注文更新時に正しく動作する', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'edit',
        activeOrder: mockOrderData,
        orderToDelete: null,
        newOrder: {
          customerId: mockOrderData.customer.id,
          orderItems: [{ productId: 'product1', quantity: 2 }],
          status: 'PROCESSING',
        },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: mockOnClose,
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: mockSetPage,
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      await result.current!.handleSubmit();
    });

    expect(mockedAxios.put).toHaveBeenCalledTimes(2);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '注文を更新しました',
        status: 'success',
      }),
    );
    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect(mockFetchOrders).toHaveBeenCalledWith(1);
    expect(mockOnClose).toHaveBeenCalled();
  }, 10000);

  test('handleOrderClick が正しく動作する', async () => {
    const mockResponse = {
      data: {
        ...mockOrderData,
        order_items: mockOrderData.order_items,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const mockSetActiveOrder = jest.fn();
    const mockSetModalMode = jest.fn();
    const mockOnOpen = jest.fn();

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: mockOnOpen,
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: mockSetActiveOrder,
        setModalMode: mockSetModalMode,
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current!.handleOrderClick(mockOrderData);
    });

    expect(mockSetModalMode).toHaveBeenCalledWith('detail');
    expect(mockSetActiveOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockOrderData.id,
      }),
    );
    expect(mockOnOpen).toHaveBeenCalled();
  }, 10000);

  test('confirmDelete が正しく動作する', async () => {
    const deletableOrder = {
      ...mockOrderData,
      status: 'PENDING' as OrderStatus,
    };

    mockedAxios.delete.mockResolvedValueOnce({});

    const mockResponse = {
      data: {
        data: [{ id: 'test1' }],
      },
      meta: {
        total: 1,
      },
    };

    const unwrapFn = jest.fn().mockResolvedValue(mockResponse);
    const mockActionResult = { unwrap: unwrapFn };
    mockDispatch.mockReturnValue(mockActionResult);

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: deletableOrder,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      const promise = result.current!.confirmDelete();
      await Promise.resolve();
      await promise;
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(unwrapFn).toHaveBeenCalled();
    expect(mockSetOrders).toHaveBeenCalledWith(mockResponse.data.data);
    expect(mockSetTotalCount).toHaveBeenCalledWith(mockResponse.meta.total);
    expect(mockSetIsDeleteAlertOpen).toHaveBeenCalledWith(false);
    expect(mockSetOrderToDelete).toHaveBeenCalledWith(null);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '注文を削除しました',
        status: 'success',
      }),
    );
  });

  test('cancelDelete が正しく動作する', async () => {
    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: mockOrderData,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      result.current!.cancelDelete();
    });

    expect(mockSetIsDeleteAlertOpen).toHaveBeenCalledWith(false);
    expect(mockSetOrderToDelete).toHaveBeenCalledWith(null);
  });

  test('handleSubmit がエラー時に適切に処理する', async () => {
    const error = {
      response: {
        data: {
          error: {
            message: 'バリデーションエラー',
          },
        },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: mockOnClose,
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: mockSetPage,
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      await result.current!.handleSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        status: 'error',
      }),
    );
  });

  test('handleOrderClick がエラー時に適切に処理する', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        data: {
          error: {
            message: '注文が見つかりません',
          },
        },
      },
    });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),

        setOrderToDelete: jest.fn(),
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      await result.current!.handleOrderClick(mockOrderData);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        description: '注文詳細の取得に失敗しました',
        status: 'error',
      }),
    );
  });

  test('handleSubmit が注文作成時にエラーが発生した場合適切に処理する', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'サーバーエラー' } } },
    });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
        activeOrder: null,
        orderToDelete: null,
        newOrder: {
          customerId: 'customer1',
          orderItems: [],
          status: 'PENDING',
        },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: mockOnClose,
        setOrders: mockSetOrders,
        setTotalCount: mockSetTotalCount,
        setPage: mockSetPage,
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: mockFetchOrders,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        description: 'サーバーエラー',
        status: 'error',
      }),
    );
  });

  test('confirmDelete がエラー時に適切に処理する', async () => {
    mockedAxios.delete.mockRejectedValueOnce({
      response: { data: { error: { message: '削除エラー' } } },
    });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: mockOrderData,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '削除に失敗しました',
        description: '削除エラー',
        status: 'error',
      }),
    );
  });

  test('cancelDelete が正常に動作する', () => {
    const mockSetIsDeleteAlertOpen = jest.fn();
    const mockSetOrderToDelete = jest.fn();

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: mockOrderData,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.cancelDelete();
    });

    expect(mockSetIsDeleteAlertOpen).toHaveBeenCalledWith(false);
    expect(mockSetOrderToDelete).toHaveBeenCalledWith(null);
  });

  test('handleSubmit が注文作成時にエラーが発生した場合、適切に処理する', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'エラーが発生しました' } } },
    });

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
        activeOrder: null,
        orderToDelete: null,
        newOrder: {
          customerId: 'customer1',
          orderItems: [],
          status: 'PENDING',
        },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        description: 'エラーが発生しました',
        status: 'error',
      }),
    );
  });

  test('handleAddOrder が正しく動作する', () => {
    const mockSetActiveOrder = jest.fn();
    const mockSetNewOrder = jest.fn();
    const mockSetFormErrors = jest.fn();
    const mockSetModalMode = jest.fn();
    const mockOnOpen = jest.fn();

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: mockOnOpen,
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: mockSetActiveOrder,
        setModalMode: mockSetModalMode,
        setNewOrder: mockSetNewOrder,
        setFormErrors: mockSetFormErrors,
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleAddOrder();
    });

    expect(mockSetActiveOrder).toHaveBeenCalledWith(null);
    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: '',
      orderItems: [],
      status: 'PENDING',
    });
    expect(mockSetFormErrors).toHaveBeenCalledWith({});
    expect(mockSetModalMode).toHaveBeenCalledWith('add');
    expect(mockOnOpen).toHaveBeenCalled();
  });

  test('handleEditOrder が正しく動作する', () => {
    const mockSetActiveOrder = jest.fn();
    const mockSetNewOrder = jest.fn();
    const mockSetFormErrors = jest.fn();
    const mockSetModalMode = jest.fn();
    const mockOnOpen = jest.fn();

    const editableMockOrder: Order = {
      id: 'order2',
      orderNumber: 'ON002',
      orderDate: new Date().toISOString(),
      customerId: 'customer2',
      userId: 'user2',
      campaignId: null,
      customer: {
        id: 'customer2',
        name: 'Edit Customer',
        email: 'edit@example.com',
        address: '456 Edit St',
        phoneNumber: '0987654321',
        birthDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      order_items: [
        {
          id: 'item2',
          orderId: 'order2',
          productId: 'product2',
          product: {
            id: 'product2',
            name: 'Edit Product',
            price: 2000,
            description: 'Edit Description',
            stockQuantity: 200,
            category: 'EDIT',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          quantity: 2,
          unitPrice: 2000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ],
      totalAmount: 2000,
      discountApplied: 0,
      status: 'PENDING' as OrderStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: mockOnOpen,
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: mockSetActiveOrder,
        setModalMode: mockSetModalMode,
        setNewOrder: mockSetNewOrder,
        setFormErrors: mockSetFormErrors,
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleEditOrder(editableMockOrder);
    });

    expect(mockSetActiveOrder).toHaveBeenCalledWith(editableMockOrder);
    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: editableMockOrder.customer.id,
      orderItems: [
        {
          productId: editableMockOrder.order_items[0].product.id,
          quantity: Number(editableMockOrder.order_items[0].quantity),
        },
      ],
      status: editableMockOrder.status,
    });
    expect(mockSetFormErrors).toHaveBeenCalledWith({});
    expect(mockSetModalMode).toHaveBeenCalledWith('edit');
    expect(mockOnOpen).toHaveBeenCalled();
  });

  test('handleDeleteOrder が正しく動作する', () => {
    const mockSetOrderToDelete = jest.fn();
    const mockSetIsDeleteAlertOpen = jest.fn();

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
        setOrderToDelete: mockSetOrderToDelete,
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleDeleteOrder(mockOrderData);
    });

    expect(mockSetOrderToDelete).toHaveBeenCalledWith(mockOrderData);
    expect(mockSetIsDeleteAlertOpen).toHaveBeenCalledWith(true);
  });

  test('handleSubmit が不正なmodalModeの場合何もしない', async () => {
    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail', // 'add'でも'edit'でもない
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockToast).not.toHaveBeenCalled();
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  test('handleSubmit がエラー応答にメッセージが含まれない場合デフォルトメッセージを表示', async () => {
    const error = {
      response: {
        data: {
          error: {},
        },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: '注文の処理中にエラーが発生しました',
      }),
    );
  });

  test('handleEditOrder が order_items が未定義の場合も正しく動作する', () => {
    const mockSetActiveOrder = jest.fn();
    const mockSetNewOrder = jest.fn();
    const mockSetFormErrors = jest.fn();
    const mockSetModalMode = jest.fn();
    const mockOnOpen = jest.fn();

    const orderWithoutItems: Order = {
      id: 'order3',
      orderNumber: 'ON003',
      orderDate: new Date().toISOString(),
      customerId: 'customer3',
      userId: 'user3',
      campaignId: null,
      customer: {
        id: 'customer3',
        name: 'Test Customer',
        email: 'test@example.com',
        address: '789 Test St',
        phoneNumber: '1234567890',
        birthDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      order_items: [],
      totalAmount: 0,
      discountApplied: 0,
      status: 'PENDING' as OrderStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: mockOnOpen,
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: mockSetActiveOrder,
        setModalMode: mockSetModalMode,
        setNewOrder: mockSetNewOrder,
        setFormErrors: mockSetFormErrors,
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleEditOrder(orderWithoutItems);
    });

    expect(mockSetActiveOrder).toHaveBeenCalledWith(orderWithoutItems);
    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: orderWithoutItems.customer.id,
      orderItems: [],
      status: orderWithoutItems.status,
    });
  });

  test('confirmDelete がエラーレスポンスの構造が不完全な場合もデフォルトメッセージを表示する', async () => {
    const incompleteError = {
      response: {
        data: {},
      },
    };
    mockedAxios.delete.mockRejectedValueOnce(incompleteError);

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: mockOrderData,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '削除に失敗しました',
        description: '注文の削除中にエラーが発生しました。',
        status: 'error',
      }),
    );
  });

  test('confirmDelete がエラーレスポンスの構造が不完全な場合もデフォルトメッセージを表示する', async () => {
    const incompleteError = {
      response: {
        data: {},
      },
    };
    mockedAxios.delete.mockRejectedValueOnce(incompleteError);

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: mockOrderData,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: jest.fn(),
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '削除に失敗しました',
        description: '注文の削除中にエラーが発生しました。',
        status: 'error',
      }),
    );
  });

  test('handleEditOrder が order_items が未定義かつnullの場合も正しく動作する', () => {
    const mockSetActiveOrder = jest.fn();
    const mockSetNewOrder = jest.fn();
    const mockSetFormErrors = jest.fn();
    const mockSetModalMode = jest.fn();
    const mockOnOpen = jest.fn();

    const orderWithNullItems = {
      ...mockOrderData,
      order_items: null,
    } as unknown as Order;

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'detail',
        activeOrder: null,
        orderToDelete: null,
        newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
        searchTerm: '',
        statusFilter: null,
        dateRange: { start: null, end: null },
        onOpen: mockOnOpen,
        onClose: jest.fn(),
        setOrders: jest.fn(),
        setTotalCount: jest.fn(),
        setPage: jest.fn(),
        setActiveOrder: mockSetActiveOrder,
        setModalMode: mockSetModalMode,
        setNewOrder: mockSetNewOrder,
        setFormErrors: mockSetFormErrors,
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleEditOrder(orderWithNullItems);
    });

    expect(mockSetActiveOrder).toHaveBeenCalledWith(orderWithNullItems);
    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: orderWithNullItems.customer.id,
      orderItems: [],
      status: orderWithNullItems.status,
    });
    expect(mockSetFormErrors).toHaveBeenCalledWith({});
    expect(mockSetModalMode).toHaveBeenCalledWith('edit');
    expect(mockOnOpen).toHaveBeenCalled();
  });
});
