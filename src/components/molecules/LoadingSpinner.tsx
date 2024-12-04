import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

interface LoadingSpinnerProps {
  hasMore?: boolean;
  status: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  hasMore,
  status,
}) => {
  if (!hasMore || status !== 'loading') return null;

  return (
    <Flex justify="center" my={4}>
      <Spinner />
    </Flex>
  );
};
