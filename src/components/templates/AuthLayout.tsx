"use client";

import React from "react";
import {
  Flex,
  Box,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  isLoading?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const boxBgColor = useColorModeValue("white", "gray.700");
  const boxWidth = useBreakpointValue({
    base: "90%",
    sm: "80%",
    md: "50%",
    lg: "400px",
  });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });

  return (
    <Flex
      minHeight="100vh"
      width="100%"
      align="center"
      justify="center"
      bg={bgColor}
      p={[4, 6, 8]}>
      <Box
        bg={boxBgColor}
        p={[6, 8, 10]}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        width={boxWidth}
        maxWidth="400px">
        {isLoading ? (
          <Skeleton height="36px" width="80%" mx="auto" />
        ) : (
          <Heading as="h1" size={headingSize} textAlign="center" mb={6}>
            {title}
          </Heading>
        )}
        {children}
      </Box>
    </Flex>
  );
};

export default AuthLayout;
