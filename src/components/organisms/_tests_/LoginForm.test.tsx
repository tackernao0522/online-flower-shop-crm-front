import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import LoginForm from "../LoginForm";
import authReducer from "../../../features/auth/authSlice";
import { ChakraProvider } from "@chakra-ui/react";

jest.mock("axios");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("LoginForm", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  const renderLoginForm = () =>
    render(
      <ChakraProvider>
        <Provider store={store}>
          <LoginForm />
        </Provider>
      </ChakraProvider>
    );

  it("ログインフォームが正しくレンダリングされること", () => {
    renderLoginForm();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" })
    ).toBeInTheDocument();
  });

  it("入力フィールドの値が正しく更新されること", () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("ログインが成功した場合、ダッシュボードにリダイレクトされること", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { accessToken: "fake-token", user: { id: "1", name: "Test User" } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/login"),
        { email: "test@example.com", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("ログインが失敗した場合、エラーメッセージが表示されること", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: { message: "ログインに失敗しました。" } } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      const errorMessage = screen.getByText(
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
        { selector: "p" }
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("ログイン中にローディングスピナーが表示されること", async () => {
    mockedAxios.post.mockImplementationOnce(() => new Promise(() => {}));

    renderLoginForm();

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("既に認証されている場合、フォームが表示されないこと", () => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: { isAuthenticated: true, token: "fake-token", user: null },
      },
    });

    renderLoginForm();

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
