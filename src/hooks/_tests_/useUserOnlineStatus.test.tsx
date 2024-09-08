import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useUserOnlineStatus } from "../useUserOnlineStatus";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useUserOnlineStatus", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "mock-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("ユーザーIDが提供され、APIが成功レスポンスを返す場合、オンラインステータスを返す", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { is_online: true } });

    const { result } = renderHook(() => useUserOnlineStatus("user-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: true });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/users/user-123/online-status"),
      expect.any(Object)
    );
  });

  it("ユーザーIDが提供されない場合、クエリは無効化される", () => {
    const { result } = renderHook(() => useUserOnlineStatus(undefined), {
      wrapper,
    });

    expect(result.current.isIdle).toBe(undefined);
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("トークンが存在しない場合、オフラインステータスを返す", async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    const { result } = renderHook(() => useUserOnlineStatus("user-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: false });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("401エラーが発生した場合、オフラインステータスを返し、リトライしない", async () => {
    const error = new Error("Unauthorized");
    (error as any).response = { status: 401 };
    mockedAxios.get.mockRejectedValueOnce(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useUserOnlineStatus("user-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: false });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("その他のエラーが発生した場合、3回までリトライしてからエラー状態になる", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    mockedAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useUserOnlineStatus("user-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 10000,
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(4); // 初回 + 3回のリトライ
    expect(result.current.error).toBeDefined();
  }, 15000); // テストのタイムアウトを15秒に設定
});
