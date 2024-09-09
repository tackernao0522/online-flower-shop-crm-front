import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import UnprocessedTasks from "../UnprocessedTasks";
import * as useLoadingHook from "../../../hooks/useLoading";

// useLoading をモック化
jest.mock("../../../hooks/useLoading");

describe("UnprocessedTasks コンポーネント", () => {
  it("ローディング中の場合、スケルトンコンポーネントが表示される", () => {
    // useLoading が true を返すようにモック設定
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);

    // コンポーネントをレンダリング
    render(
      <ChakraProvider>
        <UnprocessedTasks />
      </ChakraProvider>
    );

    // スケルトンコンポーネントが表示されているか確認
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("ローディングが終了した場合、未処理タスクが正しく表示される", () => {
    // useLoading が false を返すようにモック設定
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    // コンポーネントをレンダリング
    render(
      <ChakraProvider>
        <UnprocessedTasks />
      </ChakraProvider>
    );

    // タスクタイトルが表示されているか確認
    expect(screen.getByText("未処理タスク")).toBeInTheDocument();

    // 各タスクが正しく表示されているか確認
    expect(
      screen.getByText("• 新規顧客フォローアップ (3件)")
    ).toBeInTheDocument();
    expect(screen.getByText("• 在庫確認 (5件)")).toBeInTheDocument();
    expect(screen.getByText("• クレーム対応 (1件)")).toBeInTheDocument();
  });
});
