import React from "react";
import {
  VStack,
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Customer } from "@/types/customer";
import { format, parseISO } from "date-fns";

interface CustomerBasicInfoProps {
  customer: Customer | null;
  modalMode: "detail" | "add" | "edit";
  newCustomer: Omit<
    Customer,
    "id" | "created_at" | "updated_at" | "purchaseHistory"
  >;
  formErrors: Partial<Customer>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerBasicInfo: React.FC<CustomerBasicInfoProps> = ({
  customer,
  modalMode,
  newCustomer,
  formErrors,
  handleInputChange,
}) => {
  if (modalMode === "detail" && customer) {
    return (
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold">名前:</Text>
          <Text>{customer.name}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">メールアドレス:</Text>
          <Text>{customer.email}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">電話番号:</Text>
          <Text>{customer.phoneNumber}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">住所:</Text>
          <Text>{customer.address || "未登録"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">生年月日:</Text>
          <Text>
            {customer.birthDate
              ? format(parseISO(customer.birthDate), "yyyy-MM-dd")
              : "未登録"}
          </Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack spacing={4}>
      <FormControl isInvalid={!!formErrors.name}>
        <FormLabel>名前</FormLabel>
        <Input
          name="name"
          value={newCustomer.name}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.name}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.email}>
        <FormLabel>メールアドレス</FormLabel>
        <Input
          name="email"
          value={newCustomer.email}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.email}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.phoneNumber}>
        <FormLabel>電話番号</FormLabel>
        <Input
          name="phoneNumber"
          value={newCustomer.phoneNumber}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.phoneNumber}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.address}>
        <FormLabel>住所</FormLabel>
        <Input
          name="address"
          value={newCustomer.address}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.address}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.birthDate}>
        <FormLabel>生年月日</FormLabel>
        <Input
          name="birthDate"
          type="date"
          value={newCustomer.birthDate}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.birthDate}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};

export default CustomerBasicInfo;
