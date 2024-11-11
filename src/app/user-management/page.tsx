"use client";

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import UserManagementTemplate from "@/components/templates/UserManagementTemplate";
import { Provider } from "react-redux";
import store from "@/store";

const UserManagementPage: React.FC = () => {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <UserManagementTemplate />
      </ChakraProvider>
    </Provider>
  );
};

export default UserManagementPage;
