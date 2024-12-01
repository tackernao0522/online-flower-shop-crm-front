import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import CommonInput from '@/components/atoms/CommonInput';
import CommonButton from '@/components/atoms/CommonButton';
import {
  OrderForm as OrderFormType,
  FormErrors,
  OrderStatus,
} from '@/types/order';

interface OrderFormProps {
  newOrder: OrderFormType;
  formErrors: FormErrors;
  modalMode: 'add' | 'edit';
  statusDisplayText: Record<OrderStatus, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleOrderItemChange: (
    index: number,
    field: keyof OrderFormType['orderItems'][number],
    value: string | number,
  ) => void;
  handleAddOrderItem: () => void;
  handleRemoveOrderItem: (index: number) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  newOrder,
  formErrors,
  modalMode,
  statusDisplayText,
  handleInputChange,
  handleOrderItemChange,
  handleAddOrderItem,
  handleRemoveOrderItem,
}) => {
  return (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired isInvalid={!!formErrors.customerId}>
        <FormLabel>顧客ID</FormLabel>
        <CommonInput
          name="customerId"
          value={newOrder.customerId}
          onChange={handleInputChange}
          placeholder="顧客IDを入力"
        />
        <FormErrorMessage>{formErrors.customerId}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!formErrors.orderItems}>
        <FormLabel>注文商品</FormLabel>
        <VStack spacing={4} align="stretch">
          {newOrder.orderItems.map((item, index) => (
            <HStack key={`new-order-item-${index}`} spacing={4}>
              <FormControl isRequired>
                <CommonInput
                  name={`orderItems.${index}.productId`}
                  placeholder="商品ID"
                  value={item.productId}
                  onChange={e =>
                    handleOrderItemChange(index, 'productId', e.target.value)
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <NumberInput
                  min={1}
                  value={item.quantity}
                  onChange={(valueString, valueNumber) =>
                    handleOrderItemChange(index, 'quantity', valueNumber || 1)
                  }>
                  <NumberInputField
                    name={`orderItems.${index}.quantity`}
                    placeholder="数量"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <IconButton
                aria-label="商品を削除"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={() => handleRemoveOrderItem(index)}
              />
            </HStack>
          ))}
          <CommonButton
            variant="outline"
            withIcon={<AddIcon />}
            onClick={handleAddOrderItem}>
            商品を追加
          </CommonButton>
        </VStack>
        <FormErrorMessage>{formErrors.orderItems}</FormErrorMessage>
      </FormControl>

      {modalMode === 'edit' && (
        <FormControl>
          <FormLabel>ステータス</FormLabel>
          <Select
            name="status"
            value={newOrder.status}
            onChange={handleInputChange}>
            {Object.entries(statusDisplayText).map(([value, label]) => (
              <option key={`status-${value}`} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </VStack>
  );
};

export default OrderForm;
