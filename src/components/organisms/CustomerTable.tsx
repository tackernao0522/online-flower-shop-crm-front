import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Flex,
  Alert,
  AlertIcon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { Customer } from '@/types/customer';
import CustomerTableActions from '@/components/molecules/CustomerTableActions';
import CommonButton from '../atoms/CommonButton';

interface CustomerTableProps {
  customers: Customer[];
  status: string;
  error: string | null;
  hasMore: boolean;
  onCustomerClick: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  isMobile?: boolean;
  lastElementRef: (node: HTMLElement | null) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  status,
  error,
  hasMore,
  onCustomerClick,
  onEditCustomer,
  onDeleteCustomer,
  isMobile,
  lastElementRef,
}) => {
  const isMobileView = useBreakpointValue({ base: true, md: false });

  if (status === 'loading' && customers.length === 0) {
    return (
      <Box overflowX="auto">
        <Table
          variant="simple"
          size="md"
          style={isMobileView ? { minWidth: '600px' } : undefined}>
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
        </Table>
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Box overflowX="auto">
        <Table
          variant="simple"
          size="md"
          style={isMobileView ? { minWidth: '600px' } : undefined}>
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
        </Table>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box overflowX="auto">
      <Table
        variant="simple"
        size="md"
        style={isMobileView ? { minWidth: '600px' } : undefined}>
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
          {customers.map((customer: Customer, index: number) => (
            <Tr
              key={customer.id}
              ref={index === customers.length - 1 ? lastElementRef : undefined}>
              <Td>{customer.id}</Td>
              <Td>
                <CommonButton
                  variant="ghost"
                  onClick={() => onCustomerClick(customer)}>
                  {customer.name}
                </CommonButton>
              </Td>
              <Td>{customer.email}</Td>
              <Td whiteSpace="nowrap">{customer.phoneNumber}</Td>
              <Td whiteSpace="nowrap">
                {customer.birthDate
                  ? format(parseISO(customer.birthDate), 'yyyy-MM-dd')
                  : '未登録'}
              </Td>
              <Td>
                <CustomerTableActions
                  customer={customer}
                  onEdit={onEditCustomer}
                  onDelete={onDeleteCustomer}
                  isMobile={isMobile ?? false}
                />
              </Td>
            </Tr>
          ))}
          {customers.length === 0 && (
            <Tr>
              <Td colSpan={6} textAlign="center" py={8}>
                該当する顧客が見つかりませんでした
              </Td>
            </Tr>
          )}
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
        <Flex justify="center" my={4}>
          <Spinner />
        </Flex>
      )}
    </Box>
  );
};

export default CustomerTable;
