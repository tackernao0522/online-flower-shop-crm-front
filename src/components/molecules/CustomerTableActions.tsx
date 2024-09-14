import React from "react";
import { HStack, Button, IconButton } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Customer } from "@/types/customer";

interface CustomerTableActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  isMobile: boolean;
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
      <Button
        size="sm"
        leftIcon={<EditIcon />}
        onClick={() => onEdit(customer)}>
        編集
      </Button>
      <Button
        size="sm"
        leftIcon={<DeleteIcon />}
        colorScheme="red"
        onClick={() => onDelete(customer)}>
        削除
      </Button>
    </HStack>
  );
};

export default CustomerTableActions;
