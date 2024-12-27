import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import UserManagementTemplate from '../UserManagementTemplate';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useRouter } from 'next/navigation';

jest.mock('@chakra-ui/media-query', () => ({
  ...jest.requireActual('@chakra-ui/media-query'),
  useBreakpointValue: jest.fn().mockImplementation(() => false),
}));

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

  describe('ロールと権限管理機能', () => {
    it('権限設定フォームが正しく表示される', () => {
      const mockRole = {
        id: '1',
        name: 'テストロール',
        description: 'テスト用ロール',
      };

      const mockPermissions = [
        {
          id: '1',
          name: 'ユーザー管理',
          actions: ['読取', '作成', '更新', '削除'],
        },
      ];

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        currentView: 'roles',
        isOpen: true,
        modalMode: 'edit',
        activeItem: mockRole,
        permissions: mockPermissions,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(screen.getByText('ロールと権限管理')).toBeInTheDocument();
      expect(screen.getByText('新規ロール追加')).toBeInTheDocument();
      expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
      mockPermissions[0].actions.forEach(action => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it('ロールの編集モードが正しく動作する', () => {
      const mockRole = {
        id: '1',
        name: 'テストロール',
        description: 'テスト用ロール',
      };

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        currentView: 'roles',
        isOpen: true,
        modalMode: 'edit',
        activeItem: mockRole,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(screen.getByText('ロールと権限管理')).toBeInTheDocument();
      expect(screen.getByText('ユーザー管理に戻る')).toBeInTheDocument();
    });
  });

  describe('モーダルとビューの状態管理', () => {
    it('新規ユーザー登録モーダルが閉じられる', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        isUserRegistrationModalOpen: true,
        currentView: 'users',
      });

      renderWithChakra(<UserManagementTemplate />);

      const closeButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(closeButton);

      expect(
        mockUserManagement.setIsUserRegistrationModalOpen,
      ).toHaveBeenCalledWith(false);
    });

    it('最後の検索条件が表示される', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: { type: 'term', value: 'test@example.com' },
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText(/最後の検索: 名前\/メール - test@example.com/),
      ).toBeInTheDocument();
    });

    it('検索結果の総数が表示される', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: Array(20).fill({}),
        totalUsers: 50,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('20名のユーザーを表示中 (全50名)'),
      ).toBeInTheDocument();
    });
  });

  it('条件に一致するユーザーがない場合のメッセージが表示される', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUserManagement,
      users: [],
      status: 'succeeded',
    });

    renderWithChakra(<UserManagementTemplate />);
    expect(
      screen.getByText('検索条件に一致するユーザーが見つかりませんでした。'),
    ).toBeInTheDocument();
  });

  describe('デフォルト値とエッジケース', () => {
    it('モバイルとモーダルサイズのデフォルト値が適用される', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        isMobile: undefined,
        modalSize: undefined,
        currentView: 'roles',
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(screen.getByText('ロールと権限管理')).toBeInTheDocument();
    });

    it('検索条件が適切にフォーマットされて表示される', async () => {
      const mockValue1 = {
        ...mockUserManagement,
        lastSearch: {
          type: 'term',
          value: 'test',
        },
      };

      (useUserManagement as jest.Mock).mockReturnValue(mockValue1);
      const { rerender } = renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('最後の検索: 名前/メール - test'),
      ).toBeInTheDocument();

      const mockValue2 = {
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: 'dummy',
        },
      };

      (useUserManagement as jest.Mock).mockReturnValue(mockValue2);
      rerender(<UserManagementTemplate />);
      expect(screen.getByText('最後の検索: 役割 - dummy')).toBeInTheDocument();
    });

    it('ユーザーテーブルが適切に表示され、最大表示数に達した場合のメッセージが表示される', () => {
      const mockUsers = Array(10).fill({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
      });

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: mockUsers,
        totalUsers: 10,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('すべてのユーザーを表示しました (10名)'),
      ).toBeInTheDocument();
    });

    it('エラーメッセージが適切に表示される（エラーがnullの場合）', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        status: 'failed',
        error: null,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('エラーが発生しました: 不明なエラー'),
      ).toBeInTheDocument();
    });

    it('ロール管理ビューからユーザー管理への戻るボタンが機能する', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        currentView: 'roles',
      });

      renderWithChakra(<UserManagementTemplate />);
      const backButton = screen.getByText('ユーザー管理に戻る');
      fireEvent.click(backButton);
      expect(mockUserManagement.setCurrentView).toHaveBeenCalledWith('users');
    });

    it('モバイル表示のデフォルト値が正しく動作する', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        isMobile: undefined,
        users: [
          {
            id: '1',
            username: 'test',
            email: 'test@example.com',
            role: 'USER',
            isActive: true,
          },
        ],
        totalUsers: 1,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('totalUsersの表示が正しく動作する', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        totalUsers: null,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('総ユーザー数: 読み込み中...'),
      ).toBeInTheDocument();
    });

    it('ユーザー数表示のエッジケースが正しく動作する', () => {
      const mockUsers = Array(5).fill({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
      });

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: mockUsers,
        totalUsers: 10,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('5名のユーザーを表示中 (全10名)'),
      ).toBeInTheDocument();
    });

    it('lastSearchの値が空の場合の表示', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: 'dummy',
        },
      });

      const { rerender } = renderWithChakra(<UserManagementTemplate />);
      expect(screen.getByText('最後の検索: 役割 - dummy')).toBeInTheDocument();

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: '',
        },
      });

      rerender(<UserManagementTemplate />);
      expect(screen.queryByText(/最後の検索:/)).not.toBeInTheDocument();
    });

    it('ユーザー表示の境界値ケース', () => {
      const mockUsers = Array(10).fill({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
      });

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: mockUsers,
        totalUsers: 10,
      });

      const { rerender } = renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('すべてのユーザーを表示しました (10名)'),
      ).toBeInTheDocument();

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: [],
        totalUsers: 0,
      });

      rerender(<UserManagementTemplate />);
      expect(
        screen.getByText('検索条件に一致するユーザーが見つかりませんでした。'),
      ).toBeInTheDocument();
    });

    it('lastSearchとtotalUsersのnullケースを含むエッジケース', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: Array(5).fill({
          id: '1',
          username: 'test',
          email: 'test@example.com',
        }),
        totalUsers: null,
      });

      renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('すべてのユーザーを表示しました (0名)'),
      ).toBeInTheDocument();

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: '',
        },
      });

      expect(screen.queryByText(/最後の検索/)).not.toBeInTheDocument();
    });

    it('ユーザー表示の全パターンをカバー', () => {
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        users: Array(3).fill({
          id: '1',
          username: 'test',
          email: 'test@example.com',
        }),
        totalUsers: 5,
        lastSearch: {
          type: 'role',
          value: 'dummy',
        },
      });

      const { rerender } = renderWithChakra(<UserManagementTemplate />);
      expect(
        screen.getByText('3名のユーザーを表示中 (全5名)'),
      ).toBeInTheDocument();
      expect(screen.getByText('最後の検索: 役割 - dummy')).toBeInTheDocument();

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: 'dummy',
        },
      });

      rerender(<UserManagementTemplate />);
      expect(screen.getByText('最後の検索: 役割 - dummy')).toBeInTheDocument();

      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUserManagement,
        lastSearch: {
          type: 'role',
          value: '',
        },
      });

      rerender(<UserManagementTemplate />);
      expect(screen.queryByText(/最後の検索/)).not.toBeInTheDocument();
    });
  });
});
