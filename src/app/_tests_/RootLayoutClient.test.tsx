import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import RootLayoutClient from "../RootLayoutClient";

// LoginSkeletonコンポーネントのモック
jest.mock("../../components/atoms/LoginSkeleton", () => ({
  LoginSkeleton: () => <div data-testid="login-skeleton">Login Skeleton</div>,
}));

describe("RootLayoutClient コンポーネント", () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態でローディングスケルトンを表示する", () => {
    renderWithChakra(<RootLayoutClient>Test Content</RootLayoutClient>);
    expect(screen.getByTestId("login-skeleton")).toBeInTheDocument();
  });

  it("ローディング後に子コンポーネントを表示する", () => {
    renderWithChakra(<RootLayoutClient>Test Content</RootLayoutClient>);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.queryByTestId("login-skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("ローディングスケルトンが中央に配置されている", () => {
    renderWithChakra(<RootLayoutClient>Test Content</RootLayoutClient>);
    const box = screen.getByTestId("loading-box");
    expect(box).toHaveStyle({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    });
  });

  it("子コンポーネントが正しくレンダリングされる", () => {
    renderWithChakra(
      <RootLayoutClient>
        <div data-testid="child-component">Child Component</div>
      </RootLayoutClient>
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });
});
