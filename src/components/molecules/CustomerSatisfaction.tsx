"use client";

import React from "react";
import { Box, Heading, Text, Progress } from "@chakra-ui/react";

const CustomerSatisfaction: React.FC = () => (
  <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
    <Heading as="h3" size="md" mb={4}>
      顧客満足度
    </Heading>
    <Text fontSize="2xl" fontWeight="bold" mb={2}>
      85%
    </Text>
    <Progress value={85} colorScheme="green" mb={2} />
    <Text color="green.500">前月比: +2%</Text>
  </Box>
);

export default CustomerSatisfaction;
