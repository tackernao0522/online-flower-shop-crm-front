import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardPage from "../page";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/components/templates/DashboardTemplate", () => {
  return function MockDashboardTemplate() {
    return <div data-testid="dashboard-template">Dashboard Template</div>;
  };
});

jest.mock("@/components/PrivateRoute", () => {
  return function MockPrivateRoute({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="private-route">{children}</div>;
  };
});

describe("DashboardPage", () => {
  const mockPush = jest.fn();
  let mockIsAuthenticated = true;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSelector as jest.Mock).mockImplementation(() => mockIsAuthenticated);
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("認証済みの場合、DashboardTemplateを表示すること", () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);

    expect(screen.getByTestId("dashboard-template")).toBeInTheDocument();
    expect(screen.getByTestId("private-route")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("未認証の場合、ログインページにリダイレクトすること", () => {
    mockIsAuthenticated = false;
    render(<DashboardPage />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("認証状態が変更された場合、適切に処理されること", () => {
    mockIsAuthenticated = true;
    const { rerender } = render(<DashboardPage />);
    expect(mockPush).not.toHaveBeenCalled();

    mockIsAuthenticated = false;
    rerender(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("コンポーネントのマウント時とレンダリング時にコンソールログが出力されること", () => {
    mockIsAuthenticated = true;
    render(<DashboardPage />);

    expect(console.log).toHaveBeenCalledWith(
      "DashboardPage: Rendering, isAuthenticated:",
      true
    );
    expect(console.log).toHaveBeenCalledWith(
      "DashboardPage: Mounted or auth state changed, isAuthenticated:",
      true
    );
  });
});
