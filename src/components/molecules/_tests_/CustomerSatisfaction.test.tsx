import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import CustomerSatisfaction from "../CustomerSatisfaction";
import * as useLoadingHook from "../../../hooks/useLoading";

jest.mock("../../../hooks/useLoading");

describe("CustomerSatisfaction", () => {
  it("ローディング中にスケルトンを表示する", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(true);
    render(
      <ChakraProvider>
        <CustomerSatisfaction />
      </ChakraProvider>
    );
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("ローディング完了後に顧客満足度の情報を表示する", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);
    render(
      <ChakraProvider>
        <CustomerSatisfaction />
      </ChakraProvider>
    );

    expect(screen.getByText("顧客満足度")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("前月比: +2%")).toBeInTheDocument();
  });

  it("プログレスバーが正しい値で表示される", () => {
    (useLoadingHook.useLoading as jest.Mock).mockReturnValue(false);
    render(
      <ChakraProvider>
        <CustomerSatisfaction />
      </ChakraProvider>
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "85");
  });
});
