import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import CustomerTable from "../CustomerTable";
import { ChakraProvider } from "@chakra-ui/react";

// モックのカスタマーデータ
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

// モック関数
const mockOnCustomerClick = jest.fn();
const mockOnEditCustomer = jest.fn();
const mockOnDeleteCustomer = jest.fn();
const mockOnLoadMore = jest.fn();

// IntersectionObserver のモック
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe("CustomerTable コンポーネント", () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      customers: mockCustomers,
      status: "success",
      error: null,
      hasMore: false,
      onCustomerClick: mockOnCustomerClick,
      onEditCustomer: mockOnEditCustomer,
      onDeleteCustomer: mockOnDeleteCustomer,
      onLoadMore: mockOnLoadMore,
      isMobile: false,
    };

    return render(
      <ChakraProvider>
        <CustomerTable {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("顧客データが正しく表示される", () => {
    renderComponent();
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("佐藤花子")).toBeInTheDocument();
    expect(screen.getByText("taro@example.com")).toBeInTheDocument();
    expect(screen.getByText("090-1234-5678")).toBeInTheDocument();
    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  });

  test("顧客名をクリックすると onCustomerClick が呼ばれる", () => {
    renderComponent();
    fireEvent.click(screen.getByText("山田太郎"));
    expect(mockOnCustomerClick).toHaveBeenCalledWith(mockCustomers[0]);
  });

  test("ローディング中は Spinner が表示される", () => {
    renderComponent({ status: "loading", customers: [] });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("エラー時にはエラーメッセージが表示される", () => {
    const errorMessage = "データの取得に失敗しました";
    renderComponent({ status: "failed", error: errorMessage });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("hasMore が false の場合、すべての顧客を表示したメッセージが表示される", () => {
    renderComponent({ hasMore: false });
    expect(
      screen.getByText("すべての顧客を表示しました (2名)")
    ).toBeInTheDocument();
  });

  test("hasMore が true の場合、ローディングスピナーが表示される", () => {
    renderComponent({ hasMore: true });
    const spinners = screen.getAllByText("Loading...");
    expect(spinners).toHaveLength(1);
    expect(spinners[0]).toBeInTheDocument();
  });

  test("モバイルモードでテーブルが適切に表示される", () => {
    renderComponent({ isMobile: true });
    const boxWrapper = screen.getByRole("table").closest("div");
    expect(boxWrapper).toHaveStyle("overflow-x: auto");
  });

  test('生年月日が未登録の場合、"未登録"と表示される', () => {
    const customersWithoutBirthDate = [
      { ...mockCustomers[0], birthDate: null },
    ];
    renderComponent({ customers: customersWithoutBirthDate });
    expect(screen.getByText("未登録")).toBeInTheDocument();
  });
});
