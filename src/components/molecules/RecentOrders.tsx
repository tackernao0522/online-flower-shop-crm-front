import React from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";

const RecentOrders: React.FC = () => (
  <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
    <Heading as="h3" size="md" mb={4}>
      最近の注文
    </Heading>
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>注文ID</Th>
          <Th>顧客名</Th>
          <Th>金額</Th>
          <Th>状態</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>#1234</Td>
          <Td>山田太郎</Td>
          <Td>¥12,000</Td>
          <Td>
            <Badge colorScheme="green">配送中</Badge>
          </Td>
        </Tr>
        <Tr>
          <Td>#1235</Td>
          <Td>佐藤花子</Td>
          <Td>¥80,500</Td>
          <Td>
            <Badge colorScheme="yellow">準備中</Badge>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  </Box>
);

export default RecentOrders;
