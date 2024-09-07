import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";
import { ChakraProvider } from "@chakra-ui/react";

describe("StatCardコンポーネント", () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it("タイトル、値、変化率が正しく表示されること", () => {
    renderWithChakra(<StatCard title="売上" value="100,000円" change={10} />);

    // タイトルが表示されること
    expect(screen.getByText("売上")).toBeInTheDocument();

    // 値が表示されること
    expect(screen.getByText("100,000円")).toBeInTheDocument();

    // 変化率が表示されること
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("変化率が正の数のとき、緑色の上向き矢印が表示されること", () => {
    renderWithChakra(<StatCard title="売上" value="100,000円" change={15} />);

    // 上向き矢印が表示されること
    expect(screen.getByTestId("arrow-up")).toBeInTheDocument();

    // 変化率が緑色で表示されること
    const changeText = screen.getByText("15%");
    expect(changeText).toHaveStyle("color: var(--chakra-colors-green-500)");
  });

  it("変化率が負の数のとき、赤色の下向き矢印が表示されること", () => {
    renderWithChakra(<StatCard title="売上" value="100,000円" change={-5} />);

    // 下向き矢印が表示されること
    expect(screen.getByTestId("arrow-down")).toBeInTheDocument();

    // 変化率が赤色で表示されること
    const changeText = screen.getByText("5%");
    expect(changeText).toHaveStyle("color: var(--chakra-colors-red-500)");
  });
});
