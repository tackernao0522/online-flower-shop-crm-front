import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import LoginSkeleton from "../LoginSkeleton";

describe("LoginSkeleton コンポーネント", () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it("コンポーネントが正常にレンダリングされること", () => {
    renderWithChakra(<LoginSkeleton />);

    // SkeletonTextの確認
    expect(screen.getAllByTestId("skeleton-text")).toHaveLength(2); // 2つのSkeletonTextがある
  });

  it("ボックスが正しいスタイルでレンダリングされること", () => {
    renderWithChakra(<LoginSkeleton />);

    // ボックス内にSkeletonが4つあるか確認
    expect(screen.getAllByTestId("skeleton")).toHaveLength(4); // Skeletonが4つ
  });
});
