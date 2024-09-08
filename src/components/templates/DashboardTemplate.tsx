"use client";

import React from "react";
import { SimpleGrid, Container } from "@chakra-ui/react";
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
import { useLoading } from "../../hooks/useLoading.ts";

const DashboardTemplate: React.FC = () => {
  const isLoading = useLoading();

  return (
    <Container maxW="container.xl" p={{ base: 3, md: 5 }}>
      <DashboardHeader />
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </SimpleGrid>
      ) : (
        <DashboardStats />
      )}

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 5, md: 10 }}
        mb={{ base: 5, md: 10 }}>
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

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: 5, md: 10 }}
        mb={{ base: 5, md: 10 }}>
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

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 10 }}>
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
