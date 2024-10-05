"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { logout } from "../../features/auth/authSlice";
import { MenuItem } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { AppDispatch } from "../../store"; // AppDispatch 型をインポート

const LogoutButton: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // AppDispatch 型を使用
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, unable to logout");
      return;
    }

    try {
      // ログアウトリクエストを送信
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Reduxのログアウトアクションをディスパッチ
      dispatch(logout());

      // ローカルストレージのトークンとユーザー情報を削除
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");

      // オンラインステータスのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["onlineStatus"] });

      // ログインページにリダイレクト
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return <MenuItem onClick={handleLogout}>ログアウト</MenuItem>;
};

export default LogoutButton;
