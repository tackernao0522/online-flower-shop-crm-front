"use client";

import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import StatCard from "../atoms/StatCard";

const DashboardStats: React.FC = () => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
    <StatCard title="顧客数" value="1,234" change={2} />
    <StatCard title="注文数" value="5,678" change={-1} />
    <StatCard title="売上高" value="¥12,345,678" change={5} />
  </SimpleGrid>
);

export default DashboardStats;
