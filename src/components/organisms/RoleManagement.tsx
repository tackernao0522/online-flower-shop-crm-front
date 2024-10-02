import React from "react";
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Role } from "@/types/role";

interface RoleManagementProps {
  roles: Role[];
  isMobile: boolean;
  modalSize: string;
  isOpen: boolean;
  onClose: () => void;
  modalMode: "add" | "edit" | "detail";
  handleAddRole: () => void;
  handleEditRole: (role: Role) => void;
  handleDeleteRole: (roleId: number) => void;
  renderRoleForm: () => React.ReactNode;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  isMobile,
  modalSize,
  isOpen,
  onClose,
  modalMode,
  handleAddRole,
  handleEditRole,
  handleDeleteRole,
  renderRoleForm,
}) => {
  return (
    <Box>
      <Flex justifyContent="flex-end" mb={5}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddRole}
          width={isMobile ? "100%" : "auto"}>
          新規ロール追加
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={isMobile ? "sm" : "md"}>
          <Thead>
            <Tr>
              <Th minWidth={isMobile ? "100px" : "auto"}>ロール名</Th>
              <Th minWidth={isMobile ? "150px" : "auto"}>説明</Th>
              <Th minWidth={isMobile ? "100px" : "auto"}>アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.id}>
                <Td>{role.name}</Td>
                <Td>{role.description}</Td>
                <Td>
                  {isMobile ? (
                    <Flex>
                      <IconButton
                        aria-label="編集"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        mr={2}
                      />
                      <IconButton
                        aria-label="削除"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteRole(role.id)}
                      />
                    </Flex>
                  ) : (
                    <Stack direction="row" spacing={2}>
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
                    </Stack>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
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
};

export default RoleManagement;
