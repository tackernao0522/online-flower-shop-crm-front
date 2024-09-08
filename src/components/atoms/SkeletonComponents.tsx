import React from "react";
import { Box, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export const CardSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white">
    <SkeletonCircle size="10" />
    <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
  </Box>
);

export const StatCardSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white">
    <Skeleton height="20px" width="50%" mb="4" />
    <Skeleton height="40px" mb="4" />
    <Skeleton height="20px" width="30%" />
  </Box>
);

export const TableSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white">
    <Skeleton height="40px" mb="4" />
    <Skeleton height="20px" mb="2" />
    <Skeleton height="20px" mb="2" />
    <Skeleton height="20px" mb="2" />
    <Skeleton height="20px" mb="2" />
    <Skeleton height="20px" />
  </Box>
);

export const ChartSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white">
    <Skeleton height="200px" />
  </Box>
);
