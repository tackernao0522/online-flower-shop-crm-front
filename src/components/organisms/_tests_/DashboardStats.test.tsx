import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import DashboardStats from "../DashboardStats";

// useLoadingフックのモック
jest.mock("../../../hooks/useLoading", () => ({
  useLoading: jest.fn(),
}));

// StatCardコンポーネントのモック
jest.mock("../../atoms/StatCard", () => {
  return function MockStatCard({ title, value, change }) {
    return (
      <div data-testid={`stat-card-${title}`}>
        {title}: {value} ({change}%)
      </div>
    );
  };
});

// StatCardSkeletonコンポーネントのモック
jest.mock("../../atoms/SkeletonComponents", () => ({
  StatCardSkeleton: () => (
    <div data-testid="stat-card-skeleton">Loading...</div>
  ),
}));

describe("DashboardStats コンポーネント", () => {
  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it("ローディング中にスケルトンを表示する", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      true
    );
    renderWithChakra(<DashboardStats />);

    expect(screen.getAllByTestId("stat-card-skeleton")).toHaveLength(3);
  });

  it("ローディング完了後に統計カードを表示する", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    renderWithChakra(<DashboardStats />);

    expect(screen.getByTestId("stat-card-顧客数")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-注文数")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-売上高")).toBeInTheDocument();
  });

  it("統計カードに正しい情報が表示される", () => {
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    renderWithChakra(<DashboardStats />);

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
    (require("../../../hooks/useLoading") as any).useLoading.mockReturnValue(
      false
    );
    renderWithChakra(<DashboardStats />);

    const grid = screen.getByTestId("stat-card-顧客数").parentElement;
    expect(grid).toHaveClass("css-1g9qhlm");
    // Note: 実際のスタイルのテストは難しいため、ここではChakra UIのクラス名の存在を確認しています
  });
});
