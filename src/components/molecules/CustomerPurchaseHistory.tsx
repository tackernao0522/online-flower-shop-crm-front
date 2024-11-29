import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Customer } from '@/types/customer';
import CommonButton from '../atoms/CommonButton';
import CommonInput from '../atoms/CommonInput';

interface CustomerPurchaseHistoryProps {
  customer: Customer | null;
  modalMode: 'detail' | 'add' | 'edit';
  isMobile: boolean;
}

const CustomerPurchaseHistory: React.FC<CustomerPurchaseHistoryProps> = ({
  customer,
  modalMode,
  isMobile,
}) => {
  return (
    <>
      <Box overflowX="auto">
        <Table variant="simple" size={isMobile ? 'sm' : 'md'}>
          <Thead>
            <Tr>
              <Th>注文ID</Th>
              <Th>日付</Th>
              <Th>金額</Th>
              {modalMode !== 'detail' && <Th>アクション</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {customer?.purchaseHistory?.map(purchase => (
              <Tr key={purchase.id}>
                <Td>
                  {modalMode === 'detail' ? (
                    purchase.id
                  ) : (
                    <CommonInput defaultValue={purchase.id} size="sm" />
                  )}
                </Td>
                <Td>
                  {modalMode === 'detail' ? (
                    purchase.date
                  ) : (
                    <CommonInput defaultValue={purchase.date} size="sm" />
                  )}
                </Td>
                <Td>
                  {modalMode === 'detail' ? (
                    `¥${purchase.amount.toLocaleString()}`
                  ) : (
                    <CommonInput defaultValue={purchase.amount} size="sm" />
                  )}
                </Td>
                {modalMode !== 'detail' && (
                  <Td>
                    <CommonButton
                      variant="danger"
                      size="sm"
                      withIcon={<DeleteIcon />}
                      colorScheme="red"
                      aria-label="Delete purchase">
                      削除
                    </CommonButton>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {modalMode !== 'detail' && (
        <CommonButton
          variant="secondary"
          size="sm"
          withIcon={<AddIcon />}
          mt={4}>
          購入履歴を追加
        </CommonButton>
      )}
    </>
  );
};

export default CustomerPurchaseHistory;
