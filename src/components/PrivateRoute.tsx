"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "../store";
import { setAuthState, login } from "../features/auth/authSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log(
        "PrivateRoute: Checking auth. isAuthenticated:",
        isAuthenticated,
        "token:",
        token
      );
      let storedToken;
      try {
        storedToken = localStorage.getItem("token");
        console.log("PrivateRoute: Stored token:", storedToken);
      } catch (e) {
        console.error("Error reading from localStorage:", e);
      }

      if (!isAuthenticated && !token && !storedToken) {
        console.log("PrivateRoute: Not authenticated, redirecting to login");
        router.push("/login");
      } else if (storedToken && !isAuthenticated) {
        console.log(
          "PrivateRoute: Token found but not authenticated, setting auth state"
        );
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          dispatch(login({ token: storedToken, user }));
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      } else {
        console.log("PrivateRoute: Authenticated");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, token, router, dispatch]); // isAuthenticated を依存関係に追加

  if (typeof window === "undefined" || isLoading) {
    console.log("PrivateRoute: Loading or server-side rendering");
    return null;
  }

  console.log(
    "PrivateRoute: Rendering children, isAuthenticated:",
    isAuthenticated
  );
  return isAuthenticated ? <>{children}</> : null;
};

export default PrivateRoute;
