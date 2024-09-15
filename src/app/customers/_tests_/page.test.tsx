import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerManagementPage from "../../customers/page";

// ReduxのProviderをモックするために必要な設定
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
  useSelector: () => jest.fn(),
}));

// ChakraProviderのモック
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  ChakraProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// CustomerManagementTemplateコンポーネントのモック
jest.mock("@/components/templates/CustomerManagementTemplate", () => {
  const MockCustomerManagementTemplate = () => (
    <div>Customer Management Template</div>
  );
  MockCustomerManagementTemplate.displayName = "MockCustomerManagementTemplate";
  return MockCustomerManagementTemplate;
});

describe("CustomerManagementPage", () => {
  it("ページが正常にレンダリングされる", () => {
    const { getByText } = render(<CustomerManagementPage />);

    // "Customer Management Template"が表示されることを確認
    expect(getByText("Customer Management Template")).toBeInTheDocument();
  });
});
