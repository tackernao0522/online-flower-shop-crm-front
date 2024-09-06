import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchOnlineStatus = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { is_online: false };
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}/online-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("User is not authenticated, returning offline status");
      return { is_online: false };
    }
    console.error("Error fetching online status:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error response:", error.response.data);
    }
    throw error;
  }
};

export const useUserOnlineStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["onlineStatus", userId],
    queryFn: () => fetchOnlineStatus(userId || ""),
    enabled: !!userId,
    refetchInterval: 5000,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false; // 認証エラーの場合はリトライしない
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error("Error in useUserOnlineStatus:", error);
    },
  });
};
