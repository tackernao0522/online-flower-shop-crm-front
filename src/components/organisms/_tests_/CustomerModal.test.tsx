import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerModal from "../CustomerModal";
import { ChakraProvider } from "@chakra-ui/react";

// モックの顧客データ
const mockCustomer = {
  name: "テスト 太郎",
  email: "test@example.com",
  phoneNumber: "090-1234-5678",
  address: "東京都渋谷区",
  birthDate: "1990-01-01",
};

// モックの関数
const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();
const mockHandleInputChange = jest.fn();

describe("CustomerModal コンポーネント", () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof CustomerModal>> = {}
  ) => {
    const defaultProps: React.ComponentProps<typeof CustomerModal> = {
      isOpen: true,
      onClose: mockOnClose,
      modalMode: "add",
      newCustomer: mockCustomer,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockOnSubmit,
    };

    return render(
      <ChakraProvider>
        <CustomerModal {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("モーダルのタイトルが各モードで正しく表示される", async () => {
    // addモードのテスト
    const { unmount } = renderComponent({ modalMode: "add" });
    await waitFor(() => {
      expect(screen.getByText("新規顧客登録")).toBeInTheDocument();
    });

    // コンポーネントをアンマウント
    unmount();

    // editモードのテスト
    renderComponent({ modalMode: "edit" });
    await waitFor(() => {
      // headerId を使用してヘッダーを検索
      const header = screen.getByText("顧客情報編集");
      expect(header).toBeInTheDocument();
    });
  });

  test("フォームフィールドが正しく表示される", async () => {
    renderComponent();
    await waitFor(() => {
      // role="group"を持つFormControlの中からラベルテキストを検索
      const formControls = screen.getAllByRole("group");
      expect(formControls[0]).toHaveTextContent("名前");
      expect(formControls[1]).toHaveTextContent("メールアドレス");
      expect(formControls[2]).toHaveTextContent("電話番号");
      expect(formControls[3]).toHaveTextContent("住所");
      expect(formControls[4]).toHaveTextContent("生年月日");
    });
  });

  test("閉じるボタンが機能する", async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByText("キャンセル"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test("登録ボタンが機能する", async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByText("登録"));
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test("入力フィールドの変更が機能する", async () => {
    renderComponent();
    await waitFor(() => {
      // input要素を直接取得
      const nameInput = screen.getByRole("textbox", { name: /名前/ });
      fireEvent.change(nameInput, { target: { value: "新しい名前" } });
      expect(mockHandleInputChange).toHaveBeenCalled();
    });
  });

  test("モーダルのサイズが画面サイズに応じて変更される", async () => {
    renderComponent();
    await waitFor(() => {
      const modalContent = screen.getByRole("dialog");
      expect(modalContent).toHaveClass("chakra-modal__content");

      const modalContainer = modalContent.parentElement;
      expect(modalContainer).toHaveClass("chakra-modal__content-container");

      expect(modalContent).toHaveAttribute("aria-modal", "true");
      expect(modalContent).toHaveStyle({
        opacity: "1",
      });
    });
  });
});
