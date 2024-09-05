"use client";

import React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import DashboardHeader from "../organisms/DashboardHeader";
import DashboardStats from "../organisms/DashboardStats";
import RecentOrders from "../molecules/RecentOrders";
import SalesChart from "../molecules/SalesChart";
import PopularProducts from "../molecules/PopularProducts";
import CustomerSatisfaction from "../molecules/CustomerSatisfaction";
import SystemStatus from "../molecules/SystemStatus";
import UnprocessedTasks from "../molecules/UnprocessedTasks";
import ImportantNotifications from "../molecules/ImportantNotifications";

const DashboardTemplate: React.FC = () => (
  <Box p={5}>
    <DashboardHeader />
    <DashboardStats />

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={10}>
      <RecentOrders />
      <SalesChart />
    </SimpleGrid>

    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
      <PopularProducts />
      <CustomerSatisfaction />
      <SystemStatus />
    </SimpleGrid>

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
      <UnprocessedTasks />
      <ImportantNotifications />
    </SimpleGrid>
  </Box>
);

export default DashboardTemplate;
