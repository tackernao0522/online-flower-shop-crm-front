"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "../store";
import { login } from "../features/auth/authSlice";

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
      let storedToken;
      try {
        storedToken = localStorage.getItem("token");
      } catch (e) {
        console.error("Error reading from localStorage:", e);
      }

      if (!isAuthenticated && !token && !storedToken) {
        router.push("/login");
      } else if (storedToken && !isAuthenticated) {
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          dispatch(login({ token: storedToken, user }));
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, token, router, dispatch]);

  if (typeof window === "undefined" || isLoading) {
    return null;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default PrivateRoute;
