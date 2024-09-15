import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScrollToTopButton from "../../atoms/ScrollToTopButton";

// window.scrollToをモック
const scrollToMock = jest.fn();
Object.defineProperty(window, "scrollTo", { value: scrollToMock });

describe("ScrollToTopButton", () => {
  it("ボタンが正常にレンダリングされる", () => {
    const { getByRole } = render(<ScrollToTopButton />);
    const button = getByRole("button", { name: "トップに戻る" });

    // ボタンが正しくレンダリングされていることを確認
    expect(button).toBeInTheDocument();
  });

  it("クリック時にトップにスクロールする", () => {
    const { getByRole } = render(<ScrollToTopButton />);
    const button = getByRole("button", { name: "トップに戻る" });

    // ボタンをクリック
    fireEvent.click(button);

    // scrollToが呼び出されているか確認
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
