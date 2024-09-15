import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerNotes from "../../molecules/CustomerNotes";
import { Customer } from "../../../types/customer.ts";

describe("CustomerNotes", () => {
  const mockCustomer: Customer = {
    id: "1",
    name: "山田 太郎",
    email: "yamada@example.com",
    phoneNumber: "090-1234-5678",
    address: "東京都千代田区1-2-3",
    birthDate: "1990-01-01",
    created_at: "2023-01-01",
    updated_at: "2023-01-02",
    purchaseHistory: [],
    notes: "これはテスト用のメモです",
  };

  it("詳細モードでメモが読み取り専用で表示される", () => {
    const { getByLabelText } = render(
      <CustomerNotes customer={mockCustomer} modalMode="detail" />
    );

    const textarea = getByLabelText("メモ");

    // メモの内容が表示されているか確認
    expect(textarea).toHaveValue("これはテスト用のメモです");
    // 読み取り専用になっているか確認
    expect(textarea).toHaveAttribute("readonly");
  });

  it("編集モードでメモが編集可能で表示される", () => {
    const { getByLabelText } = render(
      <CustomerNotes customer={mockCustomer} modalMode="edit" />
    );

    const textarea = getByLabelText("メモ");

    // メモの内容が表示されているか確認
    expect(textarea).toHaveValue("これはテスト用のメモです");
    // 読み取り専用でないことを確認
    expect(textarea).not.toHaveAttribute("readonly");
  });

  it("メモが未登録の場合、プレースホルダーが表示される", () => {
    const { getByPlaceholderText } = render(
      <CustomerNotes customer={null} modalMode="add" />
    );

    // プレースホルダーのテキストが表示されているか確認
    expect(
      getByPlaceholderText("顧客に関する特記事項を入力")
    ).toBeInTheDocument();
  });
});
