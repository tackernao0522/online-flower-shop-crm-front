import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import DashboardStats from "../DashboardStats";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

jest.mock("../../../hooks/useCustomerManagement", () => ({
  useCustomerManagement: jest.fn(() => ({
    loading: false,
  })),
}));

jest.mock("../../atoms/StatCard", () => {
  return function MockStatCard({ title, value, change }) {
    return (
      <div data-testid={`stat-card-${title}`}>
        {title}: {value} ({change}%)
      </div>
    );
  };
});

jest.mock("../../atoms/SkeletonComponents", () => ({
  StatCardSkeleton: () => (
    <div data-testid="stat-card-skeleton">Loading...</div>
  ),
}));

describe("DashboardStats コンポーネント", () => {
  const initialState = {
    customers: {
      totalCount: 1234,
    },
  };
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <ChakraProvider>{component}</ChakraProvider>
      </Provider>
    );
  };

  it("ローディング中にスケルトンを表示する", () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue({ loading: true });
    renderWithProviders(<DashboardStats />);

    expect(screen.getAllByTestId("stat-card-skeleton")).toHaveLength(3);
  });

  it("ローディング完了後に統計カードを表示する", () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue({ loading: false });
    renderWithProviders(<DashboardStats />);

    expect(screen.getByTestId("stat-card-顧客数")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-注文数")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-売上高")).toBeInTheDocument();
  });

  it("統計カードに正しい情報が表示される", () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue({ loading: false });
    renderWithProviders(<DashboardStats />);

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

  it("レスポンシブデザインが適用されている", () => {
    require("../../../hooks/useCustomerManagement").useCustomerManagement.mockReturnValue({ loading: false });
    renderWithProviders(<DashboardStats />);

    const grid = screen.getByTestId("dashboard-stats-grid");
    expect(grid).toHaveStyle("display: grid");
  });
});
