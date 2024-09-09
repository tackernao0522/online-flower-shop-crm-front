import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import DashboardTemplate from "../DashboardTemplate";

// useLoading フックをモック
jest.mock("../../../hooks/useLoading", () => ({
  useLoading: jest.fn(),
}));

// スケルトンコンポーネントをモック
jest.mock("../../atoms/SkeletonComponents", () => ({
  CardSkeleton: () => <div data-testid="card-skeleton">CardSkeleton</div>,
  StatCardSkeleton: () => (
    <div data-testid="stat-card-skeleton">StatCardSkeleton</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton">TableSkeleton</div>,
  ChartSkeleton: () => <div data-testid="chart-skeleton">ChartSkeleton</div>,
}));

// モックコンポーネントを作成
jest.mock("../../organisms/DashboardHeader", () => {
  const DashboardHeader = () => (
    <div data-testid="mock-dashboard-header">DashboardHeader</div>
  );
  DashboardHeader.displayName = "DashboardHeader";
  return DashboardHeader;
});

jest.mock("../../organisms/DashboardStats", () => {
  const DashboardStats = () => (
    <div data-testid="mock-dashboard-stats">DashboardStats</div>
  );
  DashboardStats.displayName = "DashboardStats";
  return DashboardStats;
});

jest.mock("../../molecules/RecentOrders", () => {
  const RecentOrders = () => (
    <div data-testid="mock-recent-orders">RecentOrders</div>
  );
  RecentOrders.displayName = "RecentOrders";
  return RecentOrders;
});

jest.mock("../../molecules/SalesChart", () => {
  const SalesChart = () => <div data-testid="mock-sales-chart">SalesChart</div>;
  SalesChart.displayName = "SalesChart";
  return SalesChart;
});

jest.mock("../../molecules/PopularProducts", () => {
  const PopularProducts = () => (
    <div data-testid="mock-popular-products">PopularProducts</div>
  );
  PopularProducts.displayName = "PopularProducts";
  return PopularProducts;
});

jest.mock("../../molecules/CustomerSatisfaction", () => {
  const CustomerSatisfaction = () => (
    <div data-testid="mock-customer-satisfaction">CustomerSatisfaction</div>
  );
  CustomerSatisfaction.displayName = "CustomerSatisfaction";
  return CustomerSatisfaction;
});

jest.mock("../../molecules/SystemStatus", () => {
  const SystemStatus = () => (
    <div data-testid="mock-system-status">SystemStatus</div>
  );
  SystemStatus.displayName = "SystemStatus";
  return SystemStatus;
});

jest.mock("../../molecules/UnprocessedTasks", () => {
  const UnprocessedTasks = () => (
    <div data-testid="mock-unprocessed-tasks">UnprocessedTasks</div>
  );
  UnprocessedTasks.displayName = "UnprocessedTasks";
  return UnprocessedTasks;
});

jest.mock("../../molecules/ImportantNotifications", () => {
  const ImportantNotifications = () => (
    <div data-testid="mock-important-notifications">ImportantNotifications</div>
  );
  ImportantNotifications.displayName = "ImportantNotifications";
  return ImportantNotifications;
});

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe("DashboardTemplate", () => {
  it("ローディング中にスケルトンコンポーネントが表示されること", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      true
    );
    renderWithChakra(<DashboardTemplate />);

    expect(screen.getByTestId("mock-dashboard-header")).toBeInTheDocument();
    expect(screen.getAllByTestId("stat-card-skeleton")).toHaveLength(3);
    expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
    expect(screen.getAllByTestId("card-skeleton")).toHaveLength(5);
  });

  it("ローディング完了後に全てのコンポーネントが表示されること", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    renderWithChakra(<DashboardTemplate />);

    expect(screen.getByTestId("mock-dashboard-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-dashboard-stats")).toBeInTheDocument();
    expect(screen.getByTestId("mock-recent-orders")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sales-chart")).toBeInTheDocument();
    expect(screen.getByTestId("mock-popular-products")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-customer-satisfaction")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-system-status")).toBeInTheDocument();
    expect(screen.getByTestId("mock-unprocessed-tasks")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-important-notifications")
    ).toBeInTheDocument();
  });

  it("正しい構造でコンポーネントがレンダリングされていること", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    const { container } = renderWithChakra(<DashboardTemplate />);

    // 子要素が存在することを確認
    expect(container.firstChild?.childNodes.length).toBeGreaterThan(1);
  });

  it("レスポンシブデザインのためのコンポーネントが存在すること", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    const { container } = renderWithChakra(<DashboardTemplate />);

    const mainContainer = container.firstChild as HTMLElement;

    // 子要素が存在することを確認
    const children = mainContainer.childNodes;
    expect(children.length).toBeGreaterThan(1);

    // SimpleGridコンポーネントの代わりに使用されているdiv要素の数を確認
    const divElements = mainContainer.querySelectorAll("div");
    expect(divElements.length).toBeGreaterThan(4); // DashboardHeader + 少なくとも4つのSimpleGrid
  });
});
