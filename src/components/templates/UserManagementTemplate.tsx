import React from 'react';
import {
  Box,
  Flex,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Text,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, LockIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { useUserManagement } from '@/hooks/useUserManagement';
import DeleteAlertDialog from '../molecules/DeleteAlertDialog';
import UserSearchForm from '../molecules/UserSearchForm';
import UserManagementTable from '../organisms/UserManagementTable';
import UserRegistrationModal from '../organisms/UserRegistrationModal';
import UserEditModal from '../organisms/UserEditModal';
import RoleManagement from '../organisms/RoleManagement';
import BackToDashboardButton from '../atoms/BackToDashboardButton';
import ScrollToTopButton from '../atoms/ScrollToTopButton';
import CommonButton from '../atoms/CommonButton';

const UserManagementTemplate: React.FC = () => {
  const router = useRouter();
  const {
    // State
    users,
    roles,
    status,
    error,
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
    permissions,

    // UI State
    isOpen,
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
    setSearchTerm,
    setSearchRole,
    setIsUserRegistrationModalOpen,
    lastElementRef,
    setCurrentView,
  } = useUserManagement();

  const renderRoleForm = () => {
    const roleItem = activeItem as Role | null;
    return (
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>ロール名</FormLabel>
          <Input defaultValue={roleItem?.name} />
        </FormControl>
        <FormControl>
          <FormLabel>説明</FormLabel>
          <Input defaultValue={roleItem?.description} />
        </FormControl>
        <Heading size="md" mt={4}>
          権限設定
        </Heading>
        {permissions.map(permission => (
          <Box key={permission.id} borderWidth={1} p={3} borderRadius="md">
            <FormControl>
              <FormLabel>{permission.name}</FormLabel>
              <HStack>
                {permission.actions.map(action => (
                  <Checkbox key={action}>{action}</Checkbox>
                ))}
              </HStack>
            </FormControl>
          </Box>
        ))}
      </VStack>
    );
  };

  const renderUserManagement = () => (
    <>
      <UserSearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchRole={searchRole}
        setSearchRole={setSearchRole}
        handleSearch={handleSearch}
        handleKeyPress={handleKeyPress}
        handleResetSearch={handleResetSearch}
        isSearchTermEmpty={isSearchTermEmpty}
        isSearchRoleEmpty={isSearchRoleEmpty}
        isMobile={isMobile ?? false}
      />

      {lastSearch.value && (
        <Text>
          最後の検索: {lastSearch.type === 'term' ? '名前/メール' : '役割'} -{' '}
          {lastSearch.value === '' ? '全ての役割' : lastSearch.value}
        </Text>
      )}

      <Text>
        総ユーザー数: {totalUsers !== null ? totalUsers : '読み込み中...'}
      </Text>

      {users && users.length > 0 ? (
        <>
          <UserManagementTable
            users={users}
            isMobile={isMobile ?? false}
            lastSearch={lastSearch}
            canDeleteUser={canDeleteUser}
            handleUserClick={handleUserClick}
            handleEditUser={handleEditUser}
            handleDeleteUser={handleDeleteUser}
            lastElementRef={lastElementRef}
          />
          <Flex justify="center" my={4}>
            <Text color="red">
              {users.length >= (totalUsers ?? 0)
                ? `すべてのユーザーを表示しました (${totalUsers ?? 0}名)`
                : `${users.length}名のユーザーを表示中 (全${totalUsers ?? 0}名)`}
            </Text>
          </Flex>
        </>
      ) : (
        <Text color="red.500" fontWeight="bold">
          検索条件に一致するユーザーが見つかりませんでした。
        </Text>
      )}
      {status === 'loading' && (
        <Flex justify="center" my={4}>
          <Spinner />
        </Flex>
      )}

      <UserEditModal
        isOpen={isOpen}
        onClose={onClose}
        modalMode={modalMode}
        activeItem={activeItem as User}
        handleEditUserChange={handleEditUserChange}
        handleSaveUser={handleSaveUser}
      />

      <UserRegistrationModal
        isOpen={isUserRegistrationModalOpen}
        onClose={() => setIsUserRegistrationModalOpen(false)}
        newUserFormData={newUserFormData}
        handleNewUserChange={handleNewUserChange}
        handleNewUserSubmit={handleNewUserSubmit}
      />
    </>
  );

  const renderRoleManagement = () => (
    <RoleManagement
      roles={roles}
      isMobile={isMobile ?? false}
      modalSize={modalSize ?? 'md'}
      isOpen={isOpen}
      onClose={onClose}
      modalMode={modalMode}
      handleAddRole={handleAddRole}
      handleEditRole={handleEditRole}
      handleDeleteRole={handleDeleteRole}
      renderRoleForm={renderRoleForm}
    />
  );

  if (status === 'loading' && users.length === 0) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (status === 'failed') {
    return (
      <Box textAlign="center" p={5}>
        <Text fontSize="xl" color="red.500">
          エラーが発生しました: {error ? JSON.stringify(error) : '不明なエラー'}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        flexDirection={flexDirection}>
        <Heading as="h1" size="xl" mb={isMobile ? 4 : 0}>
          {currentView === 'users' ? 'ユーザー管理' : 'ロールと権限管理'}
        </Heading>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          width={isMobile ? '100%' : 'auto'}>
          {currentView === 'users' && (
            <>
              <CommonButton
                variant="primary"
                withIcon={<AddIcon />}
                onClick={handleAddUser}
                isFullWidthMobile>
                新規ユーザー登録
              </CommonButton>
              <CommonButton
                variant="success"
                withIcon={<LockIcon />}
                onClick={handleRolesAndPermissions}
                isFullWidthMobile>
                ロールと権限管理
              </CommonButton>
            </>
          )}
          <BackToDashboardButton
            onClick={() =>
              currentView === 'roles'
                ? setCurrentView('users')
                : router.push('/dashboard')
            }
            customText={
              currentView === 'roles'
                ? 'ユーザー管理に戻る'
                : 'ダッシュボードへ戻る'
            }
            w={isMobile ? '100%' : 'auto'}
          />
        </Stack>
      </Flex>

      {currentView === 'users'
        ? renderUserManagement()
        : renderRoleManagement()}

      <ScrollToTopButton />

      <DeleteAlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={userToDelete?.username || ''}
        itemType="ユーザー"
      />
    </Box>
  );
};

export default UserManagementTemplate;
