import { renderHook, waitFor } from '@testing-library/react';
import { useOrderStats } from '../useOrderStats';
import {
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
} from 'react-redux';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import {
  setOrderStats,
  setStatsLoading,
  setStatsError,
} from '@/features/orders/ordersSlice';

const useDispatch = originalUseDispatch as unknown as jest.Mock;
const useSelector = originalUseSelector as unknown as jest.Mock;

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));

jest.mock('axios');

describe('useOrderStatsのテスト', () => {
  const mockDispatch = jest.fn();
  const mockToast = jest.fn();
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation(selector =>
      selector({
        orders: {
          stats: { totalCount: 100, previousCount: 80, changeRate: 25 },
          status: 'idle',
          error: null,
        },
      }),
    );
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('初期状態でfetchInitialStatsが呼び出される', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        stats: { totalCount: 100, previousCount: 80, changeRate: 25 },
      },
    });

    const { result } = renderHook(() => useOrderStats());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setStatsLoading());
      expect(mockDispatch).toHaveBeenCalledWith(
        setOrderStats({ totalCount: 100, previousCount: 80, changeRate: 25 }),
      );
    });

    expect(result.current.orderStats).toEqual({
      totalCount: 100,
      previousCount: 80,
      changeRate: 25,
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useOrderStats());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setStatsLoading());
      expect(mockDispatch).toHaveBeenCalledWith(
        setStatsError('統計データの取得に失敗しました'),
      );
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'エラー',
        description: '統計データの取得中にエラーが発生しました',
        status: 'error',
      }),
    );
  });
});
