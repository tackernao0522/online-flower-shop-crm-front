import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import LoginPage from "../page";

// すべての jest.mock 呼び出しをファイルの最上部に移動
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("@chakra-ui/react", () => ({
  ChakraProvider: ({ children }) => children,
}));

jest.mock("../../../components/templates/AuthLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="auth-layout">{children}</div>,
}));

jest.mock("../../../components/organisms/LoginForm", () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">Login Form</div>,
}));

jest.mock("../../../components/atoms/LoginSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="login-skeleton">Login Skeleton</div>,
}));

// モックコンポーネントの displayName を設定
const MockAuthLayout = jest.requireMock(
  "../../../components/templates/AuthLayout"
).default;
MockAuthLayout.displayName = "MockAuthLayout";

const MockLoginForm = jest.requireMock(
  "../../../components/organisms/LoginForm"
).default;
MockLoginForm.displayName = "MockLoginForm";

const MockLoginSkeleton = jest.requireMock(
  "../../../components/atoms/LoginSkeleton"
).default;
MockLoginSkeleton.displayName = "MockLoginSkeleton";

describe("LoginPageコンポーネント", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSelector = useSelector as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSelector.mockClear();
    mockPush.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("認証済みの場合、/dashboardにリダイレクトされること", () => {
    mockUseSelector.mockReturnValue(true);
    render(<LoginPage />);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });

  it("未認証の場合、ログインフォームが表示されること", async () => {
    mockUseSelector.mockReturnValue(false);
    render(<LoginPage />);
    expect(mockPush).not.toHaveBeenCalled();

    // 最初はスケルトンが表示される
    expect(screen.getByTestId("login-skeleton")).toBeInTheDocument();

    // タイマーを進める
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // スケルトンが消えてログインフォームが表示される
    expect(screen.queryByTestId("login-skeleton")).not.toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("AuthLayoutが正しく表示されること", () => {
    mockUseSelector.mockReturnValue(false);
    render(<LoginPage />);
    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });
});
