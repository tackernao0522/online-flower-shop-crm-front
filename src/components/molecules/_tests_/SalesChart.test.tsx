import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import SalesChart from "../SalesChart";
import * as useLoadingHook from "../../../hooks/useLoading";

jest.mock("../../../hooks/useLoading");
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
}));

describe("SalesChart", () => {
  it("ローディング中にスケルトンを表示する", () => {
    jest.spyOn(useLoadingHook, "useLoading").mockReturnValue(true);
    render(
      <ChakraProvider>
        <SalesChart />
      </ChakraProvider>
    );
    expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
  });

  it("ローディング完了後に売上チャートを表示する", () => {
    jest.spyOn(useLoadingHook, "useLoading").mockReturnValue(false);
    render(
      <ChakraProvider>
        <SalesChart />
      </ChakraProvider>
    );

    expect(screen.getByText("売上推移")).toBeInTheDocument();
    expect(screen.getByText("Bar")).toBeInTheDocument();
    expect(screen.getByText("XAxis")).toBeInTheDocument();
    expect(screen.getByText("YAxis")).toBeInTheDocument();
    expect(screen.getByText("CartesianGrid")).toBeInTheDocument();
    expect(screen.getByText("Tooltip")).toBeInTheDocument();
  });
});
