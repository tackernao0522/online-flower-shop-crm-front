"use client";

import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import StatCard from "../atoms/StatCard";
import { StatCardSkeleton } from "../atoms/SkeletonComponents";
import { useLoading } from "../../hooks/useLoading.ts";

const DashboardStats: React.FC = () => {
  const isLoading = useLoading();

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
      <StatCard title="顧客数" value="1,234" change={2} />
      <StatCard title="注文数" value="5,678" change={-1} />
      <StatCard title="売上高" value="¥12,345,678" change={5} />
    </SimpleGrid>
  );
};

export default DashboardStats;
