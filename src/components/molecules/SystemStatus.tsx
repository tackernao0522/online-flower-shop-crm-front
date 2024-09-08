import React from "react";
import { Box, Heading, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { CardSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const SystemStatus: React.FC = () => {
  const isLoading = useLoading();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading as="h3" size="md" mb={4}>
        システム状態
      </Heading>
      <VStack align="stretch">
        <HStack justify="space-between">
          <Text>eコマース同期:</Text>
          <Badge colorScheme="green">正常</Badge>
        </HStack>
        <HStack justify="space-between">
          <Text>セキュリティ:</Text>
          <Badge colorScheme="green">異常なし</Badge>
        </HStack>
        <HStack justify="space-between">
          <Text>バックアップ:</Text>
          <Badge colorScheme="yellow">進行中</Badge>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SystemStatus;
