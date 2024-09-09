import React from "react";
import { render } from "@testing-library/react";
import RootLayout from "../layout";

// モックコンポーネントの作成
jest.mock("../../lib/providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

jest.mock("@chakra-ui/react", () => ({
  ChakraProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chakra-provider">{children}</div>
  ),
}));

jest.mock("../RootLayoutClient", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="root-layout-client">{children}</div>
  ),
}));

jest.mock("../../components/AuthCheck", () => ({
  __esModule: true,
  default: () => <div data-testid="auth-check">Auth Check</div>,
}));

describe("RootLayout コンポーネント", () => {
  it("正しい言語属性を持つhtml要素をレンダリングする", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    const htmlElement = container.querySelector("html");
    expect(htmlElement).toHaveAttribute("lang", "ja");
  });

  it("Providersコンポーネントをレンダリングする", () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByTestId("providers")).toBeInTheDocument();
  });

  it("ChakraProviderコンポーネントをレンダリングする", () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByTestId("chakra-provider")).toBeInTheDocument();
  });

  it("RootLayoutClientコンポーネントをレンダリングする", () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByTestId("root-layout-client")).toBeInTheDocument();
  });

  it("AuthCheckコンポーネントをレンダリングする", () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByTestId("auth-check")).toBeInTheDocument();
  });

  it("子要素を正しくレンダリングする", () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByText("Test Child")).toBeInTheDocument();
  });
});
