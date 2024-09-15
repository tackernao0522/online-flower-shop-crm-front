import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerBasicInfo from "../../molecules/CustomerBasicInfo";
import { Customer } from "../../../types/customer";

describe("CustomerBasicInfo", () => {
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
  };

  const newCustomer = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
  };

  const formErrors = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
  };

  const handleInputChange = jest.fn();

  it("詳細モードで顧客情報が正しく表示される", () => {
    const { getByText } = render(
      <CustomerBasicInfo
        customer={mockCustomer}
        modalMode="detail"
        newCustomer={newCustomer}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
      />
    );

    // 顧客の各情報が表示されているかを確認
    expect(getByText("名前:")).toBeInTheDocument();
    expect(getByText("山田 太郎")).toBeInTheDocument();
    expect(getByText("メールアドレス:")).toBeInTheDocument();
    expect(getByText("yamada@example.com")).toBeInTheDocument();
    expect(getByText("電話番号:")).toBeInTheDocument();
    expect(getByText("090-1234-5678")).toBeInTheDocument();
    expect(getByText("住所:")).toBeInTheDocument();
    expect(getByText("東京都千代田区1-2-3")).toBeInTheDocument();
    expect(getByText("生年月日:")).toBeInTheDocument();
    expect(getByText("1990-01-01")).toBeInTheDocument();
  });

  it("編集モードでフォームが表示される", () => {
    const { getByLabelText } = render(
      <CustomerBasicInfo
        customer={null}
        modalMode="edit"
        newCustomer={newCustomer}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
      />
    );

    // フォームの各フィールドが表示されているかを確認
    expect(getByLabelText("名前")).toBeInTheDocument();
    expect(getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(getByLabelText("電話番号")).toBeInTheDocument();
    expect(getByLabelText("住所")).toBeInTheDocument();
    expect(getByLabelText("生年月日")).toBeInTheDocument();
  });

  it("入力フィールドの変更がhandleInputChangeを呼び出す", () => {
    const { getByLabelText } = render(
      <CustomerBasicInfo
        customer={null}
        modalMode="edit"
        newCustomer={newCustomer}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
      />
    );

    // 名前フィールドを変更
    const nameInput = getByLabelText("名前");
    fireEvent.change(nameInput, { target: { value: "鈴木 一郎" } });

    // handleInputChangeが呼び出されているか確認
    expect(handleInputChange).toHaveBeenCalled();
  });
});
