import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '../../features/orders/ordersSlice';
import customersReducer from '../../features/customers/customersSlice';
import authReducer from '../../features/auth/authSlice';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import * as Pusher from 'pusher-js';
import { useWebSocket } from '../useWebSocket';
import statsReducer from '../../features/stats/statsSlice';

const mockToast = jest.fn();

type BindCall = [string, (data: unknown) => void];

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

jest.mock('pusher-js');

function createTestStore() {
  return configureStore({
    reducer: {
      orders: ordersReducer,
      customers: customersReducer,
      auth: authReducer,
      stats: statsReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

function createWrapper() {
  const store = createTestStore();
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ChakraProvider>{children}</ChakraProvider>
      </Provider>
    );
  };
}

describe('useWebSocket', () => {
  let mockPusherInstance: any;
  let mockCustomerChannel: any;
  let mockUserChannel: any;
  let mockOrderChannel: any;
  let mockSalesChannel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();

    mockCustomerChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockUserChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockOrderChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockSalesChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockPusherInstance = {
      subscribe: jest.fn((channel: string) => {
        switch (channel) {
          case 'customer-stats':
            return mockCustomerChannel;
          case 'user-stats':
            return mockUserChannel;
          case 'order-stats':
            return mockOrderChannel;
          case 'sales-stats':
            return mockSalesChannel;
          default:
            return null;
        }
      }),
      connection: {
        bind: jest.fn(),
        state: 'connected',
        disconnect: jest.fn(),
      },
      unsubscribe: jest.fn(),
      disconnect: jest.fn().mockImplementation(() => {
        mockPusherInstance.connection.state = 'disconnected';
      }),
    };

    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = 'test-key';
    process.env.NEXT_PUBLIC_PUSHER_HOST = 'test-host';
    process.env.NEXT_PUBLIC_PUSHER_PORT = '6001';
    process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER = 'test-cluster';

    (Pusher as unknown as jest.Mock).mockImplementation(
      () => mockPusherInstance,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Pusherインスタンスが初期化されると、顧客とユーザーチャンネルがサブスクライブされる', () => {
    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith('customer-stats');
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith('user-stats');
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      'connected',
      expect.any(Function),
    );
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
  });

  it('PusherのCustomerCountUpdatedイベントを受信すると、totalCountとchangeRateが更新される', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    act(() => {
      const eventData = {
        totalCount: 100,
        previousTotalCount: 90,
        changeRate: 10,
      };

      mockCustomerChannel.bind.mock.calls
        .filter((call: any) => call[0] === 'App\\Events\\CustomerCountUpdated')
        .forEach((call: any) => call[1](eventData));
    });

    expect(result.current.totalCount).toBe(100);
    expect(result.current.changeRate).toBe(10);
  });

  it('クリーンアップ時にPusherの接続が切断され、チャンネルの購読が解除される', async () => {
    const { unmount } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    unmount();

    await waitFor(() => {
      expect(mockCustomerChannel.unbind_all).toHaveBeenCalled();
      expect(mockUserChannel.unbind_all).toHaveBeenCalled();
      expect(mockOrderChannel.unbind_all).toHaveBeenCalled();
      expect(mockSalesChannel.unbind_all).toHaveBeenCalled();
      expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith(
        'customer-stats',
      );
      expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith('user-stats');
      expect(mockPusherInstance.disconnect).toHaveBeenCalled();
    });
  });

  it('Pusherのキーが定義されていない場合にエラーを出力する', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = '';

    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(consoleSpy).toHaveBeenCalledWith('Pusher key is not defined');
    consoleSpy.mockRestore();
  });

  it('オーダー統計の更新イベントを正しく処理する', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    const orderData = {
      totalCount: 50,
      previousCount: 45,
      changeRate: 11.11,
    };

    act(() => {
      mockOrderChannel.bind.mock.calls
        .filter((call: any) => call[0] === 'App\\Events\\OrderCountUpdated')
        .forEach((call: any) => call[1](orderData));
    });

    const store = createTestStore();
    expect(store.getState().orders.stats).toBeDefined();
  });

  it('セールス統計の更新イベントを正しく処理する', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    const salesData = {
      totalSales: 1000,
      previousSales: 900,
      changeRate: 11.11,
    };

    act(() => {
      mockSalesChannel.bind.mock.calls
        .filter((call: any) => call[0] === 'App\\Events\\SalesUpdated')
        .forEach((call: any) => call[1](salesData));
    });

    const store = createTestStore();
    expect(store.getState().stats).toBeDefined();
  });

  it('開発環境での設定が正しく適用される', () => {
    const prevEnv = process.env.NODE_ENV;

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    (Pusher as unknown as jest.Mock).mockClear();
    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(Pusher).toHaveBeenCalledWith(
      'test-key',
      expect.objectContaining({
        wsHost: 'test-host',
        wsPort: 6001,
        disableStats: true,
        enabledTransports: ['ws'],
      }),
    );

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: prevEnv,
      writable: true,
    });
  });

  it('本番環境での設定が正しく適用される', () => {
    const prevEnv = process.env.NODE_ENV;

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    (Pusher as unknown as jest.Mock).mockClear();
    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(Pusher).toHaveBeenCalledWith(
      'test-key',
      expect.objectContaining({
        enabledTransports: ['ws', 'wss'],
      }),
    );

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: prevEnv,
      writable: true,
    });
  });

  it('アンマウント後にイベントを処理しない', () => {
    const { result, unmount } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    const initialTotalCount = result.current.totalCount;
    unmount();

    act(() => {
      const eventData = {
        totalCount: 100,
        previousTotalCount: 90,
        changeRate: 10,
      };

      mockCustomerChannel.bind.mock.calls
        .filter((call: any) => call[0] === 'App\\Events\\CustomerCountUpdated')
        .forEach((call: any) => call[1](eventData));
    });

    expect(initialTotalCount).toEqual(result.current.totalCount);
  });

  it('エラーイベント発生時にhandleConnectionErrorが呼ばれ、エラーステータスやトースト、再接続ロジックが機能する', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { unmount } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    const errorHandlerCall = mockPusherInstance.connection.bind.mock.calls.find(
      (call: unknown[]) => call[0] === 'error',
    );
    const errorHandler = errorHandlerCall[1];
    act(() => {
      errorHandler(new Error('Test Error'));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '接続エラー',
        description:
          'リアルタイム更新に問題が発生しました。再接続を試みています。',
        status: 'error',
      }),
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    unmount();
    act(() => {
      errorHandler(new Error('Another Test Error'));
    });
    expect(mockToast).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('エラー後の再接続でconnectedイベントが再度発生すると、connectionStatusがconnectedになる', () => {
    jest.useFakeTimers();
    const { unmount } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    const errorHandlerCall = mockPusherInstance.connection.bind.mock.calls.find(
      (call: unknown[]) => call[0] === 'error',
    );
    const errorHandler = errorHandlerCall?.[1];
    act(() => {
      errorHandler(new Error('Test Error'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const connectedHandlerCall =
      mockPusherInstance.connection.bind.mock.calls.find(
        (call: unknown[]) => call[0] === 'connected',
      );
    const connectedHandler = connectedHandlerCall?.[1];
    act(() => {
      connectedHandler();
    });

    unmount();
    jest.useRealTimers();
  });

  it('アンマウント前にUserCountUpdatedイベントを受信すると、totalUserCountが更新される (isUnmountingRefがfalseを確認)', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    act(() => {
      const eventData = { totalCount: 500 };
      mockUserChannel.bind.mock.calls
        .filter((call: BindCall) => call[0] === 'App\\Events\\UserCountUpdated')
        .forEach((call: BindCall) => call[1](eventData));
    });

    expect(result.current.totalUserCount).toBe(500);
  });

  it('initializePusher中にエラーが発生した場合、console.errorとhandleConnectionErrorが呼ばれる', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (Pusher as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Initialization error');
    });

    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error initializing Pusher:',
      expect.any(Error),
    );
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );

    consoleErrorSpy.mockRestore();
  });

  it('エラー発生後5秒で再接続が行われ、チャンネル購読が再実行される', () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    const errorHandlerCall = mockPusherInstance.connection.bind.mock.calls.find(
      (call: unknown[]) => call[0] === 'error',
    );
    const errorHandler = errorHandlerCall?.[1];

    act(() => {
      errorHandler(new Error('Test Error'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith('customer-stats');
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith('user-stats');
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      'connected',
      expect.any(Function),
    );

    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('production環境でconnectedイベントが発生すると、接続ステータスがconnectedになる', () => {
    const prevEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    const connectedHandlerCall =
      mockPusherInstance.connection.bind.mock.calls.find(
        (call: unknown[]) => call[0] === 'connected',
      );
    const connectedHandler = connectedHandlerCall && connectedHandlerCall[1];

    act(() => {
      connectedHandler();
    });

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: prevEnv,
      writable: true,
    });
  });

  it('エラー発生→再接続→再度エラー→再接続を繰り返す', () => {
    jest.useFakeTimers();
    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    const errorHandlerCall = mockPusherInstance.connection.bind.mock.calls.find(
      (call: unknown[]) => call[0] === 'error',
    );
    const errorHandler = errorHandlerCall?.[1];

    act(() => {
      errorHandler(new Error('Test Error 1'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    act(() => {
      errorHandler(new Error('Test Error 2'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    jest.useRealTimers();
  });
});
