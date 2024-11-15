"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardTemplate from "@/components/templates/DashboardTemplate";
import PrivateRoute from "@/components/PrivateRoute";
import { selectIsAuthenticated } from "../../features/auth/authSlice";

export default function DashboardPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    console.log("DashboardPage: Mounted or auth state changed, isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("DashboardPage: Not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  console.log("DashboardPage: Rendering, isAuthenticated:", isAuthenticated);
  return (
    <PrivateRoute>
      <DashboardTemplate />
    </PrivateRoute>
  );
}
