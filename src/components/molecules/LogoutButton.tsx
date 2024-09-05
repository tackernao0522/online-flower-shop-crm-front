"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { logout } from "../../features/auth/authSlice";
import { MenuItem } from "@chakra-ui/react";

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token"); // トークンをローカルストレージから取得

      if (!token) {
        console.error("No token found, unable to logout");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに追加
          },
          withCredentials: true,
        }
      );

      // Reduxのステートを更新し、ログアウト状態にする
      dispatch(logout());

      // ローカルストレージからユーザーデータを削除
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // ログインページにリダイレクト
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return <MenuItem onClick={handleLogout}>ログアウト</MenuItem>;
};

export default LogoutButton;
