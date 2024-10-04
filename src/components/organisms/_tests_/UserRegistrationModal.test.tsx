import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserRegistrationModal from "../../organisms/UserRegistrationModal";
import { ChakraProvider } from "@chakra-ui/react";

// モック関数を作成
const mockOnClose = jest.fn();
const mockHandleNewUserChange = jest.fn();
const mockHandleNewUserSubmit = jest.fn();

// モックデータを作成
const mockNewUserFormData = {
  username: "新規ユーザー",
  email: "newuser@example.com",
  password: "password123",
  role: "ADMIN" as "ADMIN" | "MANAGER" | "STAFF",
  isActive: true,
};

// Chakra UIを使ったレンダリング
const renderWithChakra = (props = {}) =>
  render(
    <ChakraProvider>
      <UserRegistrationModal
        isOpen={true}
        onClose={mockOnClose}
        newUserFormData={mockNewUserFormData}
        handleNewUserChange={mockHandleNewUserChange}
        handleNewUserSubmit={mockHandleNewUserSubmit}
        {...props}
      />
    </ChakraProvider>
  );

describe("UserRegistrationModalのテスト", () => {
  test("モーダルが正しくレンダリングされることを確認", () => {
    renderWithChakra();

    expect(screen.getByText("新規ユーザー登録")).toBeInTheDocument();
    expect(screen.getByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    expect(screen.getByLabelText(/役割/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument();
  });

  test("入力フィールドにデフォルト値が表示されることを確認", () => {
    renderWithChakra();

    expect(screen.getByDisplayValue("新規ユーザー")).toBeInTheDocument();
    expect(screen.getByDisplayValue("newuser@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("password123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("管理者")).toBeInTheDocument();

    // isActive フィールドの選択値を確認
    const activeOption = screen.getByRole("option", {
      name: "アクティブ",
    }) as HTMLOptionElement;
    expect(activeOption.selected).toBe(true);
  });

  test("ユーザー名の入力が変更されるとハンドラが呼ばれる", () => {
    renderWithChakra();

    const usernameInput = screen.getByLabelText(/ユーザー名/);
    fireEvent.change(usernameInput, {
      target: { value: "変更されたユーザー" },
    });

    expect(mockHandleNewUserChange).toHaveBeenCalled();
  });

  test("登録ボタンをクリックすると、handleNewUserSubmitが呼ばれる", () => {
    renderWithChakra();

    const submitButton = screen.getByText("登録");
    fireEvent.click(submitButton);

    expect(mockHandleNewUserSubmit).toHaveBeenCalled();
  });

  test("キャンセルボタンをクリックするとモーダルが閉じる", () => {
    renderWithChakra();

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("モバイルビューで正しくレンダリングされ、ボタンがフル幅で表示されることを確認", () => {
    renderWithChakra({ isOpen: true, newUserFormData: mockNewUserFormData });

    const cancelButton = screen.getByText("キャンセル");
    expect(cancelButton).toHaveStyle("width: 100%");
  });
});
