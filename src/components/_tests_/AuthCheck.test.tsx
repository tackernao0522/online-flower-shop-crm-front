import React from "react";
import { render } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import AuthCheck from "../AuthCheck";
import { setAuthState, logout } from "../../features/auth/authSlice";

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("../../features/auth/authSlice", () => ({
  setAuthState: jest.fn(),
  logout: jest.fn(),
}));

describe("AuthCheck", () => {
  let mockRouter: { push: jest.Mock };
  let mockDispatch: jest.Mock;
  let mockUseSelector: jest.Mock;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    mockUseSelector = jest.fn();
    (useSelector as jest.Mock).mockImplementation(mockUseSelector);

    // localStorageのモック
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("認証済みで、トークンとユーザー情報が存在する場合、何も行わない", () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: true,
      token: "token",
      user: {},
    });
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "token") return "token";
      if (key === "user") return JSON.stringify({});
      return null;
    });

    render(<AuthCheck />);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("未認証だが、localStorageにトークンとユーザー情報が存在する場合、認証状態を設定する", () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "token") return "token";
      if (key === "user") return JSON.stringify({});
      return null;
    });

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(setAuthState(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("未認証で、localStorageにトークンまたはユーザー情報が存在しない場合、ログアウトしてログインページにリダイレクトする", () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });
});
