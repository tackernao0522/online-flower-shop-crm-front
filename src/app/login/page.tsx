"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AuthLayout from "../../components/templates/AuthLayout";
import LoginForm from "../../components/organisms/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // または適切なローディング表示
  }

  return (
    <AuthLayout title="ログイン">
      <LoginForm />
    </AuthLayout>
  );
}
