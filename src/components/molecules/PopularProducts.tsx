"use client";

import React from "react";
import { Box, Heading, VStack, Text } from "@chakra-ui/react";

const PopularProducts: React.FC = () => (
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

export default PopularProducts;
