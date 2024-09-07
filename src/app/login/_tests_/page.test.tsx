import React from "react";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import LoginPage from "../page";

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock(
  "../../../components/templates/AuthLayout",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="auth-layout">{children}</div>
);

jest.mock("../../../components/organisms/LoginForm", () => () => (
  <div data-testid="login-form">Login Form</div>
));

describe("LoginPageコンポーネント", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSelector = useSelector as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSelector.mockClear();
    mockPush.mockClear();
  });

  it("認証済みの場合、/dashboardにリダイレクトされること", () => {
    // isAuthenticatedがtrueの場合
    mockUseSelector.mockReturnValue(true);

    render(<LoginPage />);

    // /dashboardにリダイレクトされることを確認
    expect(mockPush).toHaveBeenCalledWith("/dashboard");

    // ログインフォームが表示されていないことを確認
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });

  it("未認証の場合、ログインフォームが表示されること", () => {
    // isAuthenticatedがfalseの場合
    mockUseSelector.mockReturnValue(false);

    render(<LoginPage />);

    // /dashboardにリダイレクトされていないことを確認
    expect(mockPush).not.toHaveBeenCalled();

    // ログインフォームが表示されることを確認
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("AuthLayoutが正しく表示されること", () => {
    // isAuthenticatedがfalseの場合
    mockUseSelector.mockReturnValue(false);

    render(<LoginPage />);

    // AuthLayoutが表示されることを確認
    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });
});
