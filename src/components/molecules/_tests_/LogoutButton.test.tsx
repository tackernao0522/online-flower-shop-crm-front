import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider, Menu } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import LogoutButton from "../LogoutButton";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("axios");

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <Menu>{ui}</Menu>
    </ChakraProvider>
  );
};

describe("LogoutButton", () => {
  let mockLocalStorage: { [key: string]: string | null };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    mockLocalStorage = {
      token: "mock-token",
      user: "mock-user",
      userId: "mock-user-id",
    };

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => mockLocalStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });

    (useDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    });
    (axios.post as jest.Mock).mockResolvedValue({});
  });

  it("ログアウトボタンが正しく表示される", () => {
    renderWithChakra(<LogoutButton />);
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  it("ログアウト処理が正しく実行される", async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    const mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    renderWithChakra(<LogoutButton />);

    fireEvent.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/auth/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
          withCredentials: true,
        }
      );

      expect(mockDispatch).toHaveBeenCalledWith({ type: "auth/logout" });
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(localStorage.removeItem).toHaveBeenCalledWith("userId");
      expect(mockInvalidateQueries).toHaveBeenCalledWith(["onlineStatus"]);
      expect(mockRouterPush).toHaveBeenCalledWith("/login");
    });
  });

  it("トークンが存在しない場合、ログアウト処理が実行されない", async () => {
    // モックをリセットして、正しい動作を確認
    jest.clearAllMocks();

    // localStorage.getItem をモックして、token が null を返すようにする
    jest.spyOn(window.localStorage, "getItem").mockImplementation((key) => {
      if (key === "token") return null; // token に対しては null を返す
      return mockLocalStorage[key] || null;
    });

    // console.error のモック
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderWithChakra(<LogoutButton />);

    fireEvent.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      // axios.post が呼び出されないことを確認
      expect(axios.post).not.toHaveBeenCalled();

      // エラーログが出力されていることを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "No token found, unable to logout"
      );

      // localStorage.removeItem が呼び出されていないことを確認
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    // モックをリセット
    consoleSpy.mockRestore();
  });

  it("ログアウト処理中にエラーが発生した場合、エラーがログに記録される", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Logout failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderWithChakra(<LogoutButton />);

    fireEvent.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Logout Error:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
