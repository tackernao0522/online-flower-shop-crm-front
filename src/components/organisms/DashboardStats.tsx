"use client";

import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import StatCard from "../atoms/StatCard";
import { StatCardSkeleton } from "../atoms/SkeletonComponents";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useCustomerManagement } from "../../hooks/useCustomerManagement";

const DashboardStats: React.FC = () => {
  const { loading } = useCustomerManagement();
  const totalCount = useSelector(
    (state: RootState) => state.customers.totalCount
  );

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid
      columns={{ base: 1, md: 3 }}
      spacing={10}
      mb={10}
      data-testid="dashboard-stats-grid">
      <StatCard
        title="顧客数"
        value={totalCount ? totalCount.toLocaleString() : "0"}
        change={2}
      />
      <StatCard title="注文数" value="5,678" change={-1} />
      <StatCard title="売上高" value="¥12,345,678" change={5} />
    </SimpleGrid>
  );
};

export default DashboardStats;
