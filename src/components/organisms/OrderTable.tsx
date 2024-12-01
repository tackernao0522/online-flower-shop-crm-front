import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CommonButton from '@/components/atoms/CommonButton';
import { Order, OrderStatus } from '@/types/order';

interface OrderTableProps {
  orders: Order[];
  statusColorScheme: Record<OrderStatus, string>;
  statusDisplayText: Record<OrderStatus, string>;
  isMobile: boolean;
  lastElementRef: (node: HTMLElement | null) => void;
  handleOrderClick: (order: Order) => void;
  handleEditOrder: (order: Order) => void;
  handleDeleteOrder: (order: Order) => void;
  formatDate: (date: string) => string;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  statusColorScheme,
  statusDisplayText,
  isMobile,
  lastElementRef,
  handleOrderClick,
  handleEditOrder,
  handleDeleteOrder,
  formatDate,
}) => {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th whiteSpace="nowrap">注文番号</Th>
            <Th whiteSpace="nowrap">顧客名</Th>
            <Th whiteSpace="nowrap">注文日</Th>
            <Th whiteSpace="nowrap">合計金額</Th>
            <Th whiteSpace="nowrap">ステータス</Th>
            <Th whiteSpace="nowrap">アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order, index) => (
            <Tr
              key={`${order.id}-${order.orderNumber}-${index}`}
              ref={index === orders.length - 1 ? lastElementRef : undefined}>
              <Td whiteSpace="nowrap">{order.orderNumber}</Td>
              <Td whiteSpace="nowrap">{order.customer.name}</Td>
              <Td whiteSpace="nowrap">{formatDate(order.orderDate)}</Td>
              <Td whiteSpace="nowrap">¥{order.totalAmount.toLocaleString()}</Td>
              <Td whiteSpace="nowrap">
                <Badge colorScheme={statusColorScheme[order.status]}>
                  {statusDisplayText[order.status]}
                </Badge>
              </Td>
              <Td whiteSpace="nowrap">
                {isMobile ? (
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="詳細を表示"
                      icon={<ViewIcon />}
                      size="sm"
                      onClick={() => handleOrderClick(order)}
                    />
                    <IconButton
                      aria-label="注文を編集"
                      icon={<EditIcon />}
                      size="sm"
                      isDisabled={
                        order.status === 'DELIVERED' ||
                        order.status === 'CANCELLED'
                      }
                      onClick={() => handleEditOrder(order)}
                    />
                    <IconButton
                      aria-label="注文を削除"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      isDisabled={order.status === 'DELIVERED'}
                      onClick={() => handleDeleteOrder(order)}
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2}>
                    <CommonButton
                      variant="secondary"
                      size="sm"
                      withIcon={<ViewIcon />}
                      onClick={() => handleOrderClick(order)}>
                      詳細
                    </CommonButton>
                    <CommonButton
                      variant="secondary"
                      size="sm"
                      leftIcon={<EditIcon />}
                      isDisabled={
                        order.status === 'DELIVERED' ||
                        order.status === 'CANCELLED'
                      }
                      onClick={() => handleEditOrder(order)}>
                      編集
                    </CommonButton>
                    <CommonButton
                      variant="danger"
                      size="sm"
                      withIcon={<DeleteIcon />}
                      isDisabled={order.status === 'DELIVERED'}
                      onClick={() => handleDeleteOrder(order)}>
                      削除
                    </CommonButton>
                  </HStack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default OrderTable;
