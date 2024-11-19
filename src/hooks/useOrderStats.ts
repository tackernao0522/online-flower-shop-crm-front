import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import {
  setOrderStats,
  setStatsLoading,
  setStatsError,
  selectOrderStats,
  selectOrderStatsStatus,
  selectOrderStatsError,
} from "@/features/orders/ordersSlice";

export const useOrderStats = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const orderStats = useSelector(selectOrderStats);
  const statsStatus = useSelector(selectOrderStatsStatus);
  const statsError = useSelector(selectOrderStatsError);

  const fetchInitialStats = useCallback(async () => {
    dispatch(setStatsLoading());
    try {
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

      if (response.data.stats) {
        dispatch(
          setOrderStats({
            totalCount: response.data.stats.totalCount,
            previousCount: response.data.stats.previousCount,
            changeRate: response.data.stats.changeRate,
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      dispatch(setStatsError("統計データの取得に失敗しました"));
      toast({
        title: "エラー",
        description: "統計データの取得中にエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [dispatch, toast]);

  useEffect(() => {
    fetchInitialStats();
  }, [fetchInitialStats]);

  return {
    orderStats,
    statsStatus,
    statsError,
    refetchStats: fetchInitialStats,
  };
};
