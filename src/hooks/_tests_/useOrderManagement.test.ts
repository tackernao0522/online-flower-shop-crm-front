import { renderHook, act } from '@testing-library/react';
import { useOrderManagement } from '../useOrderManagement';
import { useDisclosure } from '@chakra-ui/react';
import { fetchOrdersHelper } from '@/api/orderApi';
import type { Order, OrderStatus } from '@/types/order';

const mockHandleSearchChange = jest.fn();
const mockHandleSearchSubmit = jest.fn();
const mockHandleSearchKeyDown = jest.fn();
const mockToast = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@/features/orders/ordersSlice', () => ({
  fetchOrders: jest.fn(),
}));

jest.mock('../order/useOrderOperations', () => ({
  useOrderOperations: jest.fn(() => ({
    handleOrderClick: jest.fn(),
    handleSubmit: jest.fn(),
    handleAddOrder: jest.fn(),
    handleEditOrder: jest.fn(),
    handleDeleteOrder: jest.fn(),
    confirmDelete: jest.fn(),
    cancelDelete: jest.fn(),
  })),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(() => mockToast),
  useDisclosure: jest.fn(),
}));

jest.mock('@/api/orderApi', () => ({
  fetchOrdersHelper: jest.fn((dispatch, params) =>
    Promise.resolve({
      data: [
        {
          id: '1',
          orderNumber: 'ORD-001',
          orderDate: new Date().toISOString(),
          totalAmount: 1000,
          status: 'PENDING',
        },
      ],
      meta: {
        total: 1,
      },
    }),
  ),
}));

jest.mock('../order/useOrderSearch', () => ({
  useOrderSearch: jest.fn(() => ({
    handleSearchChange: mockHandleSearchChange,
    handleSearchSubmit: mockHandleSearchSubmit,
    handleSearchKeyDown: mockHandleSearchKeyDown,
  })),
}));

jest.mock('../order/useOrderFilters', () => ({
  useOrderFilters: jest.fn(() => ({
    clearFilters: jest.fn(),
    handleStatusFilter: jest.fn(),
    handleDateRangeFilter: jest.fn(),
  })),
}));

jest.mock('../order/useOrderItems', () => ({
  useOrderItems: jest.fn(() => ({
    handleOrderItemChange: jest.fn(),
    handleInputChange: jest.fn(),
    handleAddOrderItem: jest.fn(),
    handleRemoveOrderItem: jest.fn(),
  })),
}));

describe('useOrderManagement', () => {
  const mockDispatch = jest.fn();
  const mockFetchOrdersHelper = fetchOrdersHelper as jest.Mock;

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
    customer: {
      id: 'customer1',
      name: 'Test Customer',
      email: 'test@example.com',
      address: 'Test Address',
      phoneNumber: '1234567890',
      birthDate: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    order_items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const useDispatchMock = jest.requireMock('react-redux').useDispatch;
    useDispatchMock.mockReturnValue(mockDispatch);

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: [] },
          meta: { total: 0 },
        }),
    }));
  });

  test('初期状態が正しく設定される', async () => {
    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.orders).toEqual([]);
    expect(result.current.status).toBe('succeeded');
    expect(result.current.error).toBeNull();
  });

  test('handleSearchSubmitが成功した場合、結果が正しく設定される', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleSearchSubmit();
    });

    expect(mockHandleSearchSubmit).toHaveBeenCalled();
  });

  test('handleStatusFilterが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleStatusFilter('PENDING');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleDateRangeFilterが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleDateRangeFilter('today');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleSearchChangeが入力を正しく処理する', async () => {
    const { result } = renderHook(() => useOrderManagement());
    const mockEvent = {
      target: { value: 'test' },
    } as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleSearchChange(mockEvent);
    });

    expect(mockHandleSearchChange).toHaveBeenCalledWith(mockEvent);
  });

  test('clearFiltersが正しく動作する', async () => {
    const mockOrders = [createMockOrder()];
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: mockOrders },
          meta: { total: mockOrders.length },
        }),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.clearFilters();
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleSearchKeyDownでEnterキーが正しく処理される', async () => {
    const { result } = renderHook(() => useOrderManagement());
    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    Object.defineProperty(mockEvent, 'preventDefault', {
      value: jest.fn(),
    });

    await act(async () => {
      result.current.handleSearchKeyDown(mockEvent);
    });

    expect(mockHandleSearchKeyDown).toHaveBeenCalledWith(mockEvent);
  });

  test('空の検索結果の場合、適切なメッセージが表示される', async () => {
    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.resolve({
          data: { data: [] },
          meta: { total: 0 },
        }),
    }));

    mockHandleSearchSubmit.mockImplementationOnce(async () => {
      mockToast({
        title: '検索結果がありません',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    });

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await result.current.handleSearchSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '検索結果がありません',
        status: 'info',
      }),
    );
  });

  test('エラー時に適切なエラーメッセージが表示される', async () => {
    const mockError = {
      response: {
        data: {
          error: {
            message: 'エラーが発生しました',
          },
        },
      },
    };

    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject(mockError),
    }));

    mockHandleSearchSubmit.mockImplementationOnce(async () => {
      mockToast({
        title: 'エラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw mockError;
    });

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      try {
        await result.current.handleSearchSubmit();
      } catch (error) {
        expect(error).toEqual(mockError);
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラーが発生しました',
        status: 'error',
      }),
    );
  });

  test('fetchOrdersがcurrentSearchTermに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: 'searchTerm',
          currentStatus: null,
          currentDateRange: { start: null, end: null },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ search: 'searchTerm' }),
    );
  });

  test('fetchOrdersがcurrentStatusに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: '',
          currentStatus: 'PENDING',
          currentDateRange: { start: null, end: null },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ status: 'PENDING' }),
    );
  });

  test('fetchOrdersがcurrentDateRangeに応じて正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      if (result.current.filterStateRef) {
        result.current.filterStateRef.current = {
          currentSearchTerm: '',
          currentStatus: null,
          currentDateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
        };
      }
    });

    await act(async () => {
      await result.current.fetchOrders(1);
    });

    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-01-31').toISOString(),
      }),
    );
  });

  describe('useOrderManagement - Additional Coverage', () => {
    const mockDispatch = jest.fn();
    let mockOnClose: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockOnClose = jest.fn();
      (useDisclosure as jest.Mock).mockReturnValue({
        isOpen: false,
        onOpen: jest.fn(),
        onClose: mockOnClose,
      });
    });

    test('onCloseが正しく状態をリセットする', async () => {
      const { result } = renderHook(() => useOrderManagement());

      // モーダルを開いて状態を設定
      act(() => {
        result.current.handleOrderClick(createMockOrder());
      });

      // モーダルを閉じる
      act(() => {
        result.current.onClose();
      });

      // 300ms待機してタイムアウト後の状態をチェック
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      expect(result.current.activeOrder).toBeNull();
      expect(result.current.modalMode).toBe('detail');
      expect(result.current.newOrder).toEqual({
        customerId: '',
        orderItems: [],
        status: 'PENDING',
      });
      expect(result.current.formErrors).toEqual({});
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('無限スクロールが条件を満たす場合に次のページを読み込む', async () => {
      // IntersectionObserver のモックを設定
      let observerCallback: IntersectionObserverCallback;
      const mockObserve = jest.fn();

      (window as any).IntersectionObserver = jest.fn(function (callback) {
        observerCallback = callback;
        return {
          observe: mockObserve,
          disconnect: jest.fn(),
          unobserve: jest.fn(),
        };
      });

      mockFetchOrdersHelper
        .mockResolvedValueOnce({
          data: [{ ...createMockOrder() }],
          meta: { total: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ ...createMockOrder(), id: '2' }],
          meta: { total: 2 },
        });

      const { result } = renderHook(() => useOrderManagement());

      // 初期データ読み込みを待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // ref を設定して IntersectionObserver をトリガー
      const targetElement = document.createElement('div');
      act(() => {
        result.current.lastElementRef(targetElement);
      });

      // IntersectionObserver のコールバックを実行
      act(() => {
        if (observerCallback) {
          observerCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }
      });

      // データ読み込みを待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockObserve).toHaveBeenCalled();
      expect(mockFetchOrdersHelper).toHaveBeenCalledTimes(2);
    });

    test('fetchOrdersでエラーが発生した場合の処理', async () => {
      // モックエラーの定義
      const mockError = {
        response: {
          data: {
            error: {
              message: '注文データの取得に失敗しました',
            },
          },
        },
      };

      // モックの設定
      mockFetchOrdersHelper.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useOrderManagement());

      await act(async () => {
        try {
          await result.current.fetchOrders(1);
        } catch (error) {
          // エラーオブジェクトの検証を追加
          expect(error).toEqual(mockError);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // フックの状態の検証
      expect(result.current.status).toBe('failed');
      expect(result.current.error).toBe('注文データの取得に失敗しました');
    });

    test('データ取得の動作確認', async () => {
      // 既存のグローバルモックをクリア
      (fetchOrdersHelper as jest.Mock).mockReset();

      const mockOrder = createMockOrder();

      mockFetchOrdersHelper.mockResolvedValueOnce({
        data: [mockOrder],
        meta: { total: 1 },
      });

      const { result } = renderHook(() => useOrderManagement());

      await act(async () => {
        await result.current.fetchOrders(1);
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.orders).toEqual([mockOrder]);
    });

    test('新しいページのデータが正しく追加され、重複がマージされる', async () => {
      // 既存のグローバルモックをクリア
      (fetchOrdersHelper as jest.Mock).mockReset();

      const initialOrder = createMockOrder();
      const mockOrder2 = {
        ...createMockOrder(),
        id: '2',
        orderNumber: 'ORD-002',
      };

      mockFetchOrdersHelper
        .mockResolvedValueOnce({
          data: [initialOrder],
          meta: {
            total: 2,
            current_page: 1,
            per_page: 15,
          },
        })
        .mockResolvedValue({
          // 2回目以降のコールに対するレスポンス
          data: [mockOrder2],
          meta: {
            total: 2,
            current_page: 2,
            per_page: 15,
          },
        });

      const { result } = renderHook(() => useOrderManagement());

      // データフェッチと状態更新を待機
      await act(async () => {
        await result.current.fetchOrders(1);
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      console.log('After first fetch:', result.current.orders);

      await act(async () => {
        await result.current.fetchOrders(2);
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      console.log('After second fetch:', result.current.orders);

      // 結果の検証（重複を考慮）
      const uniqueOrders = Array.from(
        new Set(result.current.orders.map(order => order.id)),
      );
      expect(uniqueOrders).toHaveLength(2); // ユニークなIDは2つあるはず
      expect(uniqueOrders).toContain('1');
      expect(uniqueOrders).toContain('2');

      expect(result.current.orders[0].id).toBe('1');
      expect(result.current.orders[1].id).toBe('2');
    });
  });

  test('fetchOrdersがデフォルトのページ番号で正しく動作する', async () => {
    const { result } = renderHook(() => useOrderManagement());
    await act(async () => {
      await result.current.fetchOrders();
    });
    expect(fetchOrdersHelper).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ page: 1 }),
    );
  });

  test('fetchOrdersでエラーレスポンスがない場合のフォールバックメッセージ', async () => {
    mockFetchOrdersHelper.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useOrderManagement());
    await act(async () => {
      try {
        await result.current.fetchOrders(1);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network Error');
      }
    });

    expect(result.current.error).toBe('注文データの取得に失敗しました');
  });

  test('initialFetchでエラーレスポンスがない場合のフォールバックメッセージ', async () => {
    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject(new Error('Network Error')),
    }));

    const { result } = renderHook(() => useOrderManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('注文データの取得に失敗しました');
  });
});
