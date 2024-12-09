import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import UserManagementTemplate from '../UserManagementTemplate';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useUserManagement');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('UserManagementTemplate', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUserManagement = {
    users: [],
    roles: [],
    status: 'idle',
    error: null,
    totalUsers: 0,
    activeItem: null,
    modalMode: 'detail',
    currentView: 'users',
    searchTerm: '',
    searchRole: '',
    lastSearch: { type: '', value: '' },
    isDeleteAlertOpen: false,
    userToDelete: null,
    isUserRegistrationModalOpen: false,
    newUserFormData: {
      username: '',
      email: '',
      role: '',
      isActive: true,
    },
    canDeleteUser: true,
    isSearchTermEmpty: true,
    isSearchRoleEmpty: true,
    permissions: [],
    isOpen: false,
    onClose: jest.fn(),
    isMobile: false,
    modalSize: 'md',
    handleSearch: jest.fn(),
    handleResetSearch: jest.fn(),
    handleKeyPress: jest.fn(),
    handleUserClick: jest.fn(),
    handleAddUser: jest.fn(),
    handleEditUser: jest.fn(),
    handleDeleteUser: jest.fn(),
    confirmDelete: jest.fn(),
    cancelDelete: jest.fn(),
    handleNewUserChange: jest.fn(),
    handleNewUserSubmit: jest.fn(),
    handleEditUserChange: jest.fn(),
    handleSaveUser: jest.fn(),
    handleRolesAndPermissions: jest.fn(),
    handleAddRole: jest.fn(),
    handleEditRole: jest.fn(),
    handleDeleteRole: jest.fn(),
    setSearchTerm: jest.fn(),
    setSearchRole: jest.fn(),
    setIsUserRegistrationModalOpen: jest.fn(),
    lastElementRef: jest.fn(),
    setCurrentView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUserManagement as jest.Mock).mockReturnValue(mockUserManagement);
  });

  it('ユーザー管理画面が正しくレンダリングされる', () => {
    renderWithChakra(<UserManagementTemplate />);
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
    expect(screen.getByText('新規ユーザー登録')).toBeInTheDocument();
    expect(screen.getByText('ロールと権限管理')).toBeInTheDocument();
  });

  it('ローディング中の表示が正しく動作する', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      status: 'loading',
      users: [],
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('エラー時の表示が正しく動作する', () => {
    const errorMessage = 'テストエラー';
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      status: 'failed',
      error: errorMessage,
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(
      screen.getByText(`エラーが発生しました: "${errorMessage}"`),
    ).toBeInTheDocument();
  });

  it('ユーザー検索が正しく動作する', () => {
    renderWithChakra(<UserManagementTemplate />);
    const searchInput =
      screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockUserManagement.setSearchTerm).toHaveBeenCalledWith('test');
  });

  it('新規ユーザー登録ボタンが正しく動作する', () => {
    renderWithChakra(<UserManagementTemplate />);
    const addButton = screen.getByText('新規ユーザー登録');
    fireEvent.click(addButton);
    expect(mockUserManagement.handleAddUser).toHaveBeenCalled();
  });

  it('ロールと権限管理への切り替えが正しく動作する', () => {
    renderWithChakra(<UserManagementTemplate />);
    const roleButton = screen.getByText('ロールと権限管理');
    fireEvent.click(roleButton);
    expect(mockUserManagement.handleRolesAndPermissions).toHaveBeenCalled();
  });

  it('ユーザーが存在しない場合のメッセージが表示される', () => {
    renderWithChakra(<UserManagementTemplate />);
    expect(
      screen.getByText('検索条件に一致するユーザーが見つかりませんでした。'),
    ).toBeInTheDocument();
  });

  it('ユーザー一覧が正しく表示される', () => {
    const mockUsers = [
      {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
      },
    ];

    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      users: mockUsers,
      totalUsers: 1,
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('ロールと権限管理画面が正しく表示される', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      currentView: 'roles',
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(screen.getByText('ロールと権限管理')).toBeInTheDocument();
    expect(screen.getByText('ユーザー管理に戻る')).toBeInTheDocument();
  });

  it('削除確認ダイアログが正しく表示される', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      isDeleteAlertOpen: true,
      userToDelete: { username: 'testuser' },
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('ダッシュボードへの戻るボタンが正しく動作する', () => {
    renderWithChakra(<UserManagementTemplate />);
    const backButton = screen.getByText('ダッシュボードへ戻る');
    fireEvent.click(backButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
});
