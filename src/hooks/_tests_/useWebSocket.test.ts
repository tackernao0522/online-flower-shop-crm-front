import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "../../hooks/useWebSocket";
import * as Pusher from "pusher-js";

jest.mock("pusher-js");

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

    // 環境変数をモック
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
    renderHook(() => useWebSocket());

    // 顧客とユーザーチャンネルのサブスクライブが呼ばれていることを確認
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith("customer-stats");
    expect(mockPusherInstance.subscribe).toHaveBeenCalledWith("user-stats");

    // 接続状態とエラーバインドが呼ばれていることを確認
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      "state_change",
      expect.any(Function)
    );
    expect(mockPusherInstance.connection.bind).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
  });

  it("PusherのCustomerCountUpdatedイベントを受信すると、totalCountとchangeRateが更新される", () => {
    const { result } = renderHook(() => useWebSocket());

    // CustomerCountUpdated イベントをトリガー
    act(() => {
      mockCustomerChannel.bind.mock.calls[0][1]({
        totalCount: 100,
        previousTotalCount: 90,
        changeRate: 10,
      });
    });

    // totalCountとchangeRateが更新されたことを確認
    expect(result.current.totalCount).toBe(100);
    expect(result.current.changeRate).toBe(10);
  });

  it("PusherのUserCountUpdatedイベントを受信すると、totalUserCountが更新される", () => {
    const { result } = renderHook(() => useWebSocket());

    // UserCountUpdated イベントをトリガー
    act(() => {
      mockUserChannel.bind.mock.calls[0][1]({
        totalCount: 50,
      });
    });

    // totalUserCountが更新されたことを確認
    expect(result.current.totalUserCount).toBe(50);
  });

  it("クリーンアップ時にPusherの接続が切断され、チャンネルの購読が解除される", () => {
    const { unmount } = renderHook(() => useWebSocket());

    // フックのクリーンアップ
    unmount();

    // チャンネルの購読解除とPusherの切断が呼ばれていることを確認
    expect(mockCustomerChannel.unbind_all).toHaveBeenCalled();
    expect(mockUserChannel.unbind_all).toHaveBeenCalled();
    expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith(
      "customer-stats"
    );
    expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith("user-stats");
    expect(mockPusherInstance.disconnect).toHaveBeenCalled();
  });

  it("Pusherのキーが定義されていない場合にエラーを出力する", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Pusherキーを未定義に設定
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = "";

    renderHook(() => useWebSocket());

    expect(console.error).toHaveBeenCalledWith("Pusher key is not defined");

    spy.mockRestore();
  });
});
