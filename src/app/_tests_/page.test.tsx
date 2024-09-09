import React from "react";
import { render, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Home from "../page";

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("Homeコンポーネント", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSelector = useSelector as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSelector.mockClear();
    mockPush.mockClear();

    // console.error のエラーメッセージを抑制
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // モックをリセット
    jest.restoreAllMocks();
  });

  it("認証されている場合、/dashboardにリダイレクトされること", () => {
    // isAuthenticatedがtrueの場合
    mockUseSelector.mockReturnValue(true);

    render(<Home />);

    // /dashboardにリダイレクトされることを確認
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("認証されていない場合、/loginにリダイレクトされること", () => {
    // isAuthenticatedがfalseの場合
    mockUseSelector.mockReturnValue(false);

    render(<Home />);

    // /loginにリダイレクトされることを確認
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("isAuthenticated が undefined の場合、/login にリダイレクトされること", () => {
    mockUseSelector.mockReturnValue(undefined); // isAuthenticated が undefined の場合

    render(<Home />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("isAuthenticated が true から false に変わった場合、/login にリダイレクトされること", () => {
    mockUseSelector
      .mockReturnValueOnce(true) // 初回は true (認証済み)
      .mockReturnValueOnce(false); // 次回は false (認証解除)

    // 初回レンダリング
    const { rerender } = render(<Home />);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");

    // 再レンダリングをシミュレートして認証が解除された場合をテスト
    act(() => {
      rerender(<Home />);
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("router.push が呼ばれない場合、エラーハンドリングが行われること", () => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(() => {
        throw new Error("Router error");
      }),
    });

    // エラーハンドリングをテスト
    expect(() => render(<Home />)).toThrow("Router error");
  });
});
