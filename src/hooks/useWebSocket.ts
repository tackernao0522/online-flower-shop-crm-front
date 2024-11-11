import { useState, useEffect, useRef, useCallback } from "react";
import * as Pusher from "pusher-js";
import { useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { setOrderStats } from "@/features/orders/ordersSlice";

// 型定義
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";
type PusherData = {
  totalCount: number;
  previousCount: number;
  changeRate: number;
};
type UserData = {
  totalCount: number;
};

export const useWebSocket = () => {
  // State
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const [totalUserCount, setTotalUserCount] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  // Hooks
  const dispatch = useDispatch();
  const toast = useToast();

  // Refs
  const pusherRef = useRef<Pusher.default | null>(null);
  const customerChannelRef = useRef<Pusher.Channel | null>(null);
  const userChannelRef = useRef<Pusher.Channel | null>(null);
  const orderChannelRef = useRef<Pusher.Channel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountingRef = useRef(false);
  const handleConnectionErrorRef = useRef<(error: unknown) => void>();

  // Cleanup function
  const cleanupPusher = useCallback(async () => {
    try {
      if (customerChannelRef.current) {
        customerChannelRef.current.unbind_all();
      }
      if (userChannelRef.current) {
        userChannelRef.current.unbind_all();
      }
      if (orderChannelRef.current) {
        orderChannelRef.current.unbind_all();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (pusherRef.current) {
        if (pusherRef.current.connection.state === "connected") {
          if (customerChannelRef.current) {
            pusherRef.current.unsubscribe("customer-stats");
          }
          if (userChannelRef.current) {
            pusherRef.current.unsubscribe("user-stats");
          }
          if (orderChannelRef.current) {
            pusherRef.current.unsubscribe("order-stats");
          }

          await new Promise((resolve) => setTimeout(resolve, 100));

          pusherRef.current.disconnect();
        }
      }

      customerChannelRef.current = null;
      userChannelRef.current = null;
      orderChannelRef.current = null;
      pusherRef.current = null;
    } catch (error) {
      console.warn("WebSocket cleanup error:", error);
    }
  }, []);

  // Error handler wrapper
  const handleConnectionError = useCallback((error: unknown): void => {
    handleConnectionErrorRef.current?.(error);
  }, []);

  // Initialize function
  const initializePusher = useCallback(() => {
    try {
      if (isUnmountingRef.current) return;

      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      if (!pusherKey) {
        console.error("Pusher key is not defined");
        return;
      }

      setConnectionStatus("connecting");

      const pusherConfig: Pusher.Options = {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "mt1",
        forceTLS: process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true",
        enabledTransports:
          process.env.NODE_ENV === "development" ? ["ws"] : ["ws", "wss"],
      };

      if (process.env.NODE_ENV === "development") {
        Object.assign(pusherConfig, {
          wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
          wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || "6001", 10),
          disableStats: true,
        });
      }

      pusherRef.current = new Pusher.default(pusherKey, pusherConfig);

      // 接続状態の監視
      pusherRef.current.connection.bind("connected", () => {
        setConnectionStatus("connected");
        if (process.env.NODE_ENV === "development") {
          console.log("WebSocket connected");
        }
      });

      pusherRef.current.connection.bind("error", handleConnectionError);

      // チャンネルの購読
      customerChannelRef.current =
        pusherRef.current.subscribe("customer-stats");
      userChannelRef.current = pusherRef.current.subscribe("user-stats");
      orderChannelRef.current = pusherRef.current.subscribe("order-stats");

      // イベントハンドラーの設定
      customerChannelRef.current.bind(
        "App\\Events\\CustomerCountUpdated",
        (data: PusherData) => {
          if (!isUnmountingRef.current) {
            setTotalCount(data.totalCount);
            setChangeRate(data.changeRate);
          }
        }
      );

      userChannelRef.current.bind(
        "App\\Events\\UserCountUpdated",
        (data: UserData) => {
          if (!isUnmountingRef.current) {
            setTotalUserCount(data.totalCount);
          }
        }
      );

      orderChannelRef.current.bind(
        "App\\Events\\OrderCountUpdated",
        (data: PusherData) => {
          if (!isUnmountingRef.current) {
            console.log("Received order count update:", data);
            dispatch(
              setOrderStats({
                totalCount: data.totalCount,
                changeRate: data.changeRate,
              })
            );
          }
        }
      );
    } catch (error) {
      console.error("Error initializing Pusher:", error);
      handleConnectionError(error);
    }
  }, [dispatch, handleConnectionError]);

  // Error handler implementation
  useEffect(() => {
    handleConnectionErrorRef.current = (error: unknown): void => {
      console.error("WebSocket connection error:", error);
      setConnectionStatus("error");

      if (!isUnmountingRef.current) {
        toast({
          title: "接続エラー",
          description:
            "リアルタイム更新に問題が発生しました。再接続を試みています。",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isUnmountingRef.current) {
          cleanupPusher();
          initializePusher();
        }
      }, 5000);
    };
  }, [toast, cleanupPusher, initializePusher]);

  // Initialize on mount
  useEffect(() => {
    isUnmountingRef.current = false;
    initializePusher();

    return () => {
      isUnmountingRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupPusher();
    };
  }, [initializePusher, cleanupPusher]);

  return {
    totalCount,
    changeRate,
    totalUserCount,
    connectionStatus,
  };
};
