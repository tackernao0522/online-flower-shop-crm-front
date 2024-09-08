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
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Box
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
