import React from 'react';
import { Select, Stack, VStack, Box } from '@chakra-ui/react';
import CommonButton from '../atoms/CommonButton';
import CommonInput from '../atoms/CommonInput';

interface UserSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchRole: string;
  setSearchRole: (role: string) => void;
  handleSearch: (type: 'term' | 'role') => void;
  handleKeyPress: (event: React.KeyboardEvent, type: 'term' | 'role') => void;
  handleResetSearch: () => void;
  isSearchTermEmpty: boolean;
  isSearchRoleEmpty: boolean;
  isMobile: boolean;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  searchTerm,
  setSearchTerm,
  searchRole,
  setSearchRole,
  handleSearch,
  handleKeyPress,
  handleResetSearch,
  isSearchTermEmpty,
  isSearchRoleEmpty,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <VStack
        spacing={4}
        align="stretch"
        width="100%"
        data-testid="mobile-form">
        <CommonInput
          placeholder="ユーザー名またはメールアドレスで検索"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={e => handleKeyPress(e, 'term')}
        />
        <CommonButton
          variant="secondary"
          onClick={() => handleSearch('term')}
          isDisabled={isSearchTermEmpty}
          isFullWidthMobile
          data-testid="term-search-button">
          名前またはメール検索
        </CommonButton>
        <Box position="relative">
          <Select
            placeholder="役割を選択"
            value={searchRole}
            onChange={e => setSearchRole(e.target.value)}
            onKeyPress={e => handleKeyPress(e, 'role')}
            height="50px"
            fontSize="16px">
            <option value="ADMIN">管理者</option>
            <option value="MANAGER">マネージャー</option>
            <option value="STAFF">スタッフ</option>
          </Select>
        </Box>
        <CommonButton
          variant="secondary"
          onClick={() => handleSearch('role')}
          isDisabled={isSearchRoleEmpty}
          isFullWidthMobile>
          役割検索
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={handleResetSearch}
          isFullWidthMobile>
          検索結果をリセット
        </CommonButton>
      </VStack>
    );
  }

  return (
    <>
      <Stack direction="row" mb={5} spacing={3}>
        <CommonInput
          placeholder="ユーザー名またはメールアドレスで検索"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={e => handleKeyPress(e, 'term')}
        />
        <CommonButton
          variant="secondary"
          onClick={() => handleSearch('term')}
          isDisabled={isSearchTermEmpty}>
          名前またはメール検索
        </CommonButton>
      </Stack>
      <Stack direction="row" mb={5} spacing={3}>
        <Select
          placeholder="役割を選択"
          value={searchRole}
          onChange={e => setSearchRole(e.target.value)}
          onKeyPress={e => handleKeyPress(e, 'role')}>
          <option value="ADMIN">管理者</option>
          <option value="MANAGER">マネージャー</option>
          <option value="STAFF">スタッフ</option>
        </Select>
        <CommonButton
          variant="secondary"
          onClick={() => handleSearch('role')}
          isDisabled={isSearchRoleEmpty}>
          役割検索
        </CommonButton>
      </Stack>
      <CommonButton variant="primary" onClick={handleResetSearch} mb={5}>
        検索結果をリセット
      </CommonButton>
    </>
  );
};

export default UserSearchForm;
