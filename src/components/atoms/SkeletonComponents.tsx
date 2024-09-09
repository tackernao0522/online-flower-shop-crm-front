import React from "react";
import { Box, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export const CardSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white" data-testid="card-skeleton">
    <SkeletonCircle size="10" data-testid="skeleton-circle" />
    <SkeletonText
      mt="4"
      noOfLines={4}
      spacing="4"
      skeletonHeight="2"
      data-testid="skeleton-text"
    />
  </Box>
);

export const StatCardSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white" data-testid="stat-card-skeleton">
    <Skeleton height="20px" width="50%" mb="4" data-testid="stat-skeleton-1" />
    <Skeleton height="40px" mb="4" data-testid="stat-skeleton-2" />
    <Skeleton height="20px" width="30%" data-testid="stat-skeleton-3" />
  </Box>
);

export const TableSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white" data-testid="table-skeleton">
    <Skeleton height="40px" mb="4" data-testid="table-skeleton-header" />
    <Skeleton height="20px" mb="2" data-testid="table-skeleton-row-1" />
    <Skeleton height="20px" mb="2" data-testid="table-skeleton-row-2" />
    <Skeleton height="20px" mb="2" data-testid="table-skeleton-row-3" />
    <Skeleton height="20px" mb="2" data-testid="table-skeleton-row-4" />
    <Skeleton height="20px" data-testid="table-skeleton-row-5" />
  </Box>
);

export const ChartSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white" data-testid="chart-skeleton">
    <Skeleton height="200px" data-testid="chart-skeleton-body" />
  </Box>
);
