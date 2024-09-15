import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerTableActions from "../../molecules/CustomerTableActions";
import { Customer } from "@/types/customer";

describe("CustomerTableActions", () => {
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

  it("モバイル表示で編集と削除アイコンボタンが表示される", () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { getByLabelText } = render(
      <CustomerTableActions
        customer={mockCustomer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isMobile={true}
      />
    );

    // 編集アイコンボタンが表示されているか確認
    const editButton = getByLabelText("Edit customer");
    expect(editButton).toBeInTheDocument();

    // 削除アイコンボタンが表示されているか確認
    const deleteButton = getByLabelText("Delete customer");
    expect(deleteButton).toBeInTheDocument();

    // 編集ボタンをクリックしてonEditが呼び出されるか確認
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCustomer);

    // 削除ボタンをクリックしてonDeleteが呼び出されるか確認
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockCustomer);
  });

  it("デスクトップ表示で編集と削除ボタンが表示される", () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { getByText } = render(
      <CustomerTableActions
        customer={mockCustomer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isMobile={false}
      />
    );

    // 編集ボタンが表示されているか確認
    const editButton = getByText("編集");
    expect(editButton).toBeInTheDocument();

    // 削除ボタンが表示されているか確認
    const deleteButton = getByText("削除");
    expect(deleteButton).toBeInTheDocument();

    // 編集ボタンをクリックしてonEditが呼び出されるか確認
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCustomer);

    // 削除ボタンをクリックしてonDeleteが呼び出されるか確認
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockCustomer);
  });
});
