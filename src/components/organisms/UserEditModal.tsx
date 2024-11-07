import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { User } from "@/types/user";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "detail" | "add" | "edit";
  activeItem: User | null;
  handleEditUserChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSaveUser: (user: User) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  activeItem,
  handleEditUserChange,
  handleSaveUser,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });

  const renderUserForm = () => (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>ユーザー名</FormLabel>
        <Input
          name="username"
          defaultValue={activeItem?.username || ""}
          onChange={handleEditUserChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>メールアドレス</FormLabel>
        <Input
          name="email"
          type="email"
          defaultValue={activeItem?.email || ""}
          onChange={handleEditUserChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>役割</FormLabel>
        <Select
          name="role"
          defaultValue={activeItem?.role || ""}
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
          value={activeItem?.isActive?.toString() || "false"}
          onChange={handleEditUserChange}>
          <option value="true">アクティブ</option>
          <option value="false">非アクティブ</option>
        </Select>
      </FormControl>
    </VStack>
  );

  const renderUserDetails = () => (
    <VStack align="stretch" spacing={4}>
      <Box>
        <strong>ユーザー名:</strong> {activeItem?.username}
      </Box>
      <Box>
        <strong>メールアドレス:</strong> {activeItem?.email}
      </Box>
      <Box>
        <strong>役割:</strong> {activeItem?.role}
      </Box>
      <Box>
        <strong>ステータス:</strong>{" "}
        <Badge colorScheme={activeItem?.isActive ? "green" : "red"}>
          {activeItem?.isActive ? "アクティブ" : "非アクティブ"}
        </Badge>
      </Box>
    </VStack>
  );

  const modalContent = (
    <>{modalMode === "detail" ? renderUserDetails() : renderUserForm()}</>
  );

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {modalMode === "detail"
              ? "ユーザー詳細"
              : modalMode === "add"
              ? "新規ユーザー登録"
              : "ユーザー編集"}
          </DrawerHeader>
          <DrawerBody>{modalContent}</DrawerBody>
          <DrawerFooter>
            {(modalMode === "add" || modalMode === "edit") && (
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => handleSaveUser(activeItem as User)}>
                更新
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {modalMode === "detail" ? "閉じる" : "キャンセル"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
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
        <ModalBody>{modalContent}</ModalBody>
        <ModalFooter>
          {(modalMode === "add" || modalMode === "edit") && (
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleSaveUser(activeItem as User)}>
              更新
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserEditModal;
