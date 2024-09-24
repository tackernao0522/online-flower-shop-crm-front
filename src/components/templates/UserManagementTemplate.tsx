import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Badge,
  Checkbox,
  Text,
  Spinner,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  ViewIcon,
  LockIcon,
} from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "@/features/users/usersSlice";
import {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
} from "@/features/roles/rolesSlice";
import { User, UserState } from "@/types/user";

interface Role {
  id: number;
  name: string;
  description: string;
}

const UserManagementTemplate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeItem, setActiveItem] = useState<User | Role | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "add" | "edit">(
    "detail"
  );
  const [currentView, setCurrentView] = useState<"users" | "roles">("users");

  const usersState = useSelector((state: RootState) => state.users);
  const { users, status, error } = usersState;
  const roles = useSelector((state: RootState) => state.roles.roles);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "STAFF") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (status === "idle") {
      console.log("Fetching users and roles...");
      dispatch(fetchUsers()).then((action) => {
        if (fetchUsers.fulfilled.match(action)) {
          console.log("Fetched users:", action.payload);
        } else if (fetchUsers.rejected.match(action)) {
          console.error("Failed to fetch users:", action.error);
        }
      });
      dispatch(fetchRoles());
    }
  }, [dispatch, status]);

  const permissions = [
    { id: 1, name: "顧客管理", actions: ["表示", "作成", "編集", "削除"] },
    { id: 2, name: "注文管理", actions: ["表示", "作成", "編集", "削除"] },
    { id: 3, name: "配送管理", actions: ["表示", "更新"] },
    {
      id: 4,
      name: "キャンペーン管理",
      actions: ["表示", "作成", "編集", "削除"],
    },
    { id: 5, name: "レポート閲覧", actions: ["表示"] },
  ];

  const handleUserClick = (user: User) => {
    setActiveItem(user);
    setModalMode("detail");
    onOpen();
  };

  const handleAddUser = () => {
    setActiveItem(null);
    setModalMode("add");
    onOpen();
  };

  const handleEditUser = (user: User) => {
    setActiveItem(user);
    setModalMode("edit");
    onOpen();
  };

  const handleRolesAndPermissions = () => {
    setCurrentView("roles");
  };

  const handleAddRole = () => {
    setActiveItem(null);
    setModalMode("add");
    onOpen();
  };

  const handleEditRole = (role: Role) => {
    setActiveItem(role);
    setModalMode("edit");
    onOpen();
  };

  const handleDeleteRole = (roleId: number) => {
    dispatch(deleteRole(roleId));
  };

  const renderUserForm = () => {
    const userItem = activeItem as User | null;
    return (
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>ユーザー名</FormLabel>
          <Input defaultValue={userItem?.username} />
        </FormControl>
        <FormControl>
          <FormLabel>メールアドレス</FormLabel>
          <Input type="email" defaultValue={userItem?.email} />
        </FormControl>
        <FormControl>
          <FormLabel>役割</FormLabel>
          <Select defaultValue={userItem?.role}>
            <option value="ADMIN">管理者</option>
            <option value="MANAGER">マネージャー</option>
            <option value="STAFF">スタッフ</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>ステータス</FormLabel>
          <Select
            defaultValue={userItem?.isActive ? "アクティブ" : "非アクティブ"}>
            <option value="アクティブ">アクティブ</option>
            <option value="非アクティブ">非アクティブ</option>
          </Select>
        </FormControl>
      </VStack>
    );
  };

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
        {permissions.map((permission) => (
          <Box key={permission.id} borderWidth={1} p={3} borderRadius="md">
            <FormControl>
              <FormLabel>{permission.name}</FormLabel>
              <HStack>
                {permission.actions.map((action) => (
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
      <Flex mb={5}>
        <Input placeholder="ユーザー名またはメールアドレスで検索" mr={3} />
        <Button>検索</Button>
      </Flex>

      {users && users.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>ユーザー名</Th>
              <Th>メールアドレス</Th>
              <Th>役割</Th>
              <Th>ステータス</Th>
              <Th>アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>
                  <Badge colorScheme={user.isActive ? "green" : "red"}>
                    {user.isActive ? "アクティブ" : "非アクティブ"}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
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
                    <Button
                      size="sm"
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => dispatch(deleteUser(user.id))}>
                      削除
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>
          ユーザーが見つかりません。新しいユーザーを追加してください。
        </Text>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalMode === "detail"
              ? "ユーザー詳細"
              : modalMode === "add"
              ? "新規ユーザー登録"
              : "ユーザー編集"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalMode === "detail" ? (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <strong>ユーザー名:</strong> {(activeItem as User)?.username}
                </Box>
                <Box>
                  <strong>メールアドレス:</strong> {(activeItem as User)?.email}
                </Box>
                <Box>
                  <strong>役割:</strong> {(activeItem as User)?.role}
                </Box>
                <Box>
                  <strong>ステータス:</strong>{" "}
                  {(activeItem as User)?.isActive
                    ? "アクティブ"
                    : "非アクティブ"}
                </Box>
              </VStack>
            ) : (
              renderUserForm()
            )}
          </ModalBody>
          <ModalFooter>
            {(modalMode === "add" || modalMode === "edit") && (
              <Button colorScheme="blue" mr={3}>
                保存
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

  const renderRoleManagement = () => (
    <Box>
      <Flex justifyContent="flex-end" mb={5}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddRole}>
          新規ロール追加
        </Button>
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ロール名</Th>
            <Th>説明</Th>
            <Th>アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {roles.map((role) => (
            <Tr key={role.id}>
              <Td>{role.name}</Td>
              <Td>{role.description}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => handleEditRole(role)}>
                    編集
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteRole(role.id)}>
                    削除
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalMode === "add" ? "新規ロール追加" : "ロール編集"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>{renderRoleForm()}</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              保存
            </Button>
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <Box textAlign="center" p={5}>
        <Text fontSize="xl" color="red.500">
          エラーが発生しました: {error ? JSON.stringify(error) : "不明なエラー"}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading as="h1" size="xl">
          {currentView === "users" ? "ユーザー管理" : "ロールと権限管理"}
        </Heading>
        <HStack>
          {currentView === "users" && (
            <>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddUser}>
                新規ユーザー登録
              </Button>
              <Button
                leftIcon={<LockIcon />}
                colorScheme="green"
                onClick={handleRolesAndPermissions}>
                ロールと権限管理
              </Button>
            </>
          )}
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() =>
              currentView === "roles"
                ? setCurrentView("users")
                : router.push("/dashboard")
            }>
            {currentView === "roles"
              ? "ユーザー管理に戻る"
              : "ダッシュボードへ戻る"}
          </Button>
        </HStack>
      </Flex>

      {currentView === "users"
        ? renderUserManagement()
        : renderRoleManagement()}
    </Box>
  );
};

export default UserManagementTemplate;
