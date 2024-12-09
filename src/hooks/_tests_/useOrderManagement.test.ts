import { renderHook, act } from '@testing-library/react';
import { useOrderManagement } from '../useOrderManagement';
import { useToast, useDisclosure } from '@chakra-ui/react';
import type { Order, OrderStatus, FetchOrdersResponse } from '@/types/order';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
  useDisclosure: jest.fn(),
}));

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

describe('useOrderManagement', () => {
  const mockDispatch = jest.fn();
  const mockToast = jest.fn();

  const createResponse = (data: Order[] = []): FetchOrdersResponse => ({
    data: { data },
    meta: {
      current_page: 1,
      total_pages: data.length > 0 ? 1 : 0,
      total: data.length,
    },
  });

  const createMockOrder = (): Order => ({
    id: '1',
    orderNumber: 'ORD-001',
    orderDate: new Date().toISOString(),
    totalAmount: 1000,
    status: 'PENDING' as OrderStatus,
    discountApplied: 0,
    customerId: 'customer1',
    userId: 'user1',
    campaignId: null,
    customer: { id: 'customer1', name: 'Test Customer' } as any,
    order_items: [],
    orderItems: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const useDispatchMock = jest.requireMock('react-redux').useDispatch;
    useDispatchMock.mockReturnValue(mockDispatch);

    const useSelectorMock = jest.requireMock('react-redux').useSelector;
    useSelectorMock.mockImplementation((selector: any) =>
      selector({
        orders: {
          orders: [],
          status: 'idle',
          error: null,
          stats: {
            totalCount: null,
            previousCount: null,
            changeRate: null,
          },
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          filterParams: {},
        },
      }),
    );

    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });

    // デフォルトのモックレスポンスを設定
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(createResponse()),
    }));
  });

  it('初期状態が正しく設定される', async () => {
    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      expect(result.current.searchTerm).toBe('');
      expect(result.current.orders).toEqual([]);
      expect(result.current.status).toBe('succeeded');
      expect(result.current.error).toBeNull();
    });
  });

  it('検索が成功し、以前の検索結果がリセットされる', async () => {
    const mockOrder = createMockOrder();

    mockDispatch
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse()),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse([mockOrder])),
      }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      result.current.handleSearchChange({
        target: { value: 'test' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSearchSubmit();
    });

    expect(result.current.searchTerm).toBe('test');
    expect(result.current.orders).toHaveLength(1);
  });

  it('検索結果が空の場合、適切なメッセージが表示される', async () => {
    mockDispatch
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse()),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse([])),
      }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      await result.current.handleSearchSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '検索結果がありません',
        status: 'info',
      }),
    );
  });

  it('異なる検索を実行すると前の検索結果がリセットされる', async () => {
    const mockOrder = createMockOrder();

    mockDispatch
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse()),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse([mockOrder])),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(createResponse([])),
      }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // キーワード検索を実行
    await act(async () => {
      result.current.handleSearchChange({
        target: { value: 'test' },
      } as React.ChangeEvent<HTMLInputElement>);
      await result.current.handleSearchSubmit();
    });

    expect(result.current.orders).toHaveLength(1);

    // ステータス検索を実行（前の検索結果がリセットされる）
    await act(async () => {
      await result.current.handleStatusFilter('PENDING');
    });

    expect(result.current.orders).toHaveLength(0);
  });
});
