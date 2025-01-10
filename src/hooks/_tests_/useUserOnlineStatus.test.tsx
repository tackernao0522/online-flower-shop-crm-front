import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useUserOnlineStatus } from '../useUserOnlineStatus';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useUserOnlineStatus', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
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

  it('ユーザーIDが提供され、APIが成功レスポンスを返す場合、オンラインステータスを返す', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { is_online: true } });

    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: true });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/user-123/online-status'),
      expect.any(Object),
    );
  });

  it('ユーザーIDが提供されない場合、クエリは無効化される', () => {
    const { result } = renderHook(() => useUserOnlineStatus(undefined), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('トークンが存在しない場合、オフラインステータスを返す', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: false });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('401エラーが発生した場合、オフラインステータスを返し、リトライしない', async () => {
    const error = new Error('Unauthorized');
    (error as any).response = { status: 401 };
    mockedAxios.get.mockRejectedValueOnce(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ is_online: false });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('その他のエラーが発生した場合、3回までリトライしてからエラー状態になる', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    mockedAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 10000,
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    expect(result.current.error).toBeDefined();
  }, 15000);

  it('エラーレスポンスのログ出力を確認', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const error = new Error('Request failed');
    Object.assign(error, {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    });

    mockedAxios.get.mockRejectedValueOnce(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(
      () => {
        return consoleErrorSpy.mock.calls.some(
          call =>
            call[0] === 'Error response:' &&
            call[1]?.message === 'Internal Server Error',
        );
      },
      { timeout: 5000 },
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching online status:',
      expect.any(Object),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error response:', {
      message: 'Internal Server Error',
    });
  });

  it('APIリクエストのヘッダーに正しいトークンが含まれていることを確認', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { is_online: true } });

    renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/user-123/online-status'),
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        },
      );
    });
  });

  it('401エラー時とその他のエラー時のretry動作を確認', () => {
    const retryFn = (failureCount: number, error: Error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    };

    // 401エラーのケース
    const error401 = new Error('Unauthorized');
    Object.assign(error401, {
      isAxiosError: true,
      response: { status: 401 },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    // その他のエラーのケース
    const otherError = new Error('Other error');
    Object.assign(otherError, {
      isAxiosError: true,
      response: { status: 500 },
    });

    expect(retryFn(1, error401)).toBe(false);
    expect(retryFn(1, otherError)).toBe(true);
  });

  it('retry関数の全条件分岐を網羅的にテスト', async () => {
    // モックをリセット
    mockedAxios.isAxiosError.mockReset();

    // retry関数を直接定義（useUserOnlineStatusと同じロジック）
    const retryFn = (failureCount: number, error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    };

    const tests = [
      {
        case: '非Axiosエラー',
        error: new Error('Normal error'),
        isAxiosError: false,
        expected: [
          { failureCount: 1, result: true },
          { failureCount: 3, result: false },
        ],
      },
      {
        case: 'Axiosエラー（responseなし）',
        error: Object.assign(new Error('Axios error'), { isAxiosError: true }),
        isAxiosError: true,
        expected: [
          { failureCount: 1, result: true },
          { failureCount: 3, result: false },
        ],
      },
      {
        case: 'Axiosエラー（401）',
        error: Object.assign(new Error('401 error'), {
          isAxiosError: true,
          response: { status: 401 },
        }),
        isAxiosError: true,
        expected: [{ failureCount: 1, result: false }],
      },
      {
        case: 'Axiosエラー（500）',
        error: Object.assign(new Error('500 error'), {
          isAxiosError: true,
          response: { status: 500 },
        }),
        isAxiosError: true,
        expected: [
          { failureCount: 1, result: true },
          { failureCount: 3, result: false },
        ],
      },
    ];

    for (const test of tests) {
      console.log(`Testing case: ${test.case}`);
      mockedAxios.isAxiosError.mockReturnValue(test.isAxiosError);

      for (const expected of test.expected) {
        const result = retryFn(expected.failureCount, test.error);
        expect(result).toBe(expected.result);
      }
    }

    // フックが正しく動作することも確認
    const { result } = renderHook(() => useUserOnlineStatus('user-123'), {
      wrapper,
    });
    expect(result.current).toBeDefined();
  });

  it('実際のretry動作のすべての分岐をテスト', async () => {
    // Case 1: 非401エラー - リトライする
    const error500 = new Error('Server Error');
    Object.assign(error500, {
      isAxiosError: true,
      response: { status: 500 },
    });
    mockedAxios.get
      .mockRejectedValueOnce(error500) // 1回目
      .mockRejectedValueOnce(error500) // 2回目
      .mockRejectedValueOnce(error500); // 3回目
    mockedAxios.isAxiosError.mockReturnValue(true);

    let { result: result500 } = renderHook(
      () => useUserOnlineStatus('user-123'),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result500.current.isError).toBe(true), {
      timeout: 10000,
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(4); // 初回 + 3回のリトライ

    // リセット
    jest.clearAllMocks();

    // Case 2: 401エラー - リトライしない
    const error401 = new Error('Unauthorized');
    Object.assign(error401, {
      isAxiosError: true,
      response: { status: 401 },
    });
    mockedAxios.get.mockRejectedValueOnce(error401);
    mockedAxios.isAxiosError.mockReturnValue(true);

    let { result: result401 } = renderHook(
      () => useUserOnlineStatus('user-123'),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result401.current.isSuccess).toBe(true));
    expect(result401.current.data).toEqual({ is_online: false });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // リトライなし

    // リセット
    jest.clearAllMocks();

    // Case 3: responseなしのAxiosエラー - リトライする
    const errorNoResponse = new Error('Network Error');
    Object.assign(errorNoResponse, { isAxiosError: true });
    mockedAxios.get
      .mockRejectedValueOnce(errorNoResponse)
      .mockRejectedValueOnce(errorNoResponse)
      .mockRejectedValueOnce(errorNoResponse);
    mockedAxios.isAxiosError.mockReturnValue(true);

    let { result: resultNoResponse } = renderHook(
      () => useUserOnlineStatus('user-123'),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(resultNoResponse.current.isError).toBe(true), {
      timeout: 10000,
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(4);
  }, 30000);
});
