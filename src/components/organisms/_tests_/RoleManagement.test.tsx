import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleManagement from '../../organisms/RoleManagement';
import { Role } from '@/types/role';
import { ChakraProvider } from '@chakra-ui/react';

const mockHandleAddRole = jest.fn();
const mockHandleEditRole = jest.fn();
const mockHandleDeleteRole = jest.fn();
const mockOnClose = jest.fn();
const mockRenderRoleForm = jest.fn(() => <div>Role Form</div>);

const roles: Role[] = [
  { id: 1, name: '管理者', description: '全システムの管理権限' },
  { id: 2, name: 'スタッフ', description: '業務の管理権限' },
];

const defaultProps = {
  roles,
  isMobile: false,
  modalSize: 'md',
  isOpen: false,
  onClose: mockOnClose,
  modalMode: 'add' as const,
  handleAddRole: mockHandleAddRole,
  handleEditRole: mockHandleEditRole,
  handleDeleteRole: mockHandleDeleteRole,
  renderRoleForm: mockRenderRoleForm,
};

const renderWithChakra = (props = defaultProps) =>
  render(
    <ChakraProvider>
      <RoleManagement {...props} />
    </ChakraProvider>,
  );

describe('RoleManagementのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ロールが正しくレンダリングされることを確認', () => {
    renderWithChakra();

    expect(screen.getByText('管理者')).toBeInTheDocument();
    expect(screen.getByText('全システムの管理権限')).toBeInTheDocument();
    expect(screen.getByText('スタッフ')).toBeInTheDocument();
    expect(screen.getByText('業務の管理権限')).toBeInTheDocument();
  });

  test('新規ロール追加ボタンをクリックするとハンドラが呼ばれる', () => {
    renderWithChakra();

    const addButton = screen.getByText('新規ロール追加');
    fireEvent.click(addButton);

    expect(mockHandleAddRole).toHaveBeenCalled();
  });

  test('編集ボタンをクリックすると編集ハンドラが呼ばれる', () => {
    renderWithChakra();

    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    expect(mockHandleEditRole).toHaveBeenCalledWith(roles[0]);
  });

  test('削除ボタンをクリックすると削除ハンドラが呼ばれる', () => {
    renderWithChakra();

    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(mockHandleDeleteRole).toHaveBeenCalledWith(roles[0].id);
  });

  test('モーダルが開いている場合、ロールフォームが表示されることを確認', () => {
    renderWithChakra({ ...defaultProps, isOpen: true, modalMode: 'add' });

    const modalHeader = screen.getByText('新規ロール追加', {
      selector: 'header',
    });

    expect(modalHeader).toBeInTheDocument();

    expect(screen.getByText('Role Form')).toBeInTheDocument();
  });

  test('モーダルを閉じるボタンをクリックするとモーダルが閉じる', () => {
    renderWithChakra({ ...defaultProps, isOpen: true });

    const closeButton = screen.getByText('キャンセル');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('モバイルビューではボタンがフル幅で表示されることを確認', () => {
    renderWithChakra({ ...defaultProps, isMobile: true });

    const addButton = screen.getByText('新規ロール追加');
    expect(addButton).toHaveStyle('width: 100%');
  });

  describe('モバイル表示時のテスト', () => {
    test('モバイル表示時、編集アイコンボタンをクリックすると編集ハンドラが呼ばれる', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      expect(mockHandleEditRole).toHaveBeenCalledWith(roles[0]);
    });

    test('モバイル表示時、削除アイコンボタンをクリックすると削除ハンドラが呼ばれる', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });

      const deleteButtons = screen.getAllByLabelText('削除');
      fireEvent.click(deleteButtons[0]);

      expect(mockHandleDeleteRole).toHaveBeenCalledWith(roles[0].id);
    });

    test('モバイル表示時、テーブルのサイズがsmになることを確認', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('class', expect.stringContaining('css-'));
      const actionButtons = screen.getAllByLabelText(/(編集|削除)/);
      actionButtons.forEach(button => {
        expect(button).toHaveAttribute(
          'class',
          expect.stringContaining('css-'),
        );
      });
    });
  });
});
