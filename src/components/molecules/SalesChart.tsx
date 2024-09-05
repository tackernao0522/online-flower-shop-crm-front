"use client";

import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "1月", 売上: 4000 },
  { name: "2月", 売上: 3000 },
  { name: "3月", 売上: 5000 },
  { name: "4月", 売上: 4500 },
  { name: "5月", 売上: 6000 },
  { name: "6月", 売上: 5500 },
];

const SalesChart: React.FC = () => (
  <Box bg="white" p={5} borderRadius="md" boxShadow="sm">
    <Heading as="h3" size="md" mb={4}>
      売上推移
    </Heading>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* XAxisとYAxisのデフォルトパラメータをJavaScriptのデフォルト引数で設定 */}
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="売上" fill="#4299E1" />
      </BarChart>
    </ResponsiveContainer>
  </Box>
);

export default SalesChart;
