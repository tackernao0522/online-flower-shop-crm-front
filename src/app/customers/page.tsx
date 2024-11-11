"use client";

import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import CustomerManagementTemplate from "@/components/templates/CustomerManagementTemplate";
import { Provider } from "react-redux";
import store from "@/store";

const CustomerManagementPage: React.FC = () => {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Box p={5}>
          <CustomerManagementTemplate />
        </Box>
      </ChakraProvider>
    </Provider>
  );
};

export default CustomerManagementPage;
