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
  useBreakpointValue,
} from '@chakra-ui/react';
import { Customer } from '@/types/customer';
import CommonButton from '../atoms/CommonButton';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCustomer: Omit<
    Customer,
    'id' | 'created_at' | 'updated_at' | 'purchaseHistory'
  >;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  modalMode: 'detail' | 'add' | 'edit';
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  newCustomer,
  handleInputChange,
  handleSubmit,
  modalMode,
}) => {
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add':
        return '新規顧客登録';
      case 'edit':
        return '顧客情報編集';
      case 'detail':
        return '顧客詳細';
      default:
        return '新規顧客登録';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={onSubmit} id="customer-form">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>名前</FormLabel>
                <Input
                  name="name"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>メールアドレス</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>電話番号</FormLabel>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={newCustomer.phoneNumber}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>住所</FormLabel>
                <Input
                  name="address"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>生年月日</FormLabel>
                <Input
                  name="birthDate"
                  type="date"
                  value={newCustomer.birthDate}
                  onChange={handleInputChange}
                />
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
            type="submit"
            form="customer-form"
            isFullWidthMobile={isMobile}>
            登録
          </CommonButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerModal;
