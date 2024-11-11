import { renderHook, act, waitFor } from "@testing-library/react";
import { useWebSocket } from "../../hooks/useWebSocket";
import * as Pusher from "pusher-js";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "../../features/orders/ordersSlice";
import customersReducer from "../../features/customers/customersSlice";
import authReducer from "../../features/auth/authSlice";
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";

jest.mock("pusher-js");

function createTestStore() {
  return configureStore({
    reducer: {
      orders: ordersReducer,
      customers: customersReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
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

describe("useWebSocket", () => {
  let mockPusherInstance: any;
  let mockCustomerChannel: any;
  let mockUserChannel: any;

  beforeEach(() => {
    mockCustomerChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockUserChannel = {
      bind: jest.fn(),
      unbind_all: jest.fn(),
    };

    mockPusherInstance = {
      subscribe: jest.fn((channel: string) => {
        if (channel === "customer-stats") {
          return mockCustomerChannel;
        } else if (channel === "user-stats") {
          return mockUserChannel;
        }
      }),
      connection: {
        bind: jest.fn(),
        state: "connected",
        disconnect: jest.fn(),
      },
      unsubscribe: jest.fn(),
      disconnect: jest.fn(),
    };

    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = "test-key";
    process.env.NEXT_PUBLIC_PUSHER_HOST = "test-host";
    process.env.NEXT_PUBLIC_PUSHER_PORT = "6001";
    process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER = "test-cluster";

    (Pusher as unknown as jest.Mock).mockImplementation(
      () => mockPusherInstance
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Pusherインスタンスが初期化されると、顧客とユーザーチャンネルがサブスクライブされる", () => {
    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    // チャンネルのサブスクライブを確認
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith("customer-stats");
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith("user-stats");

    // connection.bindの呼び出しを確認
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      "connected",
      expect.any(Function)
    );
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
  });

  it("PusherのCustomerCountUpdatedイベントを受信すると、totalCountとchangeRateが更新される", () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    act(() => {
      const eventData = {
        totalCount: 100,
        previousTotalCount: 90,
        changeRate: 10,
      };

      type BindCall = [string, (data: typeof eventData) => void];

      mockCustomerChannel.bind.mock.calls
        .filter(
          (call: BindCall) => call[0] === "App\\Events\\CustomerCountUpdated"
        )
        .forEach((call: BindCall) => call[1](eventData));
    });

    expect(result.current.totalCount).toBe(100);
    expect(result.current.changeRate).toBe(10);
  });

  it("クリーンアップ時にPusherの接続が切断され、チャンネルの購読が解除される", async () => {
    const { unmount } = renderHook(() => useWebSocket(), {
      wrapper: createWrapper(),
    });

    unmount();

    await waitFor(() => {
      expect(mockCustomerChannel.unbind_all).toHaveBeenCalled();
      expect(mockUserChannel.unbind_all).toHaveBeenCalled();
      expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith(
        "customer-stats"
      );
      expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith("user-stats");
      expect(mockPusherInstance.disconnect).toHaveBeenCalled();
    });
  });

  it("Pusherのキーが定義されていない場合にエラーを出力する", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = "";

    renderHook(() => useWebSocket(), { wrapper: createWrapper() });

    expect(console.error).toHaveBeenCalledWith("Pusher key is not defined");

    spy.mockRestore();
  });
});
