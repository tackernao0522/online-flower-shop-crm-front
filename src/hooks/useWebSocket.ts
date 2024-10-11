import { useState, useEffect, useRef, useCallback } from "react";
import * as Pusher from "pusher-js";

export const useWebSocket = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const [totalUserCount, setTotalUserCount] = useState<number | null>(null);
  const pusherRef = useRef<Pusher.default | null>(null);
  const customerChannelRef = useRef<Pusher.Channel | null>(null);
  const userChannelRef = useRef<Pusher.Channel | null>(null);
  const lastNonZeroChangeRate = useRef<number | null>(null);

  const cleanupPusher = useCallback(() => {
    if (
      pusherRef.current &&
      pusherRef.current.connection.state !== "disconnected"
    ) {
      pusherRef.current.disconnect();
    }
    if (customerChannelRef.current) {
      customerChannelRef.current.unbind_all();
      if (pusherRef.current) {
        pusherRef.current.unsubscribe("customer-stats");
      }
    }
    if (userChannelRef.current) {
      userChannelRef.current.unbind_all();
      if (pusherRef.current) {
        pusherRef.current.unsubscribe("user-stats");
      }
    }
    customerChannelRef.current = null;
    userChannelRef.current = null;
    pusherRef.current = null;
  }, []);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
    const pusherPort = process.env.NEXT_PUBLIC_PUSHER_PORT;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;
    const pusherScheme =
      (process.env.NEXT_PUBLIC_PUSHER_SCHEME as "ws" | "wss") || "ws";

    // 本番環境チェック
    if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
      console.log(
        "WebSocket functionality is disabled in production environment"
      );
      return; // 本番環境では初期化を行わない
    }

    if (!pusherKey) {
      console.error("Pusher key is not defined");
      return;
    }

    const initializePusher = () => {
      cleanupPusher();

      pusherRef.current = new Pusher.default(pusherKey, {
        wsHost: pusherHost,
        wsPort: pusherPort ? parseInt(pusherPort, 10) : undefined,
        wssPort: pusherPort ? parseInt(pusherPort, 10) : undefined,
        forceTLS: pusherScheme === "wss",
        enabledTransports: [pusherScheme],
        disableStats: true,
        cluster: pusherCluster || "default-cluster",
      });

      // 接続状態の変更をログに出力
      pusherRef.current.connection.bind("state_change", (states: any) => {
        console.log("Connection state change:", states);
      });

      // エラーが発生した場合のログを出力
      pusherRef.current.connection.bind("error", (err: any) => {
        console.error("Connection error:", err);
      });

      customerChannelRef.current =
        pusherRef.current.subscribe("customer-stats");
      userChannelRef.current = pusherRef.current.subscribe("user-stats");

      customerChannelRef.current.bind(
        "App\\Events\\CustomerCountUpdated",
        (data: {
          totalCount: number;
          previousTotalCount: number;
          changeRate: number;
        }) => {
          console.log("Received customer count update:", data);
          setTotalCount(data.totalCount);
          setChangeRate(data.changeRate);
        }
      );

      userChannelRef.current.bind(
        "App\\Events\\UserCountUpdated",
        (data: { totalCount: number }) => {
          console.log("Received user count update:", data);
          setTotalUserCount(data.totalCount);
        }
      );
    };

    initializePusher();

    return () => {
      cleanupPusher();
    };
  }, [cleanupPusher]);

  return { totalCount, changeRate, totalUserCount };
};
