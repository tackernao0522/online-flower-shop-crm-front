import React from 'react';
import { HStack, IconButton } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Customer } from '@/types/customer';
import CommonButton from '../atoms/CommonButton';

interface CustomerTableActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  isMobile?: boolean;
}

const CustomerTableActions: React.FC<CustomerTableActionsProps> = ({
  customer,
  onEdit,
  onDelete,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <HStack spacing={2}>
        <IconButton
          aria-label="Edit customer"
          icon={<EditIcon />}
          size="sm"
          onClick={() => onEdit(customer)}
        />
        <IconButton
          aria-label="Delete customer"
          icon={<DeleteIcon />}
          size="sm"
          colorScheme="red"
          onClick={() => onDelete(customer)}
        />
      </HStack>
    );
  }

  return (
    <HStack spacing={2}>
      <CommonButton
        variant="secondary"
        size="sm"
        withIcon={<EditIcon />}
        iconPosition="left"
        onClick={() => onEdit(customer)}>
        編集
      </CommonButton>
      <CommonButton
        variant="danger"
        size="sm"
        withIcon={<DeleteIcon />}
        iconPosition="left"
        onClick={() => onDelete(customer)}>
        削除
      </CommonButton>
    </HStack>
  );
};

export default CustomerTableActions;
