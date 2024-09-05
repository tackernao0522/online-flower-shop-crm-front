"use client";

import React, { useState, useEffect } from "react";
import {
  VStack,
  Flex,
  Link,
  useColorModeValue,
  Text,
  useBreakpointValue,
  Spinner, // Spinnerコンポーネントをインポート
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";
import Checkbox from "../atoms/Checkbox";
import { login } from "../../features/auth/authSlice";
import axios from "axios";
import { RootState } from "../../store";

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ローディング状態を管理するstateを追加

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const linkColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkLocalStorage = () => {
        try {
          const storedToken = localStorage.getItem("token");
          console.log(
            "Stored token in LoginForm during interval check:",
            storedToken
          );
        } catch (e) {
          console.error("Error reading from localStorage in LoginForm:", e);
        }
      };

      checkLocalStorage();
      const interval = setInterval(checkLocalStorage, 1000); // 1秒ごとにチェック

      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ログイン処理が始まるときにローディング状態をtrueに設定

    if (isAuthenticated) {
      setError(
        "既にログインしています。新しくログインするには一度ログアウトしてください。"
      );
      setLoading(false); // エラーメッセージが表示された後、ローディングを停止
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Full login response:", response);
      console.log("Login response data:", response.data);

      if (response.data && response.data.accessToken) {
        const { accessToken, user } = response.data;
        console.log("Saving token to localStorage:", accessToken);
        console.log("User data to save:", user);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            console.log(
              "Token and user saved to localStorage:",
              localStorage.getItem("token"),
              localStorage.getItem("user")
            );
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }

        console.log("Dispatching login action");
        dispatch(login({ token: accessToken, user }));
        console.log("Dispatched login action, attempting to redirect...");
        router.push("/dashboard");
        console.log("Redirect instruction sent");
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        setError(
          error.response.data.error?.message || "ログインに失敗しました。"
        );
      } else {
        setError(
          "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
        );
      }
    } finally {
      setLoading(false); // ログイン処理が完了したらローディング状態をfalseに設定
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <FormField
          label="パスワード"
          name="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Checkbox size={["sm", "md"]}>ログイン状態を保持する</Checkbox>
        <Button
          type="submit"
          colorScheme="blue"
          size={buttonSize}
          width="100%"
          disabled={loading} // ローディング中はボタンを無効化
        >
          {loading ? <Spinner size="sm" /> : "ログイン"}{" "}
          {/* ローディング中はSpinnerを表示 */}
        </Button>
        {error && (
          <Text color="red.500" fontSize={["xs", "sm"]}>
            {error}
          </Text>
        )}
        <Flex
          justify="space-between"
          fontSize={["xs", "sm"]}
          flexDirection={["column", "row"]}
          align={["stretch", "center"]}>
          <Link color={linkColor} mb={[2, 0]}>
            パスワードを忘れた場合
          </Link>
          <Link color={linkColor}>新規登録</Link>
        </Flex>
      </VStack>
    </form>
  );
};

export default LoginForm;
