import { useState, useEffect, useRef, useCallback } from "react";
import * as Pusher from "pusher-js";

export const useWebSocket = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const [totalUserCount, setTotalUserCount] = useState<number | null>(null);
  const pusherRef = useRef<Pusher.default | null>(null);
  const customerChannelRef = useRef<Pusher.Channel | null>(null);
  const userChannelRef = useRef<Pusher.Channel | null>(null);
  const isUnmountingRef = useRef(false);

  const cleanupPusher = useCallback(() => {
    try {
      // チャンネルの購読解除
      if (customerChannelRef.current) {
        customerChannelRef.current.unbind_all();
        if (pusherRef.current) {
          pusherRef.current.unsubscribe("customer-stats");
        }
        customerChannelRef.current = null;
      }

      if (userChannelRef.current) {
        userChannelRef.current.unbind_all();
        if (pusherRef.current) {
          pusherRef.current.unsubscribe("user-stats");
        }
        userChannelRef.current = null;
      }

      // Pusher接続の切断
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.debug("WebSocket cleanup (safe to ignore):", error);
      }
    }
  }, []);

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
    const pusherPort = process.env.NEXT_PUBLIC_PUSHER_PORT;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;
    const pusherScheme = process.env.NEXT_PUBLIC_PUSHER_SCHEME;
    const forceTLS = process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true";

    if (!pusherKey) {
      console.error("Pusher key is not defined");
      return;
    }

    const initializePusher = () => {
      try {
        cleanupPusher();

        if (isUnmountingRef.current) return;

        console.log("Initializing Pusher with config:", {
          env,
          key: pusherKey,
          host: pusherHost,
          port: pusherPort,
          cluster: pusherCluster,
          scheme: pusherScheme,
          forceTLS,
        });

        const pusherConfig: Pusher.Options = {
          cluster: pusherCluster || "mt1",
          forceTLS: forceTLS || false,
          enabledTransports: env === "development" ? ["ws"] : ["ws", "wss"],
        };

        if (env === "development") {
          Object.assign(pusherConfig, {
            wsHost: pusherHost,
            wsPort: parseInt(pusherPort || "6001", 10),
            disableStats: true,
          });
        }

        pusherRef.current = new Pusher.default(pusherKey, pusherConfig);

        pusherRef.current.connection.bind(
          "state_change",
          (states: { current: string; previous: string }) => {
            if (!isUnmountingRef.current) {
              console.log("Pusher connection state:", {
                previous: states.previous,
                current: states.current,
              });
            }
          }
        );

        pusherRef.current.connection.bind("error", (err: any) => {
          if (!isUnmountingRef.current) {
            console.error("Pusher connection error:", err);
          }
        });

        customerChannelRef.current =
          pusherRef.current.subscribe("customer-stats");
        userChannelRef.current = pusherRef.current.subscribe("user-stats");

        customerChannelRef.current.bind("pusher:subscription_succeeded", () => {
          if (!isUnmountingRef.current) {
            console.log("Successfully subscribed to customer-stats channel");
          }
        });

        customerChannelRef.current.bind(
          "pusher:subscription_error",
          (error: any) => {
            if (!isUnmountingRef.current) {
              console.error(
                "Failed to subscribe to customer-stats channel:",
                error
              );
            }
          }
        );

        customerChannelRef.current.bind(
          "App\\Events\\CustomerCountUpdated",
          (data: {
            totalCount: number;
            previousTotalCount: number;
            changeRate: number;
          }) => {
            if (!isUnmountingRef.current) {
              console.log("Received customer count update:", data);
              setTotalCount(data.totalCount);
              setChangeRate(data.changeRate);
            }
          }
        );

        userChannelRef.current.bind(
          "App\\Events\\UserCountUpdated",
          (data: { totalCount: number }) => {
            if (!isUnmountingRef.current) {
              console.log("Received user count update:", data);
              setTotalUserCount(data.totalCount);
            }
          }
        );
      } catch (error) {
        console.error("Error initializing Pusher:", error);
      }
    };

    isUnmountingRef.current = false;
    initializePusher();

    return () => {
      isUnmountingRef.current = true;
      cleanupPusher(); // setTimeoutを削除
    };
  }, [cleanupPusher]);

  return { totalCount, changeRate, totalUserCount };
};
