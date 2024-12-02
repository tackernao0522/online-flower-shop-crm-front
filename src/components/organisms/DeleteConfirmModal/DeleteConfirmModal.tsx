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
  HStack,
  Text,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import CommonButton from '@/components/atoms/CommonButton';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  targetName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  targetName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <WarningIcon color="red.500" />
              <Text>この操作は取り消せません。</Text>
            </HStack>
            <Text>{targetName}を削除してもよろしいですか？</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <CommonButton variant="danger" mr={3} onClick={onConfirm}>
            削除
          </CommonButton>
          <CommonButton variant="ghost" onClick={onClose}>
            キャンセル
          </CommonButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmModal;
