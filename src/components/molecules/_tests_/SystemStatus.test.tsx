import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import SystemStatus from "../SystemStatus"; // コンポーネントのインポート
import * as useLoadingHook from "../../../hooks/useLoading"; // フックのモック化

jest.mock("../../../hooks/useLoading");

describe("SystemStatus コンポーネント", () => {
  it("ローディング中の場合、スケルトンコンポーネントが表示される", () => {
    // useLoading フックが true を返すようにモック
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);

    render(
      <ChakraProvider>
        <SystemStatus />
      </ChakraProvider>
    );

    // CardSkeleton が表示されていることを確認
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("ローディングが終了した場合、システム状態が正しく表示される", () => {
    // useLoading フックが false を返すようにモック
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    render(
      <ChakraProvider>
        <SystemStatus />
      </ChakraProvider>
    );

    // システム状態が正しく表示されていることを確認
    expect(screen.getByText("システム状態")).toBeInTheDocument();
    expect(screen.getByText("eコマース同期:")).toBeInTheDocument();
    expect(screen.getByText("セキュリティ:")).toBeInTheDocument();
    expect(screen.getByText("バックアップ:")).toBeInTheDocument();

    // 正しいバッジが表示されていることを確認
    expect(screen.getByText("正常")).toBeInTheDocument();
    expect(screen.getByText("異常なし")).toBeInTheDocument();
    expect(screen.getByText("進行中")).toBeInTheDocument();
  });
});
