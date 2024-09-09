"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { LoginSkeleton } from "../components/atoms/LoginSkeleton";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

const RootLayoutClient: React.FC<RootLayoutClientProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []); // 空の依存配列を使用

  if (isLoading) {
    return (
      <Box
        data-testid="loading-box"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh">
        <LoginSkeleton />
      </Box>
    );
  }

  return <>{children}</>;
};

export default RootLayoutClient;
