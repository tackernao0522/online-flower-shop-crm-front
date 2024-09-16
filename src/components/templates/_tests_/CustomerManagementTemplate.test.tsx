import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import CustomerManagementTemplate from "../../templates/CustomerManagementTemplate";
import { useCustomerManagement } from "../../../hooks/useCustomerManagement.ts";
import { useRouter } from "next/navigation";

// モックの作成
jest.mock("@/hooks/useCustomerManagement");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseCustomerManagement = useCustomerManagement as jest.MockedFunction<
  typeof useCustomerManagement
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("CustomerManagementTemplate コンポーネント", () => {
  const mockCustomers = [
    {
      id: "1",
      name: "山田太郎",
      email: "taro@example.com",
      phoneNumber: "090-1234-5678",
      birthDate: "1990-01-01",
    },
    {
      id: "2",
      name: "佐藤花子",
      email: "hanako@example.com",
      phoneNumber: "080-9876-5432",
      birthDate: "1985-12-31",
    },
  ];

  const mockCustomerManagement = {
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    activeCustomer: null,
    modalMode: "detail",
    customers: mockCustomers,
    status: "success",
    error: null,
    loading: false,
    page: 1,
    hasMore: false,
    isDeleteAlertOpen: false,
    customerToDelete: null,
    searchTerm: "",
    showScrollTop: false,
    newCustomer: {},
    formErrors: {},
    isMobile: false,
    handleCustomerClick: jest.fn(),
    handleAddCustomer: jest.fn(),
    handleEditCustomer: jest.fn(),
    handleDeleteCustomer: jest.fn(),
    confirmDelete: jest.fn(),
    cancelDelete: jest.fn(),
    handleSearch: jest.fn(),
    handleKeyDown: jest.fn(),
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    scrollToTop: jest.fn(),
    ref: { current: null },
    setSearchTerm: jest.fn(),
  };

  beforeEach(() => {
    mockUseCustomerManagement.mockReturnValue(mockCustomerManagement);
    mockUseRouter.mockReturnValue({ push: jest.fn() } as any);
  });

  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <CustomerManagementTemplate />
      </ChakraProvider>
    );
  };

  test("顧客管理画面のヘッダーが正しく表示される", () => {
    renderComponent();
    expect(screen.getByText("顧客管理")).toBeInTheDocument();
    expect(screen.getByText("新規顧客登録")).toBeInTheDocument();
    expect(screen.getByText("ダッシュボードへ戻る")).toBeInTheDocument();
  });

  test("検索フォームが正しく表示される", () => {
    renderComponent();
    expect(
      screen.getByPlaceholderText("顧客名または電話番号( - は除く)")
    ).toBeInTheDocument();
    expect(screen.getByText("検索")).toBeInTheDocument();
  });

  test("顧客テーブルが正しく表示される", () => {
    renderComponent();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByText("電話番号")).toBeInTheDocument();
    expect(screen.getByText("生年月日")).toBeInTheDocument();
    expect(screen.getByText("アクション")).toBeInTheDocument();
  });

  test("顧客データが正しく表示される", () => {
    renderComponent();
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("佐藤花子")).toBeInTheDocument();
    expect(screen.getByText("taro@example.com")).toBeInTheDocument();
    expect(screen.getByText("090-1234-5678")).toBeInTheDocument();
    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  });

  test("新規顧客登録ボタンをクリックするとハンドラーが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getByText("新規顧客登録"));
    expect(mockCustomerManagement.handleAddCustomer).toHaveBeenCalled();
  });

  test("ダッシュボードへ戻るボタンをクリックするとルーターが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getByText("ダッシュボードへ戻る"));
    expect(mockUseRouter().push).toHaveBeenCalledWith("/dashboard");
  });

  test("検索ボタンをクリックするとハンドラーが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getByText("検索"));
    expect(mockCustomerManagement.handleSearch).toHaveBeenCalled();
  });

  test("顧客名をクリックするとハンドラーが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getByText("山田太郎"));
    expect(mockCustomerManagement.handleCustomerClick).toHaveBeenCalledWith(
      mockCustomers[0]
    );
  });

  test("編集ボタンをクリックするとハンドラーが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getAllByText("編集")[0]);
    expect(mockCustomerManagement.handleEditCustomer).toHaveBeenCalledWith(
      mockCustomers[0]
    );
  });

  test("削除ボタンをクリックするとハンドラーが呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getAllByText("削除")[0]);
    expect(mockCustomerManagement.handleDeleteCustomer).toHaveBeenCalledWith(
      mockCustomers[0]
    );
  });
});
