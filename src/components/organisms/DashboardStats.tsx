'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SimpleGrid, useToast, Fade, Box, Text } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import axios, { AxiosError } from 'axios';
import StatCard from '../atoms/StatCard';
import { StatCardSkeleton } from '../atoms/SkeletonComponents';
import { useCustomerManagement } from '../../hooks/useCustomerManagement';
import { useWebSocket } from '../../hooks/useWebSocket';
import { AppDispatch } from '@/store';
import {
  setOrderStats,
  selectOrderStats,
  selectOrderStatsStatus,
} from '@/features/orders/ordersSlice';
import {
  setSalesStats,
  selectSalesStats,
  selectSalesStatsStatus,
  selectSalesStatsError,
} from '@/features/stats/statsSlice';

interface StatsResponse {
  stats?: {
    totalCount: number;
    previousCount: number;
    changeRate: number;
    totalSales?: number;
    salesChangeRate?: number;
  };
}

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

interface DisplayValues {
  customerCount: string;
  customerChange: number;
  orderCount: string;
  orderChange: number;
  salesTotal: string;
  salesChange: number;
  lastUpdated?: string;
}

const DashboardStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [initialLoadTimeout, setInitialLoadTimeout] = useState<boolean>(false);

  const { loading: customerLoading } = useCustomerManagement();
  const { totalCount, changeRate, connectionStatus } = useWebSocket();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const orderStats = useSelector(selectOrderStats);
  const orderStatsStatus = useSelector(selectOrderStatsStatus);
  const salesStats = useSelector(selectSalesStats);
  const salesStatsStatus = useSelector(selectSalesStatsStatus);
  const salesStatsError = useSelector(selectSalesStatsError);

  const fetchInitialStats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<StatsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            page: 1,
            per_page: 1,
          },
        },
      );

      if (response.data.stats) {
        // 注文統計を更新
        dispatch(
          setOrderStats({
            totalCount: response.data.stats.totalCount,
            previousCount: response.data.stats.previousCount,
            changeRate: response.data.stats.changeRate,
          }),
        );

        // 売上統計を更新
        if (response.data.stats.totalSales !== undefined) {
          dispatch(
            setSalesStats({
              totalSales: Number(response.data.stats.totalSales),
              changeRate: Number(response.data.stats.salesChangeRate || 0),
              lastUpdatedAt: new Date().toISOString(),
            }),
          );
        }
      } else {
        setHasError(true);
        toast({
          title: 'データの取得に失敗しました',
          description: '統計情報が見つかりませんでした',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setHasError(true);
      toast({
        title: 'エラーが発生しました',
        description:
          axiosError.response?.data?.message ||
          'データの取得中に問題が発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast]);

  // 初期データ取得
  useEffect(() => {
    let mounted = true;

    const initializeStats = async (): Promise<void> => {
      if (mounted) {
        await fetchInitialStats();
      }
    };

    initializeStats();

    return () => {
      mounted = false;
    };
  }, [fetchInitialStats]);

  // WebSocket接続監視
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchInitialStats();
    }
  }, [connectionStatus, fetchInitialStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 表示値の計算
  const displayValues = useMemo<DisplayValues>(
    () => ({
      customerCount: totalCount ? totalCount.toLocaleString() : '0',
      customerChange: changeRate ?? 0,
      orderCount:
        orderStats.totalCount !== null
          ? orderStats.totalCount.toLocaleString()
          : '0',
      orderChange: orderStats.changeRate ?? 0,
      salesTotal: `¥${(salesStats?.totalSales ?? 0).toLocaleString()}`,
      salesChange: salesStats?.changeRate ?? 0,
      lastUpdated: salesStats?.lastUpdatedAt,
    }),
    [
      totalCount,
      changeRate,
      orderStats.totalCount,
      orderStats.changeRate,
      salesStats?.totalSales,
      salesStats?.changeRate,
      salesStats?.lastUpdatedAt,
    ],
  );

  // デバッグログ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DashboardStats state:', {
        loading: customerLoading || loading,
        customerCount: totalCount,
        customerChange: changeRate,
        orderStats,
        salesStats,
        initialLoadTimeout,
        hasError,
        connectionStatus,
      });
    }
  }, [
    customerLoading,
    loading,
    totalCount,
    changeRate,
    orderStats,
    salesStats,
    initialLoadTimeout,
    hasError,
    connectionStatus,
  ]);

  if (
    customerLoading ||
    loading ||
    orderStatsStatus === 'loading' ||
    salesStatsStatus === 'loading' ||
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

  if (hasError) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.500">
          統計データの取得中にエラーが発生しました。
          {salesStatsError && `: ${salesStatsError}`}
        </Text>
      </Box>
    );
  }

  return (
    <Fade in={!loading} style={{ width: '100%' }}>
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
          lastUpdated={displayValues.lastUpdated}
        />
        <StatCard
          title="売上高"
          value={displayValues.salesTotal}
          change={displayValues.salesChange}
          hasError={hasError}
          format="currency"
          lastUpdated={displayValues.lastUpdated}
        />
      </SimpleGrid>
    </Fade>
  );
};

export default React.memo(DashboardStats);
