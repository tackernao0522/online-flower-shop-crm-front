import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagementTable from '../../organisms/UserManagementTable';
import { User } from '@/types/user';
import { ChakraProvider } from '@chakra-ui/react';

const mockHandleUserClick = jest.fn();
const mockHandleEditUser = jest.fn();
const mockHandleDeleteUser = jest.fn();
const mockLastElementRef = jest.fn();

const mockUsers: User[] = [
  {
    id: '1',
    username: 'テストユーザー1',
    email: 'test1@example.com',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'テストユーザー2',
    email: 'test2@example.com',
    role: 'STAFF',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProps = {
  users: mockUsers,
  isMobile: false,
  lastSearch: { type: 'term', value: '' },
  canDeleteUser: true,
  handleUserClick: mockHandleUserClick,
  handleEditUser: mockHandleEditUser,
  handleDeleteUser: mockHandleDeleteUser,
  lastElementRef: mockLastElementRef,
};

const renderWithChakra = (props = defaultProps) =>
  render(
    <ChakraProvider>
      <UserManagementTable {...props} />
    </ChakraProvider>,
  );

describe('UserManagementTableのテスト', () => {
  test('ユーザーのリストが正しくレンダリングされる', () => {
    renderWithChakra();

    expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
  });

  test('詳細ボタンをクリックするとhandleUserClickが呼ばれる', () => {
    renderWithChakra();

    const detailButton = screen.getAllByText('詳細')[0];
    fireEvent.click(detailButton);

    expect(mockHandleUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('編集ボタンをクリックするとhandleEditUserが呼ばれる', () => {
    renderWithChakra();

    const editButton = screen.getAllByText('編集')[0];
    fireEvent.click(editButton);

    expect(mockHandleEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('削除ボタンをクリックするとhandleDeleteUserが呼ばれる', () => {
    renderWithChakra();

    const deleteButton = screen.getAllByText('削除')[0];
    fireEvent.click(deleteButton);

    expect(mockHandleDeleteUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('モバイルビューで正しくレンダリングされる', () => {
    renderWithChakra({ ...defaultProps, isMobile: true });

    const detailButtons = screen.getAllByLabelText('詳細');
    expect(detailButtons.length).toBe(mockUsers.length);

    const editButtons = screen.getAllByLabelText('編集');
    expect(editButtons.length).toBe(mockUsers.length);

    const deleteButtons = screen.getAllByLabelText('削除');
    expect(deleteButtons.length).toBe(mockUsers.length);
  });

  test('ユーザーの最後の要素がrefに渡される', () => {
    renderWithChakra();

    expect(mockLastElementRef).toHaveBeenCalled();
  });

  test('モバイル表示時に詳細アイコンボタンをクリックするとhandleUserClickが呼ばれる', () => {
    renderWithChakra({ ...defaultProps, isMobile: true });
    const detailIconButtons = screen.getAllByLabelText('詳細');
    fireEvent.click(detailIconButtons[0]);
    expect(mockHandleUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('モバイル表示時に編集アイコンボタンをクリックするとhandleEditUserが呼ばれる', () => {
    renderWithChakra({ ...defaultProps, isMobile: true });
    const editIconButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editIconButtons[0]);
    expect(mockHandleEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('モバイル表示時に削除アイコンボタンをクリックするとhandleDeleteUserが呼ばれる', () => {
    renderWithChakra({ ...defaultProps, isMobile: true });
    const deleteIconButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteIconButtons[0]);
    expect(mockHandleDeleteUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('canDeleteUser=falseの場合、削除ボタンが表示されない', () => {
    renderWithChakra({ ...defaultProps, canDeleteUser: false });
    expect(screen.queryByText('削除')).toBeNull();
    renderWithChakra({ ...defaultProps, canDeleteUser: false, isMobile: true });
    expect(screen.queryByLabelText('削除')).toBeNull();
  });

  test("lastSearch.typeが'term'以外の場合、ユーザー名がnowrapで表示される", () => {
    renderWithChakra({
      ...defaultProps,
      lastSearch: { type: 'other', value: '' },
    });
    renderWithChakra({
      ...defaultProps,
      isMobile: true,
      lastSearch: { type: 'other', value: '' },
    });
  });
});
