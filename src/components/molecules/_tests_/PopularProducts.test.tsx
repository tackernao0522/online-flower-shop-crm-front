import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import PopularProducts from "../PopularProducts";
import * as useLoadingHook from "../../../hooks/useLoading";

jest.mock("../../../hooks/useLoading");

describe("PopularProducts コンポーネント", () => {
  it("ローディング中の場合、スケルトンコンポーネントが表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);

    render(
      <ChakraProvider>
        <PopularProducts />
      </ChakraProvider>
    );

    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("ローディングが終了した場合、商品リストが正しく表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);

    render(
      <ChakraProvider>
        <PopularProducts />
      </ChakraProvider>
    );

    expect(screen.getByText("人気商品")).toBeInTheDocument();
    expect(screen.getByText("1. バラの花束")).toBeInTheDocument();
    expect(screen.getByText("2. ひまわりアレンジ")).toBeInTheDocument();
    expect(screen.getByText("3. 胡蝶蘭鉢植え")).toBeInTheDocument();
  });
});
