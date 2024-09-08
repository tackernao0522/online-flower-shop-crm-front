import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import { useBreakpointValue } from "@chakra-ui/react";
import DashboardHeader from "../DashboardHeader";
import { useUserOnlineStatus } from "../../../hooks/useUserOnlineStatus";

// モックの設定
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("@chakra-ui/react", () => {
  const originalModule = jest.requireActual("@chakra-ui/react");
  return {
    ...originalModule,
    useBreakpointValue: jest.fn(),
  };
});

jest.mock("../../../hooks/useUserOnlineStatus", () => ({
  useUserOnlineStatus: jest.fn(),
}));

jest.mock("../../molecules/LogoutButton", () => {
  const MockLogoutButton = () => (
    <div data-testid="logout-button">ログアウト</div>
  );
  MockLogoutButton.displayName = "MockLogoutButton";
  return MockLogoutButton;
});

describe("DashboardHeader", () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockReturnValue({ id: "user-id" });
    (useBreakpointValue as jest.Mock).mockReturnValue("md");
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: { is_online: true },
      isLoading: false,
      isError: false,
    });
  });

  it("ダッシュボードのタイトルが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
  });

  it("検索バーが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
  });

  it("通知アイコンが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText("通知")).toBeInTheDocument();
  });

  it("オプションメニューが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText("Options")).toBeInTheDocument();
  });

  it("アバターが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("ログアウトボタンが表示されること", () => {
    render(<DashboardHeader />);
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
  });

  it("オンラインステータスに応じてアバターバッジの色が変わること", () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: { is_online: false },
      isLoading: false,
      isError: false,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId("avatar-badge");
    expect(avatarBadge).toHaveStyle(
      "background-color: var(--chakra-colors-gray-500)"
    );
  });

  it("ユーザーオンラインステータスの読み込み中は黄色のバッジが表示されること", () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId("avatar-badge");
    expect(avatarBadge).toHaveStyle(
      "background-color: var(--chakra-colors-yellow-500)"
    );
  });

  it("ユーザーオンラインステータスのエラー時は赤色のバッジが表示されること", () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId("avatar-badge");
    expect(avatarBadge).toHaveStyle(
      "background-color: var(--chakra-colors-red-500)"
    );
  });

  // 新しいテストケース
  it("検索入力が機能すること", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<DashboardHeader />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "test search" } });
    expect(consoleSpy).toHaveBeenCalledWith("Search query:", "test search");
    consoleSpy.mockRestore();
  });

  it("通知ボタンがクリックされたときにログが出力されること", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<DashboardHeader />);
    const notificationButton = screen.getByTestId("notification-button");
    fireEvent.click(notificationButton);
    expect(consoleSpy).toHaveBeenCalledWith("Notification clicked");
    consoleSpy.mockRestore();
  });

  it("オプションメニューの項目がクリックされたときにログが出力されること", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<DashboardHeader />);
    const optionsButton = screen.getByLabelText("Options");
    fireEvent.click(optionsButton);
    const menuItem = screen.getByText("配送管理");
    fireEvent.click(menuItem);
    expect(consoleSpy).toHaveBeenCalledWith("Selected option:", "配送管理");
    consoleSpy.mockRestore();
  });

  // 新しいテスト: useBreakpointValueの動作確認
  it("useBreakpointValueのレスポンシブな値が正しく動作すること", () => {
    (useBreakpointValue as jest.Mock).mockReturnValue("lg");
    render(<DashboardHeader />);
    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
  });

  // 新しいテスト: エラーハンドリング
  it("オンラインステータスのエラーハンドリングが機能すること", () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId("avatar-badge");
    expect(avatarBadge).toHaveStyle(
      "background-color: var(--chakra-colors-red-500)"
    );
  });
});
