import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserEditModal from '../../organisms/UserEditModal';
import { User } from '@/types/user';
import { ChakraProvider } from '@chakra-ui/react';

const mockOnClose = jest.fn();
const mockHandleEditUserChange = jest.fn();
const mockHandleSaveUser = jest.fn();

const activeUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'テストユーザー',
  email: 'test@example.com',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  modalMode: 'edit' as 'detail' | 'add' | 'edit',
  activeItem: activeUser as User | null,
  handleEditUserChange: mockHandleEditUserChange,
  handleSaveUser: mockHandleSaveUser,
};

const renderWithChakra = (props = defaultProps) =>
  render(
    <ChakraProvider>
      <UserEditModal {...props} />
    </ChakraProvider>,
  );

describe('UserEditModalのテスト', () => {
  test('ユーザー詳細モーダルが正しくレンダリングされることを確認', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'detail' });

    expect(screen.getByText('ユーザー詳細')).toBeInTheDocument();
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // `ADMIN` が正しく表示されているか確認
    expect(screen.getByText('ADMIN')).toBeInTheDocument();

    expect(screen.getByText('アクティブ')).toBeInTheDocument();
  });

  test('ユーザー編集モーダルが正しくレンダリングされ、フォームが表示される', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'edit' });

    expect(screen.getByText('ユーザー編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();

    const adminOption = screen.getByRole('option', {
      name: '管理者',
    }) as HTMLOptionElement;
    expect(adminOption.selected).toBe(true);
  });

  test('新規ユーザー登録モーダルが正しくレンダリングされることを確認', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'add', activeItem: null });

    expect(screen.getByText('新規ユーザー登録')).toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとモーダルが閉じる', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'detail' });

    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('キャンセルボタンをクリックするとモーダルが閉じる (編集モード)', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'edit' });

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('保存ボタンをクリックするとユーザーが保存される', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'edit' });

    const saveButton = screen.getByText('更新');
    fireEvent.click(saveButton);

    expect(mockHandleSaveUser).toHaveBeenCalledWith(activeUser);
  });

  test('フォームの入力値が変更されるとハンドラが呼ばれる', () => {
    renderWithChakra({ ...defaultProps, modalMode: 'edit' });

    const usernameInput = screen.getByDisplayValue('テストユーザー');
    fireEvent.change(usernameInput, {
      target: { value: '変更されたユーザー名' },
    });

    expect(mockHandleEditUserChange).toHaveBeenCalled();
  });

  test('モバイルビューで正しくレンダリングされることを確認', () => {
    renderWithChakra({ ...defaultProps, isOpen: true, modalMode: 'edit' });

    const drawerHeader = screen.getByText('ユーザー編集');
    expect(drawerHeader).toBeInTheDocument();
  });
});
