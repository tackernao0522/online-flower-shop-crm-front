import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import ImportantNotifications from "../ImportantNotifications";
import * as useLoadingHook from "../../../hooks/useLoading";

jest.mock("../../../hooks/useLoading");

describe("ImportantNotifications", () => {
  it("ローディング中にスケルトンを表示する", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);
    render(
      <ChakraProvider>
        <ImportantNotifications />
      </ChakraProvider>
    );
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("ローディング完了後に重要通知を表示する", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);
    render(
      <ChakraProvider>
        <ImportantNotifications />
      </ChakraProvider>
    );

    expect(screen.getByText("重要通知")).toBeInTheDocument();
    expect(
      screen.getByText("新商品 「季節の花束セット」が追加されました。")
    ).toBeInTheDocument();
  });

  it("アラートコンポーネントが正しく表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);
    render(
      <ChakraProvider>
        <ImportantNotifications />
      </ChakraProvider>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      "新商品 「季節の花束セット」が追加されました。"
    );
  });
});
