'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { ChakraProvider, Box } from '@chakra-ui/react';
import store from '@/store';
import OrderManagementTemplate from '@/components/templates/OrderManagementTemplate';

const OrdersPage = () => {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Box p={5}>
          <OrderManagementTemplate />
        </Box>
      </ChakraProvider>
    </Provider>
  );
};

export default OrdersPage;
