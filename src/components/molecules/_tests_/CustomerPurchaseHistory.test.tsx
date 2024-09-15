import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerPurchaseHistory from "../../molecules/CustomerPurchaseHistory";
import { Customer } from "@/types/customer";

describe("CustomerPurchaseHistory", () => {
  const mockCustomer: Customer = {
    id: "1",
    name: "山田 太郎",
    email: "yamada@example.com",
    phoneNumber: "090-1234-5678",
    address: "東京都千代田区1-2-3",
    birthDate: "1990-01-01",
    created_at: "2023-01-01",
    updated_at: "2023-01-02",
    purchaseHistory: [
      { id: "001", date: "2023-09-01", amount: 1200 },
      { id: "002", date: "2023-09-02", amount: 3000 },
    ],
    notes: "これはテスト用のメモです",
  };

  it("詳細モードで購入履歴が正しく表示される", () => {
    const { getByText } = render(
      <CustomerPurchaseHistory
        customer={mockCustomer}
        modalMode="detail"
        isMobile={false}
      />
    );

    // 購入履歴の内容が正しく表示されているか確認
    expect(getByText("注文ID")).toBeInTheDocument();
    expect(getByText("001")).toBeInTheDocument();
    expect(getByText("2023-09-01")).toBeInTheDocument();
    expect(getByText("¥1,200")).toBeInTheDocument();
    expect(getByText("002")).toBeInTheDocument();
    expect(getByText("2023-09-02")).toBeInTheDocument();
    expect(getByText("¥3,000")).toBeInTheDocument();
  });

  it("編集モードで購入履歴が入力フィールドとして表示される", () => {
    const { getAllByDisplayValue } = render(
      <CustomerPurchaseHistory
        customer={mockCustomer}
        modalMode="edit"
        isMobile={false}
      />
    );

    // 購入履歴の内容が入力フィールドとして表示されているか確認
    expect(getAllByDisplayValue("001").length).toBeGreaterThan(0);
    expect(getAllByDisplayValue("2023-09-01").length).toBeGreaterThan(0);
    expect(getAllByDisplayValue("1200").length).toBeGreaterThan(0);
    expect(getAllByDisplayValue("002").length).toBeGreaterThan(0);
    expect(getAllByDisplayValue("2023-09-02").length).toBeGreaterThan(0);
    expect(getAllByDisplayValue("3000").length).toBeGreaterThan(0);
  });

  it("編集モードで購入履歴に追加ボタンが表示される", () => {
    const { getByText } = render(
      <CustomerPurchaseHistory
        customer={mockCustomer}
        modalMode="edit"
        isMobile={false}
      />
    );

    // "購入履歴を追加"ボタンが表示されているか確認
    expect(getByText("購入履歴を追加")).toBeInTheDocument();
  });

  it("詳細モードで購入履歴に追加ボタンが表示されない", () => {
    const { queryByText } = render(
      <CustomerPurchaseHistory
        customer={mockCustomer}
        modalMode="detail"
        isMobile={false}
      />
    );

    // "購入履歴を追加"ボタンが表示されていないことを確認
    expect(queryByText("購入履歴を追加")).not.toBeInTheDocument();
  });
});
