"use client";

import React from "react";
import { Box, SimpleGrid, Container } from "@chakra-ui/react";
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
  <Container maxW="container.xl" p={{ base: 3, md: 5 }}>
    <DashboardHeader />
    <DashboardStats />

    <SimpleGrid
      columns={{ base: 1, md: 2 }}
      spacing={{ base: 5, md: 10 }}
      mb={{ base: 5, md: 10 }}>
      <RecentOrders />
      <SalesChart />
    </SimpleGrid>

    <SimpleGrid
      columns={{ base: 1, sm: 2, lg: 3 }}
      spacing={{ base: 5, md: 10 }}
      mb={{ base: 5, md: 10 }}>
      <PopularProducts />
      <CustomerSatisfaction />
      <SystemStatus />
    </SimpleGrid>

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 10 }}>
      <UnprocessedTasks />
      <ImportantNotifications />
    </SimpleGrid>
  </Container>
);

export default DashboardTemplate;
