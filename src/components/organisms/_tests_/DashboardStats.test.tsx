import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import axios from 'axios';
import DashboardStats from '../DashboardStats';
import { useCustomerManagement } from '@/hooks/useCustomerManagement';
import { useWebSocket } from '@/hooks/useWebSocket';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '@/features/orders/ordersSlice';
import statsReducer from '@/features/stats/statsSlice';

jest.mock('axios');
jest.mock('@/hooks/useCustomerManagement');
jest.mock('@/hooks/useWebSocket');
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: jest.fn(() => jest.fn()),
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      orders: ordersReducer,
      stats: statsReducer,
    },
  });

const renderWithProviders = (
  ui: React.ReactElement,
  { store = createMockStore() } = {},
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <ChakraProvider>{children}</ChakraProvider>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
};

describe('DashboardStats', () => {
  const mockAxiosResponse = {
    data: {
      stats: {
        totalCount: 100,
        previousCount: 90,
        changeRate: 11.11,
        totalSales: 1000000,
        salesChangeRate: 15.5,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue(mockAxiosResponse);
    (useCustomerManagement as jest.Mock).mockReturnValue({ loading: false });
    (useWebSocket as jest.Mock).mockReturnValue({
      totalCount: 100,
      changeRate: 10,
      connectionStatus: 'connected',
    });
    localStorage.setItem('token', 'dummy-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('ローディング状態が正しく表示される', async () => {
    (useCustomerManagement as jest.Mock).mockReturnValue({ loading: true });
    renderWithProviders(<DashboardStats />);

    await waitFor(() => {
      const skeletons = screen.getAllByTestId('stat-card-skeleton');
      expect(skeletons).toHaveLength(3);
    });
  });

  it('統計データが正しく表示される', async () => {
    renderWithProviders(<DashboardStats />);

    await waitFor(
      () => {
        expect(screen.queryAllByTestId('stat-card-skeleton')).toHaveLength(0);
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(screen.getByText('顧客数')).toBeInTheDocument();
        expect(screen.getByText('注文数')).toBeInTheDocument();
        expect(screen.getByText('売上高')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<DashboardStats />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: 'エラーが発生しました',
        }),
      );
    });
  });

  it('WebSocket接続が確立されたときにデータが更新される', async () => {
    const { rerender } = renderWithProviders(<DashboardStats />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-card-skeleton')).toHaveLength(0);
    });

    (useWebSocket as jest.Mock).mockReturnValue({
      totalCount: 150,
      changeRate: 15,
      connectionStatus: 'connected',
    });

    rerender(
      <Provider store={createMockStore()}>
        <ChakraProvider>
          <DashboardStats />
        </ChakraProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('顧客数')).toBeInTheDocument();
    });
  });

  it('統計データの変化率が正しく表示される', async () => {
    renderWithProviders(<DashboardStats />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-card-skeleton')).toHaveLength(0);
    });

    await waitFor(() => {
      const percentText = screen.getByText('10%');
      expect(percentText).toBeInTheDocument();
    });
  });

  it('データなしの場合でも適切に表示される', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: {} });
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    renderWithProviders(<DashboardStats />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'データの取得に失敗しました',
          status: 'error',
        }),
      );
    });
  });

  describe('ローディングとデバッグログのテスト', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        configurable: true,
      });
    });

    it('初期ローディングからデータ表示までの遷移を確認', async () => {
      (useCustomerManagement as jest.Mock).mockReturnValue({ loading: true });
      (useWebSocket as jest.Mock).mockReturnValue({
        totalCount: null,
        changeRate: null,
        connectionStatus: 'connecting',
      });

      const { rerender } = renderWithProviders(<DashboardStats />);

      expect(screen.getAllByTestId('stat-card-skeleton')).toHaveLength(3);

      (useCustomerManagement as jest.Mock).mockReturnValue({ loading: false });
      (useWebSocket as jest.Mock).mockReturnValue({
        totalCount: 100,
        changeRate: 10,
        connectionStatus: 'connected',
      });

      rerender(
        <Provider store={createMockStore()}>
          <ChakraProvider>
            <DashboardStats />
          </ChakraProvider>
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId('stat-card-skeleton')).toHaveLength(0);
        expect(screen.getByText('顧客数')).toBeInTheDocument();
      });
    });

    it('環境に応じたデバッグログの出力を確認', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
      renderWithProviders(<DashboardStats />);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockClear();

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });
      renderWithProviders(<DashboardStats />);
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
