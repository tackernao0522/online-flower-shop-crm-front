"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store"; // AppDispatchをインポート
import { setAuthState, logout } from "../features/auth/authSlice";

const AuthCheck = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch(); // AppDispatch 型を適用
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      // クライアントサイドでのみ実行されるようにする
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!isAuthenticated && storedToken && storedUser) {
        dispatch(setAuthState(true));
      } else if (!storedToken || !storedUser) {
        dispatch(logout());
        router.push("/login");
      }
    }
  }, [isAuthenticated, token, user, dispatch, router]);

  return null;
};

export default AuthCheck;
