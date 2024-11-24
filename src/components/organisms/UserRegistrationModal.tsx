import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useBreakpointValue,
} from '@chakra-ui/react';
import CommonButton from '../atoms/CommonButton';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUserFormData: {
    username: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
    isActive: boolean;
  };
  handleNewUserChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleNewUserSubmit: (e: React.FormEvent) => void;
}

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({
  isOpen,
  onClose,
  newUserFormData,
  handleNewUserChange,
  handleNewUserSubmit,
}) => {
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' });
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
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
          <CommonButton
            variant="ghost"
            mr={3}
            onClick={onClose}
            isFullWidthMobile={isMobile}>
            キャンセル
          </CommonButton>
          <CommonButton
            variant="primary"
            onClick={handleNewUserSubmit}
            isFullWidthMobile={isMobile}>
            登録
          </CommonButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserRegistrationModal;
