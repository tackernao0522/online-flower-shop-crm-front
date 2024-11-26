import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  resetUsersState,
} from '@/features/users/usersSlice';
import { fetchRoles, deleteRole } from '@/features/roles/rolesSlice';
import { updateUserRole, setUser } from '@/features/auth/authSlice';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useWebSocket } from '@/hooks/useWebSocket';
import { User } from '@/types/user';
import { Role } from '@/types/role';

// フォームデータの型定義
interface NewUserFormData {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
}

// 検索状態の型定義
interface SearchState {
  type: string;
  value: string;
}

// パーミッションの型定義
interface Permission {
  id: number;
  name: string;
  actions: string[];
}

export const useUserManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Redux State
  const usersState = useSelector((state: RootState) => state.users);
  const { users, status, error, currentPage, totalPages, totalCount } =
    usersState;
  const roles = useSelector((state: RootState) => state.roles.roles);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Local State
  const [activeItem, setActiveItem] = useState<User | Role | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'add' | 'edit'>(
    'detail',
  );
  const [currentView, setCurrentView] = useState<'users' | 'roles'>('users');
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [lastSearch, setLastSearch] = useState<SearchState>({
    type: '',
    value: '',
  });

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isUserRegistrationModalOpen, setIsUserRegistrationModalOpen] =
    useState(false);
  const [canDeleteUser, setCanDeleteUser] = useState(false);

  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
    isActive: true,
  });

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' }) as
    | 'column'
    | 'row';
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' });

  // WebSocket
  const { totalUserCount } = useWebSocket();

  // 権限設定の定数
  const permissions: Permission[] = [
    { id: 1, name: '顧客管理', actions: ['表示', '作成', '編集', '削除'] },
    { id: 2, name: '注文管理', actions: ['表示', '作成', '編集', '削除'] },
    { id: 3, name: '配送管理', actions: ['表示', '更新'] },
    {
      id: 4,
      name: 'キャンペーン管理',
      actions: ['表示', '作成', '編集', '削除'],
    },
    { id: 5, name: 'レポート閲覧', actions: ['表示'] },
  ];

  // Computed values
  const isSearchTermEmpty = searchTerm.trim() === '';
  const isSearchRoleEmpty = searchRole === '';

  // 無限スクロール関連
  const loadMore = useCallback(() => {
    if (currentPage < totalPages && status !== 'loading') {
      console.log('Loading more users...');
      dispatch(
        fetchUsers({
          page: currentPage + 1,
          search: lastSearch.type === 'term' ? lastSearch.value : '',
          role: lastSearch.type === 'role' ? lastSearch.value : '',
          isNewSearch: false,
        }),
      );
    }
  }, [dispatch, currentPage, totalPages, lastSearch, status]);

  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore);

  // Effects
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?.role === 'STAFF') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const newCanDeleteUser = currentUser?.role === 'ADMIN';
    setCanDeleteUser(newCanDeleteUser);
  }, [currentUser]);

  useEffect(() => {
    dispatch(resetUsersState());
    dispatch(fetchUsers({ page: 1, search: '', role: '', isNewSearch: true }));
    dispatch(fetchRoles());
    setSearchTerm('');
    setSearchRole('');
    setLastSearch({ type: '', value: '' });

    return () => {
      dispatch(resetUsersState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (totalUserCount !== null) {
      setTotalUsers(totalUserCount);
    } else if (totalCount !== null) {
      setTotalUsers(totalCount);
    }
  }, [totalUserCount, totalCount]);

  useEffect(() => {
    setHasMore(currentPage < totalPages);
  }, [currentPage, totalPages]);

  // Handlers
  const handleSearch = useCallback(
    (type: 'term' | 'role') => {
      const searchValue = type === 'term' ? searchTerm : searchRole;
      dispatch(
        fetchUsers({
          page: 1,
          search: type === 'term' ? searchValue : '',
          role: type === 'role' ? searchValue : '',
          isNewSearch: true,
        }),
      );
      setLastSearch({ type, value: searchValue });
      setHasMore(true);
      type === 'term' ? setSearchTerm('') : setSearchRole('');
    },
    [dispatch, searchTerm, searchRole],
  );

  const handleResetSearch = useCallback(() => {
    dispatch(resetUsersState());
    dispatch(fetchUsers({ page: 1, search: '', role: '', isNewSearch: true }));
    setSearchTerm('');
    setSearchRole('');
    setLastSearch({ type: '', value: '' });
  }, [dispatch]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent, type: 'term' | 'role') => {
      if (event.key === 'Enter') {
        handleSearch(type);
      }
    },
    [handleSearch],
  );

  // User management handlers
  const handleUserClick = useCallback(
    (user: User) => {
      setActiveItem(user);
      setModalMode('detail');
      onOpen();
    },
    [onOpen],
  );

  const handleAddUser = useCallback(() => {
    setIsUserRegistrationModalOpen(true);
  }, []);

  const handleEditUser = useCallback(
    (user: User) => {
      setActiveItem(user);
      setModalMode('edit');
      onOpen();
    },
    [onOpen],
  );

  const handleDeleteUser = useCallback((user: User) => {
    console.log('handleDeleteUser called', user);
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete.id)).unwrap();
        toast({
          title: 'ユーザーを削除しました',
          description: `${userToDelete.username} の情報が削除されました。`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: 'ユーザーの削除に失敗しました',
          description: `エラー: ${error.message || JSON.stringify(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, dispatch, toast]);

  const cancelDelete = useCallback(() => {
    setIsDeleteAlertOpen(false);
    setUserToDelete(null);
  }, []);

  // Form handlers
  const handleNewUserChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewUserFormData(prev => ({
        ...prev,
        [name]:
          name === 'isActive'
            ? value === 'true'
            : name === 'role'
              ? (value as 'ADMIN' | 'MANAGER' | 'STAFF')
              : value,
      }));
    },
    [],
  );

  const handleNewUserSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        console.log('Submitting new user data:', newUserFormData);
        const result = await dispatch(addUser(newUserFormData)).unwrap();
        console.log('New user added:', result);
        toast({
          title: 'ユーザーが登録されました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsUserRegistrationModalOpen(false);
        setNewUserFormData({
          username: '',
          email: '',
          password: '',
          role: 'STAFF',
          isActive: true,
        });
      } catch (error: any) {
        console.error('Error in handleNewUserSubmit:', error);
        toast({
          title: 'ユーザー登録に失敗しました',
          description: error.message || JSON.stringify(error),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [dispatch, newUserFormData, toast],
  );

  const handleEditUserChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setActiveItem(prev => {
        if (prev) {
          if ('isActive' in prev) {
            return {
              ...prev,
              [name]: name === 'isActive' ? value === 'true' : value,
              isActive: name === 'isActive' ? value === 'true' : prev.isActive,
            } as User;
          } else {
            return {
              ...prev,
              [name]: value,
            } as Role;
          }
        }
        return prev;
      });
    },
    [],
  );

  const handleSaveUser = useCallback(
    async (updatedUser: User) => {
      try {
        console.log('Saving user:', updatedUser);
        const result = await dispatch(
          updateUser({ id: updatedUser.id, userData: updatedUser }),
        ).unwrap();
        console.log('Updated user:', result);

        if (currentUser && currentUser.id === updatedUser.id) {
          console.log('Updating current user role to:', result.role);
          dispatch(
            updateUserRole(result.role as 'ADMIN' | 'MANAGER' | 'STAFF'),
          );
        }

        toast({
          title: 'ユーザー情報を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } catch (error: any) {
        console.error('Error saving user:', error);
        toast({
          title: 'ユーザー情報の更新に失敗しました',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [currentUser, dispatch, onClose, toast],
  );

  // Role management handlers
  const handleRolesAndPermissions = useCallback(() => {
    setCurrentView('roles');
  }, []);

  const handleAddRole = useCallback(() => {
    setActiveItem(null);
    setModalMode('add');
    onOpen();
  }, [onOpen]);

  const handleEditRole = useCallback(
    (role: Role) => {
      setActiveItem(role);
      setModalMode('edit');
      onOpen();
    },
    [onOpen],
  );

  const handleDeleteRole = useCallback(
    (roleId: number) => {
      dispatch(deleteRole(roleId));
    },
    [dispatch],
  );

  // View handlers
  const handleViewChange = useCallback((view: 'users' | 'roles') => {
    setCurrentView(view);
  }, []);

  return {
    // State
    users,
    roles,
    status,
    error,
    currentPage,
    totalPages,
    totalCount,
    totalUsers,
    activeItem,
    modalMode,
    currentView,
    hasMore,
    searchTerm,
    searchRole,
    lastSearch,
    isDeleteAlertOpen,
    userToDelete,
    isUserRegistrationModalOpen,
    newUserFormData,
    canDeleteUser,
    isSearchTermEmpty,
    isSearchRoleEmpty,
    currentUser,
    permissions,

    // UI State
    isOpen,
    onOpen,
    onClose,
    isMobile,
    flexDirection,
    modalSize,

    // Handlers
    handleSearch,
    handleResetSearch,
    handleKeyPress,
    handleUserClick,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    confirmDelete,
    cancelDelete,
    handleNewUserChange,
    handleNewUserSubmit,
    handleEditUserChange,
    handleSaveUser,
    handleRolesAndPermissions,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleViewChange,
    setSearchTerm,
    setSearchRole,
    setIsUserRegistrationModalOpen,
    lastElementRef,

    // View State
    setCurrentView,
  };
};

export type UseUserManagementReturn = ReturnType<typeof useUserManagement>;
