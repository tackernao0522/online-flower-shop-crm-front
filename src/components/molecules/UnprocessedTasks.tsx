import React from "react";
import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import { CardSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const UnprocessedTasks: React.FC = () => {
  const isLoading = useLoading();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading as="h3" size="md" mb={4}>
        未処理タスク
      </Heading>
      <VStack align="stretch">
        <Text>• 新規顧客フォローアップ (3件)</Text>
        <Text>• 在庫確認 (5件)</Text>
        <Text>• クレーム対応 (1件)</Text>
      </VStack>
    </Box>
  );
};

export default UnprocessedTasks;
