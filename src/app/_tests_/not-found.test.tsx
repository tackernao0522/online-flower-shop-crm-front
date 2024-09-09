import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "../not-found";
import { ChakraProvider } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

// useRouterのモックを作成
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NotFound コンポーネント", () => {
  // テストの準備としてuseRouterをモックします
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it("404 テキストが正しく表示されること", () => {
    renderWithChakra(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
    expect(
      screen.getByText(
        "お探しのページは存在しないか、移動した可能性があります。"
      )
    ).toBeInTheDocument();
  });

  it("ホームに戻るボタンが表示され、クリックすると '/' に遷移すること", () => {
    renderWithChakra(<NotFound />);
    const button = screen.getByText("ホームに戻る");
    expect(button).toBeInTheDocument();

    // ボタンクリックをシミュレーション
    fireEvent.click(button);

    // router.push('/') が呼ばれることを確認
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});
