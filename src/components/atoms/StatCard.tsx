"use client";

import React from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => (
  <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
    <Text fontSize="lg" mb={2}>
      {title}
    </Text>
    <Text fontSize="3xl" fontWeight="bold">
      {value}
    </Text>
    <HStack>
      {change > 0 ? (
        <ArrowUpIcon color="green.500" />
      ) : (
        <ArrowDownIcon color="red.500" />
      )}
      <Text color={change > 0 ? 'green.500' : 'red.500'}>
        {Math.abs(change)}%
      </Text>
    </HStack>
  </Box>
);

export default StatCard;
