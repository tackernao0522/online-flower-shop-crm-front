import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

interface OrderCountDisplayProps {
  totalCount: number;
  currentCount: number;
  showTotalCountOnly?: boolean;
}

export const OrderCountDisplay: React.FC<OrderCountDisplayProps> = ({
  totalCount,
  currentCount,
  showTotalCountOnly = false,
}) => {
  if (showTotalCountOnly) {
    return (
      <Text mb={4} color="gray.600">
        総注文リスト数: {totalCount.toLocaleString()}
      </Text>
    );
  }

  return (
    <Flex justify="center" my={4}>
      <Text color="red">
        {currentCount >= totalCount
          ? `全 ${totalCount.toLocaleString()} 件を表示中`
          : `${currentCount.toLocaleString()} 件を表示中 (全 ${totalCount.toLocaleString()} 件)`}
      </Text>
    </Flex>
  );
};

export default OrderCountDisplay;
