import React from 'react';
import PageHeader from './PageHeader';
import { Stack } from '@chakra-ui/react';
import CommonButton from '../atoms/CommonButton';
import { AddIcon } from '@chakra-ui/icons';
import BackToDashboardButton from '../atoms/BackToDashboardButton';

interface OrderManagementHeaderProps {
  onAddOrder: () => void;
}

export const OrderManagementHeader: React.FC<OrderManagementHeaderProps> = ({
  onAddOrder,
}) => {
  return (
    <PageHeader
      title="注文管理"
      buttons={
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={2}
          width={{ base: '100%', md: 'auto' }}>
          <CommonButton
            variant="primary"
            withIcon={<AddIcon />}
            onClick={onAddOrder}
            isFullWidthMobile>
            新規注文作成
          </CommonButton>
          <BackToDashboardButton />
        </Stack>
      }
      mobileStack
    />
  );
};
