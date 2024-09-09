import React from "react";
import { Box, SkeletonText, Skeleton } from "@chakra-ui/react";

export const LoginSkeleton: React.FC = () => (
  <Box padding="6" boxShadow="lg" bg="white">
    <SkeletonText
      mt="4"
      noOfLines={1}
      spacing="4"
      skeletonHeight="2"
      data-testid="skeleton-text"
    />
    <Skeleton height="40px" mt="4" data-testid="skeleton" />
    <Skeleton height="40px" mt="4" data-testid="skeleton" />
    <Skeleton height="20px" mt="4" width="40%" data-testid="skeleton" />
    <Skeleton height="40px" mt="4" data-testid="skeleton" />
    <SkeletonText
      mt="4"
      noOfLines={1}
      spacing="4"
      skeletonHeight="2"
      data-testid="skeleton-text"
    />
  </Box>
);

LoginSkeleton.displayName = "LoginSkeleton";

export default LoginSkeleton;
