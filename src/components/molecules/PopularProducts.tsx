import React from "react";
import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import { CardSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const PopularProducts: React.FC = () => {
  const isLoading = useLoading();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading as="h3" size="md" mb={4}>
        人気商品
      </Heading>
      <VStack align="stretch">
        <Text>1. バラの花束</Text>
        <Text>2. ひまわりアレンジ</Text>
        <Text>3. 胡蝶蘭鉢植え</Text>
      </VStack>
    </Box>
  );
};

export default PopularProducts;
