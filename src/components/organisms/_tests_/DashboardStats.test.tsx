import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import DashboardStats from "../DashboardStats";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import axios from "axios";

// Axiosのモック
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// モックストアを作成
const mockStore = configureMockStore();

// useCustomerManagementのモック
jest.mock("../../../hooks/useCustomerManagement", () => ({
  useCustomerManagement: jest.fn(() => ({
    loading: false,
  })),
}));

// useWebSocketのモック
jest.mock("../../../hooks/useWebSocket", () => ({
  useWebSocket: jest.fn(() => ({
    totalCount: 1234,
    changeRate: 2,
    connectionStatus: "connected",
  })),
}));

// StatCardのモック
jest.mock("../../atoms/StatCard", () => {
  return function MockStatCard({
    title,
    value,
    change,
  }: {
    title: string;
    value: string | number;
    change: number;
  }) {
    return (
      <div data-testid={`stat-card-${title}`}>
        {title}: {value} ({change}%)
      </div>
    );
  };
});

// SkeletonComponentsのモック
jest.mock("../../atoms/SkeletonComponents", () => ({
  StatCardSkeleton: () => <div data-testid="stat-card-skeleton" />,
}));

describe("DashboardStats コンポーネント", () => {
  const initialState = {
    orders: {
      orders: [],
      status: "idle",
      error: null,
      totalCount: 5678,
      changeRate: -1,
    },
    customers: {
      customers: [],
      status: "idle",
      error: null,
      totalCount: 1234,
      changeRate: 2,
    },
  };

  let store: any;

  beforeAll(() => {
    Storage.prototype.getItem = jest.fn(() => "test-token");
  });

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();

    // 環境変数の設定
    process.env.NEXT_PUBLIC_API_URL = "http://test-api";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    // アクションをクリア
    store.clearActions();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <ChakraProvider>{component}</ChakraProvider>
      </Provider>
    );
  };

  it("ローディング中にスケルトンを表示する", async () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue(
      { loading: true }
    );

    await act(async () => {
      renderWithProviders(<DashboardStats />);
    });

    expect(screen.getAllByTestId("stat-card-skeleton")).toHaveLength(3);
  });

  it("ローディング完了後に統計カードを表示する", async () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue(
      { loading: false }
    );

    await act(async () => {
      renderWithProviders(<DashboardStats />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("stat-card-顧客数")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-注文数")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-売上高")).toBeInTheDocument();
    });
  });

  it("統計カードに正しい情報が表示される", async () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue(
      { loading: false }
    );

    await act(async () => {
      renderWithProviders(<DashboardStats />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("stat-card-顧客数")).toHaveTextContent(
        "顧客数: 1,234 (2%)"
      );
      expect(screen.getByTestId("stat-card-注文数")).toHaveTextContent(
        "注文数: 5,678 (-1%)"
      );
      expect(screen.getByTestId("stat-card-売上高")).toHaveTextContent(
        "売上高: ¥12,345,678 (5%)"
      );
    });
  });

  it("レスポンシブデザインが適用されている", async () => {
    await act(async () => {
      renderWithProviders(<DashboardStats />);
    });

    await waitFor(() => {
      const grid = screen.getByTestId("dashboard-stats-grid");
      expect(grid).toHaveStyle("display: grid");
    });
  });

  it("APIエラー時にエラー状態を処理する", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      renderWithProviders(<DashboardStats />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("stat-card-顧客数")).toBeInTheDocument();
    });
  });
});
