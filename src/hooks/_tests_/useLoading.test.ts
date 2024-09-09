import { renderHook, act } from "@testing-library/react";
import { useLoading } from "../useLoading";

describe("useLoading フック", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態ではローディング中である", () => {
    const { result } = renderHook(() => useLoading());
    expect(result.current).toBe(true);
  });

  it("デフォルトの遅延時間（2000ms）後にローディングが終了する", () => {
    const { result } = renderHook(() => useLoading());

    act(() => {
      jest.advanceTimersByTime(1999);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it("カスタムの遅延時間を設定できる", () => {
    const customDelay = 3000;
    const { result } = renderHook(() => useLoading(customDelay));

    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });
});
