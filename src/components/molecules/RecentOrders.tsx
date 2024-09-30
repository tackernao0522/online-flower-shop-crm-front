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
  useBreakpointValue,
} from "@chakra-ui/react";
import { TableSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const RecentOrders: React.FC = () => {
  const isLoading = useLoading();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading as="h3" size="md" mb={4}>
        最近の注文
      </Heading>
      <Box overflowX={isMobile ? "auto" : "visible"}>
        <Table variant="simple" size={isMobile ? "sm" : "md"}>
          <Thead>
            <Tr>
              <Th whiteSpace="nowrap" minWidth="80px">注文ID</Th>
              <Th whiteSpace="nowrap" minWidth="100px">顧客名</Th>
              <Th whiteSpace="nowrap" minWidth="80px">金額</Th>
              <Th whiteSpace="nowrap" minWidth="80px">状態</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td whiteSpace="nowrap">#1234</Td>
              <Td whiteSpace="nowrap">山田太郎</Td>
              <Td whiteSpace="nowrap">¥12,000</Td>
              <Td>
                <Badge colorScheme="green">配送中</Badge>
              </Td>
            </Tr>
            <Tr>
              <Td whiteSpace="nowrap">#1235</Td>
              <Td whiteSpace="nowrap">佐藤花子</Td>
              <Td whiteSpace="nowrap">¥80,500</Td>
              <Td>
                <Badge colorScheme="yellow">準備中</Badge>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default RecentOrders;
