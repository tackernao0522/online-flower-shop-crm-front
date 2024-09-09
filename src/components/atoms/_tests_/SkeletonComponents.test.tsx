import React from "react";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import {
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "../SkeletonComponents";

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("SkeletonComponents コンポーネント", () => {
  it("CardSkeletonが正しくレンダリングされること", () => {
    renderWithChakra(<CardSkeleton />);
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-circle")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-text")).toBeInTheDocument();
  });

  it("StatCardSkeletonが正しくレンダリングされること", () => {
    renderWithChakra(<StatCardSkeleton />);
    expect(screen.getByTestId("stat-card-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("stat-skeleton-1")).toBeInTheDocument();
    expect(screen.getByTestId("stat-skeleton-2")).toBeInTheDocument();
    expect(screen.getByTestId("stat-skeleton-3")).toBeInTheDocument();
  });

  it("TableSkeletonが正しくレンダリングされること", () => {
    renderWithChakra(<TableSkeleton />);
    expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-row-3")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-row-4")).toBeInTheDocument();
    expect(screen.getByTestId("table-skeleton-row-5")).toBeInTheDocument();
  });

  it("ChartSkeletonが正しくレンダリングされること", () => {
    renderWithChakra(<ChartSkeleton />);
    expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("chart-skeleton-body")).toBeInTheDocument();
  });
});
