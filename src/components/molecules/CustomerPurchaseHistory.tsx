import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Input,
  Box,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Customer } from "@/types/customer";

interface CustomerPurchaseHistoryProps {
  customer: Customer | null;
  modalMode: "detail" | "add" | "edit";
  isMobile: boolean;
}

const CustomerPurchaseHistory: React.FC<CustomerPurchaseHistoryProps> = ({
  customer,
  modalMode,
  isMobile,
}) => {
  return (
    <Box overflowX="auto">
      <Table variant="simple" size={isMobile ? "sm" : "md"}>
        <Thead>
          <Tr>
            <Th>注文ID</Th>
            <Th>日付</Th>
            <Th>金額</Th>
            {modalMode !== "detail" && <Th>アクション</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {customer?.purchaseHistory?.map((purchase) => (
            <Tr key={purchase.id}>
              <Td>
                {modalMode === "detail" ? (
                  purchase.id
                ) : (
                  <Input defaultValue={purchase.id} size="sm" />
                )}
              </Td>
              <Td>
                {modalMode === "detail" ? (
                  purchase.date
                ) : (
                  <Input defaultValue={purchase.date} size="sm" />
                )}
              </Td>
              <Td>
                {modalMode === "detail" ? (
                  `¥${purchase.amount.toLocaleString()}`
                ) : (
                  <Input defaultValue={purchase.amount} size="sm" />
                )}
              </Td>
              {modalMode !== "detail" && (
                <Td>
                  <IconButton
                    aria-label="Delete purchase"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                  />
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
      {modalMode !== "detail" && (
        <Button leftIcon={<AddIcon />} mt={4} size="sm">
          購入履歴を追加
        </Button>
      )}
    </Box>
  );
};

export default CustomerPurchaseHistory;
