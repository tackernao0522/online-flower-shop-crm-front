import React from "react";
import { render, screen } from "@testing-library/react";
import { Providers } from "../providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "../redux";

// モックするものがなければ以下の記述は不要
jest.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => (
    <div data-testid="mock-devtools">ReactQueryDevtools</div>
  ),
}));

describe("Providersコンポーネント", () => {
  it("子コンポーネントが正しくレンダリングされること", () => {
    render(
      <Providers>
        <div data-testid="child">Child Component</div>
      </Providers>
    );

    // 子コンポーネントがレンダリングされることを確認
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("React Query Devtoolsが正しくレンダリングされること", () => {
    render(
      <Providers>
        <div data-testid="child">Child Component</div>
      </Providers>
    );

    // React Query Devtoolsがレンダリングされることを確認
    expect(screen.getByTestId("mock-devtools")).toBeInTheDocument();
  });

  it("ReduxのProviderが正しく動作していること", () => {
    // Redux Providerが正しく動作するかテストするための最小限のテスト
    render(
      <Providers>
        <div data-testid="redux-child">Redux Child</div>
      </Providers>
    );

    // Reduxの子コンポーネントがレンダリングされることを確認
    expect(screen.getByTestId("redux-child")).toBeInTheDocument();
  });
});
