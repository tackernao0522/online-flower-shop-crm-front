import React from "react";
import { render } from "@testing-library/react";
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
});
