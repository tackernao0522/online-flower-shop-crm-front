import React, { useEffect, useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import StatCard from "../atoms/StatCard";
import { StatCardSkeleton } from "../atoms/SkeletonComponents";
import { useCustomerManagement } from "../../hooks/useCustomerManagement";
import { useWebSocket } from "../../hooks/useWebSocket";

const DashboardStats = () => {
  const { loading } = useCustomerManagement();
  const { totalCount, changeRate } = useWebSocket();
  const [initialLoadTimeout, setInitialLoadTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("DashboardStats state:", {
      loading,
      totalCount,
      changeRate,
      initialLoadTimeout,
      env: process.env.NEXT_PUBLIC_APP_ENV,
    });
  }, [loading, totalCount, changeRate, initialLoadTimeout]);

  const showSkeleton = loading || (totalCount === null && !initialLoadTimeout);

  if (showSkeleton) {
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
      data-testid="dashboard-stats-grid"
    >
      <StatCard
        title="顧客数"
        value={totalCount ? totalCount.toLocaleString() : "0"}
        change={changeRate ?? 0}
      />
      <StatCard title="注文数" value="5,678" change={-1} />
      <StatCard title="売上高" value="¥12,345,678" change={5} />
    </SimpleGrid>
  );
};

export default DashboardStats;
