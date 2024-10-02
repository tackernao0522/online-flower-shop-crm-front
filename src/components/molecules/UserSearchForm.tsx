import React from "react";
import { Input, Button, Select, Stack, VStack, Box } from "@chakra-ui/react";

interface UserSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchRole: string;
  setSearchRole: (role: string) => void;
  handleSearch: (type: "term" | "role") => void;
  handleKeyPress: (event: React.KeyboardEvent, type: "term" | "role") => void;
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
      <VStack spacing={4} align="stretch" width="100%">
        <Input
          placeholder="ユーザー名またはメールアドレスで検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, "term")}
        />
        <Button
          onClick={() => handleSearch("term")}
          isDisabled={isSearchTermEmpty}
          width="100%">
          名前またはメール検索
        </Button>
        <Box position="relative">
          <Select
            placeholder="役割を選択"
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, "role")}
            height="50px"
            fontSize="16px">
            <option value="ADMIN">管理者</option>
            <option value="MANAGER">マネージャー</option>
            <option value="STAFF">スタッフ</option>
          </Select>
        </Box>
        <Button
          onClick={() => handleSearch("role")}
          isDisabled={isSearchRoleEmpty}
          width="100%">
          役割検索
        </Button>
        <Button onClick={handleResetSearch} width="100%">
          検索結果をリセット
        </Button>
      </VStack>
    );
  }

  return (
    <>
      <Stack direction="row" mb={5} spacing={3}>
        <Input
          placeholder="ユーザー名またはメールアドレスで検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, "term")}
        />
        <Button
          onClick={() => handleSearch("term")}
          isDisabled={isSearchTermEmpty}>
          名前またはメール検索
        </Button>
      </Stack>
      <Stack direction="row" mb={5} spacing={3}>
        <Select
          placeholder="役割を選択"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, "role")}>
          <option value="ADMIN">管理者</option>
          <option value="MANAGER">マネージャー</option>
          <option value="STAFF">スタッフ</option>
        </Select>
        <Button
          onClick={() => handleSearch("role")}
          isDisabled={isSearchRoleEmpty}>
          役割検索
        </Button>
      </Stack>
      <Button onClick={handleResetSearch} mb={5}>
        検索結果をリセット
      </Button>
    </>
  );
};

export default UserSearchForm;
