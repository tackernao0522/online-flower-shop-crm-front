import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoleManagement from "../../organisms/RoleManagement";
import { Role } from "@/types/role";
import { ChakraProvider } from "@chakra-ui/react";

// モック関数を作成
const mockHandleAddRole = jest.fn();
const mockHandleEditRole = jest.fn();
const mockHandleDeleteRole = jest.fn();
const mockOnClose = jest.fn();
const mockRenderRoleForm = jest.fn(() => <div>Role Form</div>);

const roles: Role[] = [
  { id: 1, name: "管理者", description: "全システムの管理権限" },
  { id: 2, name: "スタッフ", description: "業務の管理権限" },
];

interface RoleManagementProps {
  roles: Role[];
  isMobile: boolean;
  modalSize: string;
  isOpen: boolean;
  onClose: () => void;
  modalMode: "add" | "edit" | "detail";
  handleAddRole: () => void;
  handleEditRole: (role: Role) => void;
  handleDeleteRole: (roleId: number) => void;
  renderRoleForm: () => React.ReactNode;
}

const defaultProps: RoleManagementProps = {
  roles,
  isMobile: false,
  modalSize: "md",
  isOpen: false,
  onClose: mockOnClose,
  modalMode: "add",
  handleAddRole: mockHandleAddRole,
  handleEditRole: mockHandleEditRole,
  handleDeleteRole: mockHandleDeleteRole,
  renderRoleForm: mockRenderRoleForm,
};

const renderWithChakra = (props: RoleManagementProps = defaultProps) =>
  render(
    <ChakraProvider>
      <RoleManagement {...props} />
    </ChakraProvider>
  );

describe("RoleManagementのテスト", () => {
  test("ロールが正しくレンダリングされることを確認", () => {
    renderWithChakra();

    expect(screen.getByText("管理者")).toBeInTheDocument();
    expect(screen.getByText("全システムの管理権限")).toBeInTheDocument();
    expect(screen.getByText("スタッフ")).toBeInTheDocument();
    expect(screen.getByText("業務の管理権限")).toBeInTheDocument();
  });

  test("新規ロール追加ボタンをクリックするとハンドラが呼ばれる", () => {
    renderWithChakra();

    const addButton = screen.getByText("新規ロール追加");
    fireEvent.click(addButton);

    expect(mockHandleAddRole).toHaveBeenCalled();
  });

  test("編集ボタンをクリックすると編集ハンドラが呼ばれる", () => {
    renderWithChakra();

    const editButtons = screen.getAllByText("編集");
    fireEvent.click(editButtons[0]);

    expect(mockHandleEditRole).toHaveBeenCalledWith(roles[0]);
  });

  test("削除ボタンをクリックすると削除ハンドラが呼ばれる", () => {
    renderWithChakra();

    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[0]);

    expect(mockHandleDeleteRole).toHaveBeenCalledWith(roles[0].id);
  });

  test("モーダルが開いている場合、ロールフォームが表示されることを確認", () => {
    renderWithChakra({ ...defaultProps, isOpen: true, modalMode: "add" });

    // モーダルの中の "新規ロール追加" を取得
    const modalHeader = screen.getByText("新規ロール追加", {
      selector: "header",
    });

    expect(modalHeader).toBeInTheDocument();

    // フォームが表示されているかを確認
    expect(screen.getByText("Role Form")).toBeInTheDocument();
  });

  test("モーダルを閉じるボタンをクリックするとモーダルが閉じる", () => {
    renderWithChakra({ ...defaultProps, isOpen: true });

    const closeButton = screen.getByText("キャンセル");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("モバイルビューではボタンがフル幅で表示されることを確認", () => {
    renderWithChakra({ ...defaultProps, isMobile: true });

    const addButton = screen.getByText("新規ロール追加");
    expect(addButton).toHaveStyle("width: 100%");
  });
});
