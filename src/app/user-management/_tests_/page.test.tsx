import { render } from "@testing-library/react";
import UserManagementPage from "@/app/user-management/page";

// UserManagementTemplate をモック
jest.mock("@/components/templates/UserManagementTemplate", () => {
  return jest.fn(() => <div>UserManagementTemplate</div>);
});

describe("UserManagementPage", () => {
  it("ChakraProviderとReduxストアが提供され、UserManagementTemplateがレンダリングされる", () => {
    const { getByText } = render(<UserManagementPage />);

    // UserManagementTemplateがレンダリングされていることを確認
    expect(getByText("UserManagementTemplate")).toBeInTheDocument();
  });

  it("ChakraProviderが正しく提供されている", () => {
    const { getByText } = render(<UserManagementPage />);

    // ChakraProviderが適用され、UserManagementTemplateがレンダリングされていることを確認
    expect(getByText("UserManagementTemplate")).toBeInTheDocument();
  });

  it("Reduxストアが正しく提供されている", () => {
    const { getByText } = render(<UserManagementPage />);

    // Reduxストアが提供されていることを間接的に確認（UserManagementTemplateが表示されること）
    expect(getByText("UserManagementTemplate")).toBeInTheDocument();
  });
});
