import React from "react";
import { Box, Heading, Alert, AlertIcon } from "@chakra-ui/react";
import { CardSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const ImportantNotifications: React.FC = () => {
  const isLoading = useLoading();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading as="h3" size="md" mb={4}>
        重要通知
      </Heading>
      <Alert status="info">
        <AlertIcon />
        新商品 「季節の花束セット」が追加されました。
      </Alert>
    </Box>
  );
};

export default ImportantNotifications;
