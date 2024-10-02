import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Stack,
  Text,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { User } from "@/types/user";

interface UserManagementTableProps {
  users: User[];
  isMobile: boolean;
  lastSearch: { type: string; value: string };
  canDeleteUser: boolean;
  handleUserClick: (user: User) => void;
  handleEditUser: (user: User) => void;
  handleDeleteUser: (user: User) => void;
  lastElementRef: (node: HTMLElement | null) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isMobile,
  lastSearch,
  canDeleteUser,
  handleUserClick,
  handleEditUser,
  handleDeleteUser,
  lastElementRef,
}) => {
  return (
    <Box overflowX="auto">
      <Table variant="simple" size={isMobile ? "sm" : "md"}>
        <Thead>
          <Tr>
            <Th minWidth={isMobile ? "60px" : "auto"}>ID</Th>
            <Th minWidth={isMobile ? "100px" : "auto"}>ユーザー名</Th>
            <Th minWidth={isMobile ? "150px" : "auto"}>メールアドレス</Th>
            <Th minWidth={isMobile ? "80px" : "auto"}>役割</Th>
            <Th minWidth={isMobile ? "80px" : "auto"}>ステータス</Th>
            <Th minWidth={isMobile ? "120px" : "auto"}>アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user, index) => (
            <Tr
              key={`${user.id}-${index}`}
              ref={index === users.length - 1 ? lastElementRef : null}>
              <Td>{user.id}</Td>
              <Td>
                {isMobile && lastSearch.type === "term" ? (
                  <Text whiteSpace="normal" wordBreak="break-word">
                    {user.username}
                  </Text>
                ) : (
                  <Text whiteSpace="nowrap">{user.username}</Text>
                )}
              </Td>
              <Td>{user.email}</Td>
              <Td>{user.role}</Td>
              <Td>
                <Badge
                  colorScheme={
                    user.isActive ?? user.is_active ? "green" : "red"
                  }>
                  {user.isActive ?? user.is_active
                    ? "アクティブ"
                    : "非アクティブ"}
                </Badge>
              </Td>
              <Td>
                {isMobile ? (
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      aria-label="詳細"
                      icon={<ViewIcon />}
                      size="sm"
                      onClick={() => handleUserClick(user)}
                    />
                    <IconButton
                      aria-label="編集"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    />
                    {canDeleteUser && (
                      <IconButton
                        aria-label="削除"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(user)}
                      />
                    )}
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => handleUserClick(user)}>
                      詳細
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<EditIcon />}
                      onClick={() => handleEditUser(user)}>
                      編集
                    </Button>
                    {canDeleteUser && (
                      <Button
                        size="sm"
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDeleteUser(user)}>
                        削除
                      </Button>
                    )}
                  </Stack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserManagementTable;
