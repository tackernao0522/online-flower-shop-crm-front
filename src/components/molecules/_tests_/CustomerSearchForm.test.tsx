import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerSearchForm from "../../molecules/CustomerSearchForm";

describe("CustomerSearchForm", () => {
  it("検索入力フィールドに値を入力できる", () => {
    const { getByPlaceholderText } = render(
      <CustomerSearchForm onSearch={() => {}} />
    );
    const input = getByPlaceholderText("顧客名または電話番号( - は除く)");

    // 入力フィールドに値を入力
    fireEvent.change(input, { target: { value: "山田" } });
    expect(input).toHaveValue("山田");
  });

  it("検索ボタンのクリックでonSearchが呼び出される", () => {
    const mockOnSearch = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <CustomerSearchForm onSearch={mockOnSearch} />
    );

    const input = getByPlaceholderText("顧客名または電話番号( - は除く)");
    const button = getByText("検索");

    // 入力フィールドに値を入力して検索ボタンをクリック
    fireEvent.change(input, { target: { value: "山田" } });
    fireEvent.click(button);

    // onSearchが呼び出されたか確認
    expect(mockOnSearch).toHaveBeenCalledWith("山田");
  });

  it("Enterキー押下でonSearchが呼び出される", () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomerSearchForm onSearch={mockOnSearch} />
    );

    const input = getByPlaceholderText("顧客名または電話番号( - は除く)");

    // 入力フィールドに値を入力してEnterキーを押下
    fireEvent.change(input, { target: { value: "山田" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // onSearchが呼び出されたか確認
    expect(mockOnSearch).toHaveBeenCalledWith("山田");
  });
});
