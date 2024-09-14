import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import { useInView } from "react-intersection-observer";
import { Customer } from "@/types/customer";
import CustomerTableActions from "@/components/molecules/CustomerTableActions";

interface CustomerTableProps {
  customers: Customer[];
  status: string;
  error: string | null;
  hasMore: boolean;
  onCustomerClick: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onLoadMore: () => void;
  isMobile: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  status,
  error,
  hasMore,
  onCustomerClick,
  onEditCustomer,
  onDeleteCustomer,
  onLoadMore,
  isMobile,
}) => {
  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasMore) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore]);

  if (status === "loading" && customers.length === 0) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (status === "failed") {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>名前</Th>
            <Th>メールアドレス</Th>
            <Th>電話番号</Th>
            <Th>生年月日</Th>
            <Th>アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {customers.map((customer: Customer) => (
            <Tr key={customer.id}>
              <Td>{customer.id}</Td>
              <Td>
                <Button
                  variant="link"
                  onClick={() => onCustomerClick(customer)}>
                  {customer.name}
                </Button>
              </Td>
              <Td>{customer.email}</Td>
              <Td whiteSpace="nowrap">{customer.phoneNumber}</Td>
              <Td whiteSpace="nowrap">
                {customer.birthDate
                  ? format(parseISO(customer.birthDate), "yyyy-MM-dd")
                  : "未登録"}
              </Td>
              <Td>
                <CustomerTableActions
                  customer={customer}
                  onEdit={onEditCustomer}
                  onDelete={onDeleteCustomer}
                  isMobile={isMobile}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {!hasMore && customers.length > 0 && (
        <Flex justify="center" my={4}>
          <Text color="red">
            すべての顧客を表示しました ({customers.length}名)
          </Text>
        </Flex>
      )}
      {hasMore && (
        <Flex justify="center" my={4} ref={ref}>
          <Spinner />
        </Flex>
      )}
    </Box>
  );
};

export default CustomerTable;
