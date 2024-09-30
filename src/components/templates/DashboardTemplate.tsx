"use client";

import React from "react";
import {
  SimpleGrid,
  Container,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";
import DashboardHeader from "../organisms/DashboardHeader";
import DashboardStats from "../organisms/DashboardStats";
import RecentOrders from "../molecules/RecentOrders";
import SalesChart from "../molecules/SalesChart";
import PopularProducts from "../molecules/PopularProducts";
import CustomerSatisfaction from "../molecules/CustomerSatisfaction";
import SystemStatus from "../molecules/SystemStatus";
import UnprocessedTasks from "../molecules/UnprocessedTasks";
import ImportantNotifications from "../molecules/ImportantNotifications";
import {
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading";

const DashboardTemplate: React.FC = () => {
  const isLoading = useLoading();
  const columnCount = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 3 });

  return (
    <Container maxW="container.xl" p={{ base: 3, md: 5 }}>
      <DashboardHeader />
      <Box mb={10}>
        {isLoading ? (
          <SimpleGrid columns={columnCount} spacing={5}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </SimpleGrid>
        ) : (
          <DashboardStats />
        )}
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} mb={10}>
        {isLoading ? (
          <>
            <TableSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <RecentOrders />
            <SalesChart />
          </>
        )}
      </SimpleGrid>

      <SimpleGrid columns={columnCount} spacing={5} mb={10}>
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <PopularProducts />
            <CustomerSatisfaction />
            <SystemStatus />
          </>
        )}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <UnprocessedTasks />
            <ImportantNotifications />
          </>
        )}
      </SimpleGrid>
    </Container>
  );
};

export default DashboardTemplate;
