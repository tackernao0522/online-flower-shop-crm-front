import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import PrivateRoute from "../PrivateRoute";
import { login } from "../../features/auth/authSlice";

// モックの設定
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("../../features/auth/authSlice", () => ({
  login: jest.fn(),
}));

describe("PrivateRoute", () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: false, token: null } })
    );
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("認証済みの場合、子コンポーネントをレンダリングすること", async () => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: true, token: "mock-token" } })
    );

    await act(async () => {
      render(
        <PrivateRoute>
          <div data-testid="child-component">Child Component</div>
        </PrivateRoute>
      );
    });

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });

  it("未認証の場合、ログインページにリダイレクトすること", async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    await act(async () => {
      render(
        <PrivateRoute>
          <div>Child Component</div>
        </PrivateRoute>
      );
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("トークンがローカルストレージにある場合、ログイン処理を行うこと", async () => {
    const mockToken = "mock-token";
    const mockUser = { id: "1", name: "Test User" };
    (window.localStorage.getItem as jest.Mock)
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    await act(async () => {
      render(
        <PrivateRoute>
          <div>Child Component</div>
        </PrivateRoute>
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      login({ token: mockToken, user: mockUser })
    );
  });

  it("ローカルストレージの読み取りに失敗した場合、エラーをログ出力すること", async () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error("localStorage error");
    });
    console.error = jest.fn();

    await act(async () => {
      render(
        <PrivateRoute>
          <div>Child Component</div>
        </PrivateRoute>
      );
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error reading from localStorage:",
      expect.any(Error)
    );
  });

  it("ユーザーデータのパースに失敗した場合、エラーをログ出力すること", async () => {
    (window.localStorage.getItem as jest.Mock)
      .mockReturnValueOnce("mock-token")
      .mockReturnValueOnce("invalid-json");
    console.error = jest.fn();

    await act(async () => {
      render(
        <PrivateRoute>
          <div>Child Component</div>
        </PrivateRoute>
      );
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error parsing user from localStorage:",
      expect.any(Error)
    );
  });

  it("ユーザーデータがローカルストレージにない場合、空のオブジェクトを使用すること", async () => {
    const mockToken = "mock-token";
    (window.localStorage.getItem as jest.Mock)
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(null); // ユーザーデータがない場合

    await act(async () => {
      render(
        <PrivateRoute>
          <div>Child Component</div>
        </PrivateRoute>
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      login({ token: mockToken, user: {} })
    );
  });
});
