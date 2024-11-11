import React from "react";
import { render } from "@testing-library/react";
import MyApp from "../pages/_app";
import { ChakraProvider } from "@chakra-ui/react";
import type { Router } from "next/router";

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

jest.mock("../styles/theme", () => ({}));

// BeforePopStateCallbackの型定義
type BeforePopStateCallback = (state: any) => boolean;

// モックルーターの作成
const mockRouter: Partial<Router> = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  components: {},
  sdc: {},
  sbc: {},
  sub: jest.fn(),
  clc: jest.fn(),
  _bps: jest.fn(() => true) as BeforePopStateCallback,
  _wrapApp: jest.fn(),
  locale: "ja",
  defaultLocale: "ja",
  domainLocales: [],
  locales: ["ja"],
};

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
      <MyApp
        Component={MockComponent}
        pageProps={mockPageProps}
        router={mockRouter as Router}
      />
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
      <MyApp
        Component={TestComponent}
        pageProps={testPageProps}
        router={mockRouter as Router}
      />
    );

    const renderedProps = JSON.parse(
      getByTestId("test-component").textContent || "{}"
    );
    expect(renderedProps).toEqual(testPageProps);
  });

  it("theme が ChakraProvider に渡されること", () => {
    render(
      <MyApp
        Component={MockComponent}
        pageProps={mockPageProps}
        router={mockRouter as Router}
      />
    );

    expect(ChakraProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: expect.any(Object),
      }),
      expect.anything()
    );
  });
});
