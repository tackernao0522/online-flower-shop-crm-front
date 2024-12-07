import { renderHook, act } from '@testing-library/react';
import { useOrderOperations } from '../useOrderOperations';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';

jest.mock('axios');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));
jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

describe('useOrderOperations フック', () => {
  let mockDispatch: jest.Mock;
  let mockToast: jest.Mock;
  let mockSetIsDeleteAlertOpen: jest.Mock;
  let mockSetOrderToDelete: jest.Mock;
  let mockSetOrders: jest.Mock;
  let mockSetTotalCount: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockToast = jest.fn();
    mockSetIsDeleteAlertOpen = jest.fn();
    mockSetOrderToDelete = jest.fn();
    mockSetOrders = jest.fn();
    mockSetTotalCount = jest.fn();

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useToast as jest.Mock).mockReturnValue(mockToast);

    jest.clearAllMocks();
  });

  test('handleAddOrder が正しく動作する', () => {
    const mockSetNewOrder = jest.fn();
    const mockOnOpen = jest.fn();

    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'add',
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
        setActiveOrder: jest.fn(),
        setModalMode: jest.fn(),
        setNewOrder: mockSetNewOrder,
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleAddOrder();
    });

    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: '',
      orderItems: [],
      status: 'PENDING',
    });
    expect(mockOnOpen).toHaveBeenCalled();
  });

  //   test('confirmDelete が正しく動作する', async () => {
  //     const mockOrderToDelete = { id: 'order1' }; // 削除対象の注文をモック

  //     // axios.delete のモック
  //     (axios.delete as jest.Mock).mockResolvedValueOnce({});

  //     // dispatch(fetchOrdersAction) のモック
  //     mockDispatch.mockResolvedValueOnce({
  //       unwrap: jest.fn().mockResolvedValue({
  //         data: { data: [], meta: { total: 0 } },
  //       }),
  //     });

  //     const { result } = renderHook(() =>
  //       useOrderOperations({
  //         modalMode: 'detail',
  //         activeOrder: null,
  //         orderToDelete: mockOrderToDelete,
  //         newOrder: { customerId: '', orderItems: [], status: 'PENDING' },
  //         searchTerm: '',
  //         statusFilter: null,
  //         dateRange: { start: null, end: null },
  //         onOpen: jest.fn(),
  //         onClose: jest.fn(),
  //         setOrders: mockSetOrders,
  //         setTotalCount: mockSetTotalCount,
  //         setPage: jest.fn(),
  //         setActiveOrder: jest.fn(),
  //         setModalMode: jest.fn(),
  //         setNewOrder: jest.fn(),
  //         setFormErrors: jest.fn(),
  //         setIsDeleteAlertOpen: mockSetIsDeleteAlertOpen,
  //         setOrderToDelete: mockSetOrderToDelete,
  //         fetchOrders: jest.fn(),
  //       }),
  //     );

  //     await act(async () => {
  //       await result.current.confirmDelete();
  //     });

  //     // デバッグログを確認
  //     console.log(
  //       'mockSetIsDeleteAlertOpen calls:',
  //       mockSetIsDeleteAlertOpen.mock.calls,
  //     );
  //     console.log('mockSetOrderToDelete calls:', mockSetOrderToDelete.mock.calls);
  //     console.log('mockSetOrders calls:', mockSetOrders.mock.calls);
  //     console.log('mockSetTotalCount calls:', mockSetTotalCount.mock.calls);

  //     // 呼び出し確認
  //     expect(axios.delete).toHaveBeenCalledWith(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/order1`,
  //       {
  //         headers: {
  //           Authorization: `Bearer null`,
  //         },
  //       },
  //     );

  //     expect(mockDispatch).toHaveBeenCalledWith(
  //       fetchOrdersAction({
  //         page: 1,
  //         per_page: 15,
  //         search: '',
  //         status: null,
  //         start_date: undefined,
  //         end_date: undefined,
  //       }),
  //     );

  //     expect(mockSetIsDeleteAlertOpen).toHaveBeenCalledWith(false);
  //     expect(mockSetOrderToDelete).toHaveBeenCalledWith(null);
  //     expect(mockSetOrders).toHaveBeenCalledWith([]);
  //     expect(mockSetTotalCount).toHaveBeenCalledWith(0);
  //     expect(mockToast).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         title: '注文を削除しました',
  //         status: 'success',
  //       }),
  //     );
  //   });

  test('handleEditOrder が正しく動作する', () => {
    const mockSetActiveOrder = jest.fn();
    const mockSetNewOrder = jest.fn();
    const mockOnOpen = jest.fn();
    const { result } = renderHook(() =>
      useOrderOperations({
        modalMode: 'edit',
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
        setModalMode: jest.fn(),
        setNewOrder: mockSetNewOrder,
        setFormErrors: jest.fn(),
        setIsDeleteAlertOpen: jest.fn(),
        setOrderToDelete: jest.fn(),
        fetchOrders: jest.fn(),
      }),
    );

    const mockOrder = {
      id: 'order1',
      customer: { id: 'customer1', name: 'John Doe' },
      order_items: [
        { product: { id: 'product1' }, quantity: 2 },
        { product: { id: 'product2' }, quantity: 3 },
      ],
      status: 'PENDING',
    };

    act(() => {
      result.current.handleEditOrder(mockOrder as any);
    });

    expect(mockSetActiveOrder).toHaveBeenCalledWith(mockOrder);
    expect(mockSetNewOrder).toHaveBeenCalledWith({
      customerId: 'customer1',
      orderItems: [
        { productId: 'product1', quantity: 2 },
        { productId: 'product2', quantity: 3 },
      ],
      status: 'PENDING',
    });
    expect(mockOnOpen).toHaveBeenCalled();
  });
});
