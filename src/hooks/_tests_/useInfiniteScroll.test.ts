import { renderHook } from "@testing-library/react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

describe("useInfiniteScroll", () => {
  let mockLoadMore: jest.Mock;
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

  beforeEach(() => {
    mockLoadMore = jest.fn();
    observeMock = jest.fn();
    disconnectMock = jest.fn();

    // IntersectionObserverをモックしてコールバックをキャプチャ
    (window as any).IntersectionObserver = jest.fn((callback) => {
      intersectionCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("要素がスクロールしてビューに入るとloadMoreが呼び出される", () => {
    const { result } = renderHook(() => useInfiniteScroll(mockLoadMore));

    // モック要素を作成
    const mockNode = document.createElement("div");

    // lastElementRef にノードを渡す
    result.current.lastElementRef(mockNode);

    // IntersectionObserver の observe が呼び出されたことを確認
    expect(observeMock).toHaveBeenCalledWith(mockNode);

    // モックで entries が isIntersecting = true を返す
    intersectionCallback([
      { isIntersecting: true },
    ] as IntersectionObserverEntry[]);

    // loadMore が呼び出されたことを確認
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it("要素がスクロールしてビューに入らない場合はloadMoreが呼び出されない", () => {
    const { result } = renderHook(() => useInfiniteScroll(mockLoadMore));

    // モック要素を作成
    const mockNode = document.createElement("div");

    // lastElementRef にノードを渡す
    result.current.lastElementRef(mockNode);

    // モックで entries が isIntersecting = false を返す
    intersectionCallback([
      { isIntersecting: false },
    ] as IntersectionObserverEntry[]);

    // loadMore が呼び出されていないことを確認
    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  it("新しい要素が渡されると、前の IntersectionObserver が解除される", () => {
    const { result } = renderHook(() => useInfiniteScroll(mockLoadMore));

    // 最初の要素を作成
    const firstMockNode = document.createElement("div");

    // lastElementRef に最初のノードを渡す
    result.current.lastElementRef(firstMockNode);

    // 次の要素を作成
    const secondMockNode = document.createElement("div");

    // lastElementRef に次のノードを渡す
    result.current.lastElementRef(secondMockNode);

    // 最初の observer が解除され、次の observer がセットされることを確認
    expect(disconnectMock).toHaveBeenCalled();
    expect(observeMock).toHaveBeenCalledWith(secondMockNode);
  });
});
