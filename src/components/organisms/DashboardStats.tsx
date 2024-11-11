"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SimpleGrid, useToast, Fade } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import StatCard from "../atoms/StatCard";
import { StatCardSkeleton } from "../atoms/SkeletonComponents";
import { useCustomerManagement } from "../../hooks/useCustomerManagement";
import { useWebSocket } from "../../hooks/useWebSocket";
import { RootState } from "@/store";
import { setOrderStats } from "@/features/orders/ordersSlice";

const DashboardStats = () => {
  const { loading: customerLoading } = useCustomerManagement();
  const { totalCount, changeRate, connectionStatus } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [initialLoadTimeout, setInitialLoadTimeout] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();

  // Reduxストアからの注文データを取得
  const ordersState = useSelector((state: RootState) => state.orders);
  console.log("Current orders state:", ordersState);

  // 初期データの取得
  useEffect(() => {
    const fetchInitialOrderStats = async () => {
      try {
        console.log("Fetching initial order stats...");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              page: 1,
              per_page: 1,
            },
          }
        );

        console.log("Order stats response:", response.data);

        if (response.data.stats) {
          dispatch(setOrderStats(response.data.stats));
        } else {
          console.warn("No stats data in response");
          setHasError(true);
          toast({
            title: "データの取得に失敗しました",
            description: "統計情報が見つかりませんでした",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch initial order stats:", error);
        setHasError(true);
        toast({
          title: "エラーが発生しました",
          description: "データの取得中に問題が発生しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialOrderStats();
  }, [dispatch, toast]);

  // WebSocket接続状態の監視
  useEffect(() => {
    if (connectionStatus === "error") {
      toast({
        title: "接続エラー",
        description: "リアルタイム更新に問題が発生しました",
        status: "warning",
        duration: null,
        isClosable: true,
      });
    }
  }, [connectionStatus, toast]);

  // タイムアウトの設定
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // メモ化された値の計算
  const displayValues = useMemo(
    () => ({
      customerCount: totalCount ? totalCount.toLocaleString() : "0",
      customerChange: changeRate ?? 0,
      orderCount: ordersState?.totalCount
        ? ordersState.totalCount.toLocaleString()
        : "0",
      orderChange: ordersState?.changeRate ?? 0,
    }),
    [totalCount, changeRate, ordersState?.totalCount, ordersState?.changeRate]
  );

  // 開発環境用のデバッグログ
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("DashboardStats state:", {
        loading: customerLoading || loading,
        customerCount: totalCount,
        customerChange: changeRate,
        orderCount: ordersState?.totalCount,
        orderChange: ordersState?.changeRate,
        orderState: ordersState,
        initialLoadTimeout,
        hasError,
        connectionStatus,
        env: process.env.NEXT_PUBLIC_APP_ENV,
      });
    }
  }, [
    customerLoading,
    loading,
    totalCount,
    changeRate,
    ordersState,
    initialLoadTimeout,
    hasError,
    connectionStatus,
  ]);

  // ローディング状態の表示
  if (
    customerLoading ||
    loading ||
    (totalCount === null && !initialLoadTimeout)
  ) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </SimpleGrid>
    );
  }

  // メインコンテンツの表示
  return (
    <Fade in={!loading} style={{ width: "100%" }}>
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={10}
        mb={10}
        data-testid="dashboard-stats-grid">
        <StatCard
          title="顧客数"
          value={displayValues.customerCount}
          change={displayValues.customerChange}
          hasError={hasError}
        />
        <StatCard
          title="注文数"
          value={displayValues.orderCount}
          change={displayValues.orderChange}
          hasError={hasError}
        />
        <StatCard title="売上高" value="¥12,345,678" change={5} />
      </SimpleGrid>
    </Fade>
  );
};

export default DashboardStats;
