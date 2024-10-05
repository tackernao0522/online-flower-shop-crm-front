import React from "react";
import { render } from "@testing-library/react";
import MyApp from "../pages/_app";
import { ChakraProvider } from "@chakra-ui/react";
import { Providers } from "../lib/providers";

// モックの設定
jest.mock("@chakra-ui/react", () => ({
  ChakraProvider: jest.fn(({ children }) => (
    <div data-testid="chakra-provider">{children}</div>
  )),
}));

jest.mock("../lib/providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

jest.mock("../lib/redux", () => ({
  wrapper: {
    withRedux: (component: React.ComponentType) => component,
  },
}));

jest.mock("../styles/theme", () => ({}));

describe("MyApp", () => {
  const MockComponent = () => (
    <div data-testid="mock-component">Mock Component</div>
  );
  const mockPageProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("正しくコンポーネントをラップすること", () => {
    const { getByTestId } = render(
      <MyApp Component={MockComponent} pageProps={mockPageProps} />
    );

    expect(getByTestId("providers")).toBeInTheDocument();
    expect(getByTestId("chakra-provider")).toBeInTheDocument();
    expect(getByTestId("mock-component")).toBeInTheDocument();
  });

  it("pageProps が正しく渡されること", () => {
    const TestComponent = (props: any) => (
      <div data-testid="test-component">{JSON.stringify(props)}</div>
    );
    const testPageProps = { testProp: "test value" };

    const { getByTestId } = render(
      <MyApp Component={TestComponent} pageProps={testPageProps} />
    );

    const renderedProps = JSON.parse(
      getByTestId("test-component").textContent || "{}"
    );
    expect(renderedProps).toEqual(testPageProps);
  });

  it("theme が ChakraProvider に渡されること", () => {
    render(<MyApp Component={MockComponent} pageProps={mockPageProps} />);

    expect(ChakraProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: expect.any(Object),
      }),
      expect.anything()
    );
  });
});
