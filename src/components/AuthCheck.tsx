"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setAuthState, logout } from "../features/auth/authSlice";

const AuthCheck = () => {
  const router = useRouter();
  const dispatch = useDispatch();
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
