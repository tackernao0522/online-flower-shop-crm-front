import { useState, useEffect, useRef, useCallback } from "react";
import Pusher from "pusher-js";

export const useWebSocket = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Pusher.Channel | null>(null);
  const lastNonZeroChangeRate = useRef<number | null>(null);

  const cleanupPusher = useCallback(() => {
    if (
      pusherRef.current &&
      pusherRef.current.connection.state !== "disconnected"
    ) {
      pusherRef.current.disconnect();
    }
    if (channelRef.current) {
      channelRef.current.unbind_all();
      if (pusherRef.current) {
        pusherRef.current.unsubscribe("customer-stats");
      }
    }
    channelRef.current = null;
    pusherRef.current = null;
  }, []);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
    const pusherPort = process.env.NEXT_PUBLIC_PUSHER_PORT;
    const pusherScheme = process.env.NEXT_PUBLIC_PUSHER_SCHEME;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!pusherKey) {
      console.error("Pusher key is not defined");
      return;
    }

    const initializePusher = () => {
      cleanupPusher();

      pusherRef.current = new Pusher(pusherKey, {
        wsHost: pusherHost,
        wsPort: pusherPort ? parseInt(pusherPort, 10) : undefined,
        forceTLS: false,
        encrypted: false,
        enabledTransports: ["ws", "wss"],
        disableStats: true,
        cluster: pusherCluster,
        enableLogging: true,
      });

      channelRef.current = pusherRef.current.subscribe("customer-stats");

      channelRef.current.bind(
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
    };

    initializePusher();

    return () => {
      cleanupPusher();
    };
  }, [cleanupPusher]);

  return { totalCount, changeRate };
};
