"use client";

import React, { useState } from "react";
import {
  VStack,
  Flex,
  Link,
  useColorModeValue,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";
import Checkbox from "../atoms/Checkbox";
import { login } from "../../features/auth/authSlice";
import axios from "axios";

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const linkColor = useColorModeValue("blue.500", "blue.300");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

      if (response.data && response.data.accessToken) {
        const { accessToken, tokenType, expiresIn } = response.data;
        localStorage.setItem("token", accessToken);
        dispatch(login({ token: accessToken, tokenType, expiresIn }));
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
    }
  };

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
        <Button type="submit" colorScheme="blue" size={buttonSize} width="100%">
          ログイン
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
