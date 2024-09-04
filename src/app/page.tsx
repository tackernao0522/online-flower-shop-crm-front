import React from "react";
import AuthLayout from "../components/templates/AuthLayout";
import LoginForm from "../components/organisms/LoginForm";

export default function Home() {
  return (
    <AuthLayout title="ログイン">
      <LoginForm />
    </AuthLayout>
  );
}
