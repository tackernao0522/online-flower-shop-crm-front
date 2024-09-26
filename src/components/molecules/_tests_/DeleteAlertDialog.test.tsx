import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteAlertDialog from "../../molecules/DeleteAlertDialog";

describe("DeleteAlertDialog", () => {
  it("ダイアログが表示されるとアイテム名が正しく表示される", () => {
    const { getByText } = render(
      <DeleteAlertDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />
    );

    // ダイアログのタイトルが表示されているか確認
    expect(getByText("顧客を削除")).toBeInTheDocument();
    // アイテム名を含むメッセージが表示されているか確認
    expect(
      getByText("本当に山田 太郎を削除しますか？この操作は取り消せません。")
    ).toBeInTheDocument();
  });

  it("キャンセルボタンをクリックするとonCloseが呼び出される", () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <DeleteAlertDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />
    );

    // キャンセルボタンをクリック
    fireEvent.click(getByText("キャンセル"));

    // onCloseが呼び出されたか確認
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("削除ボタンをクリックするとonConfirmが呼び出される", () => {
    const mockOnConfirm = jest.fn();
    const { getByText } = render(
      <DeleteAlertDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={mockOnConfirm}
        itemName="山田 太郎"
        itemType="顧客"
      />
    );

    // 削除ボタンをクリック
    fireEvent.click(getByText("削除"));

    // onConfirmが呼び出されたか確認
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("ダイアログが閉じられると何も表示されない", () => {
    const { queryByText } = render(
      <DeleteAlertDialog
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />
    );

    // ダイアログが閉じられているので、タイトルが表示されていないことを確認
    expect(queryByText("顧客を削除")).not.toBeInTheDocument();
  });
});
