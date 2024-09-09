import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import RecentOrders from "../RecentOrders";
import * as useLoadingHook from "../../../hooks/useLoading";

jest.mock("../../../hooks/useLoading");

describe("RecentOrders コンポーネント", () => {
  it("ローディング中の場合、スケルトンテーブルが表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);

    render(
      <ChakraProvider>
        <RecentOrders />
      </ChakraProvider>
    );

    expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
  });

  it("ローディングが終了した場合、注文リストが正しく表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    render(
      <ChakraProvider>
        <RecentOrders />
      </ChakraProvider>
    );

    expect(screen.getByText("最近の注文")).toBeInTheDocument();
    expect(screen.getByText("注文ID")).toBeInTheDocument();
    expect(screen.getByText("顧客名")).toBeInTheDocument();
    expect(screen.getByText("金額")).toBeInTheDocument();
    expect(screen.getByText("状態")).toBeInTheDocument();
  });

  it("テーブル内に正しい注文情報が表示されている", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    render(
      <ChakraProvider>
        <RecentOrders />
      </ChakraProvider>
    );

    expect(screen.getByText("#1234")).toBeInTheDocument();
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("¥12,000")).toBeInTheDocument();
    expect(screen.getByText("#1235")).toBeInTheDocument();
    expect(screen.getByText("佐藤花子")).toBeInTheDocument();
    expect(screen.getByText("¥80,500")).toBeInTheDocument();
  });

  it("注文の状態が正しいバッジで表示されている", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    render(
      <ChakraProvider>
        <RecentOrders />
      </ChakraProvider>
    );

    // 状態バッジの確認
    expect(screen.getByText("配送中")).toHaveClass("chakra-badge");
    expect(screen.getByText("準備中")).toHaveClass("chakra-badge");
  });
});
