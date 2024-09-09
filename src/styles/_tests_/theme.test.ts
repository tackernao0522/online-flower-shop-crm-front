import theme from "../theme";
import { extendTheme, ThemeOverride } from "@chakra-ui/react";

// Chakra UIのテーマ設定をモック
describe("Chakra UI テーマ設定", () => {
  it("フォントが正しく設定されていること", () => {
    const fonts = theme.fonts;
    expect(fonts.heading).toBe(
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
    );
    expect(fonts.body).toBe(
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
    );
  });

  it("カラーパレット 'brand' が正しく設定されていること", () => {
    const colors = theme.colors.brand;
    expect(colors[50]).toBe("#f0f9ff");
    expect(colors[100]).toBe("#e0f2fe");
    expect(colors[500]).toBe("#0ea5e9");
    expect(colors[600]).toBe("#0284c7");
    expect(colors[700]).toBe("#0369a1");
  });

  it("Button コンポーネントの基本スタイルが正しく設定されていること", () => {
    const buttonBaseStyle = theme.components.Button.baseStyle;
    expect(buttonBaseStyle.fontWeight).toBe("bold");
  });

  it("Heading コンポーネントのサイズ設定が正しく設定されていること", () => {
    const headingSizes = theme.components.Heading.sizes;
    expect(headingSizes.xl.fontSize).toEqual(["24px", "28px", "32px"]);
    expect(headingSizes.lg.lineHeight).toEqual(["28px", "30px", "32px"]);
  });

  it("Text コンポーネントの基本スタイルが正しく設定されていること", () => {
    const textBaseStyle = theme.components.Text.baseStyle;
    expect(textBaseStyle.fontSize).toEqual(["14px", "16px"]);
    expect(textBaseStyle.lineHeight).toEqual(["20px", "24px"]);
  });

  it("横向き時のグローバルスタイルが正しく適用されること", () => {
    const globalStyles = theme.styles.global({ colorMode: "light" });
    expect(globalStyles.body.bg).toBe("gray.50");
    expect(
      globalStyles["@media (orientation: landscape) and (max-height: 500px)"][
        "html, body"
      ].fontSize
    ).toBe("0.9em");
  });

  it("ブレークポイントが正しく設定されていること", () => {
    const breakpoints = theme.breakpoints;
    expect(breakpoints.sm).toBe("30em");
    expect(breakpoints.md).toBe("48em");
    expect(breakpoints.landscape.raw).toBe(
      "(orientation: landscape) and (max-height: 500px)"
    );
  });
});
