import React, { useState, useEffect, useCallback } from "react";
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
  Center,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  ViewIcon,
  LockIcon,
  ArrowUpIcon,
} from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  resetUsers,
  resetUsersState,
} from "@/features/users/usersSlice";
import {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
} from "@/features/roles/rolesSlice";
import { updateUserRole, setUser } from "@/features/auth/authSlice";
import { User, UserState } from "@/types/user";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import DeleteAlertDialog from "../molecules/DeleteAlertDialog";
import { useWebSocket } from "@/hooks/useWebSocket";

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [, forceUpdate] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [lastSearch, setLastSearch] = useState({ type: "", value: "" });

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const toast = useToast();

  const [isUserRegistrationModalOpen, setIsUserRegistrationModalOpen] =
    useState(false);

  const [newUserFormData, setNewUserFormData] = useState<{
    username: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "STAFF";
    isActive: boolean;
  }>({
    username: "",
    email: "",
    password: "",
    role: "STAFF",
    isActive: true,
  });

  const [canDeleteUser, setCanDeleteUser] = useState(false);

  const isSearchTermEmpty = searchTerm.trim() === "";
  const isSearchRoleEmpty = searchRole === "";

  const usersState = useSelector((state: RootState) => state.users);
  const { users, status, error, currentPage, totalPages, totalCount } =
    usersState;
  const roles = useSelector((state: RootState) => state.roles.roles);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { totalUserCount } = useWebSocket();

  console.log("Current users state:", usersState);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("Current user changed:", currentUser);
    const newCanDeleteUser = currentUser?.role === "ADMIN";
    console.log("Setting canDeleteUser to:", newCanDeleteUser);
    setCanDeleteUser(newCanDeleteUser);
  }, [currentUser]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      dispatch(
        fetchUsers({
          page: currentPage + 1,
          search: lastSearch.type === "term" ? lastSearch.value : "",
          role: lastSearch.type === "role" ? lastSearch.value : "",
          isNewSearch: false,
        })
      );
    } else {
      setHasMore(false);
    }
  }, [dispatch, currentPage, totalPages, lastSearch]);

  const { lastElementRef } = useInfiniteScroll(loadMore);

  useEffect(() => {
    if (currentUser?.role === "STAFF") {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  useEffect(() => {
    dispatch(resetUsersState());
    dispatch(fetchUsers({ page: 1, search: "", role: "", isNewSearch: true }));
    dispatch(fetchRoles());
    setSearchTerm("");
    setSearchRole("");
    setLastSearch({ type: "", value: "" });

    return () => {
      dispatch(resetUsersState());
    };
  }, [dispatch]);

  useEffect(() => {
    forceUpdate({});
  }, [currentUser]);

  useEffect(() => {
    if (totalUserCount !== null) {
      setTotalUsers(totalUserCount);
    } else if (totalCount !== null) {
      setTotalUsers(totalCount);
    }
  }, [totalUserCount, totalCount]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const handleSearch = (type: "term" | "role") => {
    const searchValue = type === "term" ? searchTerm : searchRole;
    dispatch(
      fetchUsers({
        page: 1,
        search: type === "term" ? searchValue : "",
        role: type === "role" ? searchValue : "",
        isNewSearch: true,
      })
    );
    setLastSearch({ type, value: searchValue });
    setHasMore(true);
    type === "term" ? setSearchTerm("") : setSearchRole("");
  };

  const handleResetSearch = () => {
    dispatch(resetUsersState());
    dispatch(fetchUsers({ page: 1, search: "", role: "", isNewSearch: true }));
    setSearchTerm("");
    setSearchRole("");
    setLastSearch({ type: "", value: "" });
  };

  const handleKeyPress = (
    event: React.KeyboardEvent,
    type: "term" | "role"
  ) => {
    if (event.key === "Enter") {
      handleSearch(type);
    }
  };

  const handleUserClick = (user: User) => {
    setActiveItem(user);
    setModalMode("detail");
    onOpen();
  };

  const handleAddUser = () => {
    setIsUserRegistrationModalOpen(true);
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

  const handleDeleteUser = useCallback((user: User) => {
    console.log("handleDeleteUser called", user);
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete.id)).unwrap();
        toast({
          title: "ユーザーを削除しました",
          description: `${userToDelete.username} の情報が削除されました。`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast({
          title: "ユーザーの削除に失敗しました",
          description: `エラー: ${error.message || JSON.stringify(error)}`,
          status: "error",
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

  const handleNewUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUserFormData((prev) => ({
      ...prev,
      [name]:
        name === "isActive"
          ? value === "true"
          : name === "role"
          ? (value as "ADMIN" | "MANAGER" | "STAFF")
          : value,
    }));
  };

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting new user data:", newUserFormData);
      const result = await dispatch(addUser(newUserFormData)).unwrap();
      console.log("New user added:", result);
      toast({
        title: "ユーザーが登録されました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsUserRegistrationModalOpen(false);
      setNewUserFormData({
        username: "",
        email: "",
        password: "",
        role: "STAFF",
        isActive: true,
      });
    } catch (error: any) {
      console.error("Error in handleNewUserSubmit:", error);
      toast({
        title: "ユーザー登録に失敗しました",
        description: error.message || JSON.stringify(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setActiveItem((prev) => {
      if (prev) {
        // User型かどうかを確認
        if ("isActive" in prev) {
          return {
            ...prev,
            [name]: name === "isActive" ? value === "true" : value,
            isActive: name === "isActive" ? value === "true" : prev.isActive,
          } as User;
        } else {
          // Role型の場合
          return {
            ...prev,
            [name]: value,
          } as Role;
        }
      }
      return prev;
    });
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      console.log("Saving user:", updatedUser);
      const result = await dispatch(
        updateUser({ id: updatedUser.id, userData: updatedUser })
      ).unwrap();
      console.log("Updated user:", result);

      if (currentUser && currentUser.id === updatedUser.id) {
        console.log("Updating current user role to:", result.role);
        dispatch(updateUserRole(result.role as "ADMIN" | "MANAGER" | "STAFF"));
      }

      toast({
        title: "ユーザー情報を更新しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "ユーザー情報の更新に失敗しました",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderUserForm = () => {
    const userItem = activeItem as User | null;
    return (
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>ユーザー名</FormLabel>
          <Input
            name="username"
            defaultValue={userItem?.username || ""}
            onChange={handleEditUserChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>メールアドレス</FormLabel>
          <Input
            name="email"
            type="email"
            defaultValue={userItem?.email || ""}
            onChange={handleEditUserChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>役割</FormLabel>
          <Select
            name="role"
            defaultValue={userItem?.role || ""}
            onChange={handleEditUserChange}>
            <option value="ADMIN">管理者</option>
            <option value="MANAGER">マネージャー</option>
            <option value="STAFF">スタッフ</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>ステータス</FormLabel>
          <Select
            name="isActive"
            value={userItem?.isActive?.toString() || "false"}
            onChange={handleEditUserChange}>
            <option value="true">アクティブ</option>
            <option value="false">非アクティブ</option>
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
        <Input
          placeholder="ユーザー名またはメールアドレスで検索"
          mr={3}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, "term")}
        />
        <Button
          onClick={() => handleSearch("term")}
          isDisabled={isSearchTermEmpty}>
          名前またはメール検索
        </Button>
      </Flex>
      <Flex mb={5}>
        <Select
          placeholder="役割を選択"
          mr={3}
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
      </Flex>
      <Button onClick={handleResetSearch} mb={5}>
        検索結果をリセット
      </Button>

      {lastSearch.value && (
        <Text>
          最後の検索: {lastSearch.type === "term" ? "名前/メール" : "役割"} -{" "}
          {lastSearch.value === "" ? "全ての役割" : lastSearch.value}
        </Text>
      )}

      <Text>
        総ユーザー数: {totalUsers !== null ? totalUsers : "読み込み中..."}
      </Text>

      {users && users.length > 0 ? (
        <>
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
              {users.map((user, index) => {
                if (process.env.NODE_ENV === "development") {
                  console.log("Rendering user:", user);
                }
                return (
                  <Tr
                    key={`${user.id}-${index}`}
                    ref={index === users.length - 1 ? lastElementRef : null}>
                    <Td>{user.id}</Td>
                    <Td>{user.username}</Td>
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
                        {canDeleteUser && (
                          <Button
                            size="sm"
                            leftIcon={<DeleteIcon />}
                            colorScheme="red"
                            onClick={() => handleDeleteUser(user)}>
                            削除
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          <Flex justify="center" my={4}>
            <Text color="red">
              {!hasMore
                ? `すべてのユーザーを表示しました (${totalUsers ?? 0}名)`
                : `${users.length}名のユーザーを表示中 (全${
                    totalUsers ?? 0
                  }名)`}
            </Text>
          </Flex>
        </>
      ) : (
        <Text color="red.500" fontWeight="bold">
          検索条件に一致するユーザーが見つかりませんでした。
        </Text>
      )}
      {status === "loading" && (
        <Center mt={4}>
          <Spinner size="xl" />
        </Center>
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
                  <Badge
                    colorScheme={
                      (activeItem as User)?.isActive ? "green" : "red"
                    }>
                    {(activeItem as User)?.isActive
                      ? "アクティブ"
                      : "非アクティブ"}
                  </Badge>
                </Box>
              </VStack>
            ) : (
              renderUserForm()
            )}
          </ModalBody>
          <ModalFooter>
            {(modalMode === "add" || modalMode === "edit") && (
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => handleSaveUser(activeItem as User)}>
                保存
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isUserRegistrationModalOpen}
        onClose={() => setIsUserRegistrationModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新規ユーザー登録</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleNewUserSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ユーザー名</FormLabel>
                  <Input
                    name="username"
                    value={newUserFormData.username}
                    onChange={handleNewUserChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>メールアドレス</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={newUserFormData.email}
                    onChange={handleNewUserChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>パスワード</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={newUserFormData.password}
                    onChange={handleNewUserChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>役割</FormLabel>
                  <Select
                    name="role"
                    value={newUserFormData.role}
                    onChange={handleNewUserChange}>
                    <option value="ADMIN">管理者</option>
                    <option value="MANAGER">マネージャー</option>
                    <option value="STAFF">スタッフ</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>ステータス</FormLabel>
                  <Select
                    name="isActive"
                    value={newUserFormData.isActive.toString()}
                    onChange={handleNewUserChange}>
                    <option value="true">アクティブ</option>
                    <option value="false">非アクティブ</option>
                  </Select>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsUserRegistrationModalOpen(false)}>
              キャンセル
            </Button>
            <Button colorScheme="blue" onClick={handleNewUserSubmit}>
              登録
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

  if (status === "loading" && users.length === 0) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
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

      {showScrollTop && (
        <IconButton
          icon={<ArrowUpIcon />}
          position="fixed"
          bottom="50px"
          right="50px"
          colorScheme="blue"
          onClick={scrollToTop}
          aria-label="トップに戻る"
        />
      )}

      <DeleteAlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={userToDelete?.username || ""}
        itemType="ユーザー"
      />
    </Box>
  );
};

export default UserManagementTemplate;
