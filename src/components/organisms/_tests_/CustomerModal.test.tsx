import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerModal from "../CustomerModal";
import { ChakraProvider } from "@chakra-ui/react";

// モックの顧客データ
const mockCustomer = {
  id: "1",
  name: "テスト 太郎",
  email: "test@example.com",
  phone: "090-1234-5678",
  address: "東京都渋谷区",
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
  purchaseHistory: [],
};

// モックの関数
const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

// CustomerBasicInfo コンポーネントのモック
jest.mock("../../molecules/CustomerBasicInfo", () => {
  return function MockCustomerBasicInfo(props) {
    return (
      <div data-testid="customer-basic-info">Customer Basic Info Mock</div>
    );
  };
});

describe("CustomerModal コンポーネント", () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof CustomerModal>> = {}
  ) => {
    const defaultProps: React.ComponentProps<typeof CustomerModal> = {
      isOpen: true,
      onClose: mockOnClose,
      modalMode: "detail",
      activeCustomer: mockCustomer,
      onSubmit: mockOnSubmit,
      isMobile: false,
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

  test("モーダルが正しく表示される", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("顧客詳細")).toBeInTheDocument();
    });
  });

  test("モーダルのタイトルが各モードで正しく表示される", async () => {
    renderComponent({ modalMode: "add" });
    await waitFor(() => {
      expect(screen.getByText("新規顧客登録")).toBeInTheDocument();
    });

    renderComponent({ modalMode: "edit" });
    await waitFor(() => {
      expect(screen.getByText("顧客情報編集")).toBeInTheDocument();
    });
  });

  test("タブが正しく表示される", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "基本情報" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "購入履歴" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "メモ" })).toBeInTheDocument();
    });
  });

  test("閉じるボタンが機能する", async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByText("閉じる"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test("登録ボタンが追加モードで表示され、機能する", async () => {
    renderComponent({ modalMode: "add" });
    await waitFor(() => {
      const submitButton = screen.getByText("登録");
      expect(submitButton).toBeInTheDocument();
      fireEvent.click(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test("更新ボタンが編集モードで表示され、機能する", async () => {
    renderComponent({ modalMode: "edit" });
    await waitFor(() => {
      const updateButton = screen.getByText("更新");
      expect(updateButton).toBeInTheDocument();
      fireEvent.click(updateButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test("詳細モードではアクションボタンが表示されない", async () => {
    renderComponent({ modalMode: "detail" });
    await waitFor(() => {
      expect(screen.queryByText("登録")).not.toBeInTheDocument();
      expect(screen.queryByText("更新")).not.toBeInTheDocument();
    });
  });

  test("モバイルモードで全画面表示になる", async () => {
    renderComponent({ isMobile: true });
    await waitFor(() => {
      const modalContent = screen.getByRole("dialog");
      expect(modalContent).toHaveClass("chakra-modal__content");
      expect(modalContent).toHaveStyle("width: 100%");
    });
  });
});
