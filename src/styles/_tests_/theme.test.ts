import theme from '../theme';
import { Theme } from '@chakra-ui/react';

type ThemeProps = {
  theme: Theme;
  colorMode: 'light' | 'dark';
  colorScheme: string;
  size?: string;
  variant?: string;
  orientation?: string;
};

// Chakra UIのテーマ設定をモック
describe('Chakra UI テーマ設定', () => {
  it('フォントが正しく設定されていること', () => {
    const fonts = theme.fonts;
    expect(fonts.heading).toBe(
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    );
    expect(fonts.body).toBe(
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    );
  });

  it("カラーパレット 'brand' が正しく設定されていること", () => {
    const colors = theme.colors.brand;
    expect(colors[50]).toBe('#f0f9ff');
    expect(colors[100]).toBe('#e0f2fe');
    expect(colors[500]).toBe('#0ea5e9');
    expect(colors[600]).toBe('#0284c7');
    expect(colors[700]).toBe('#0369a1');
  });

  it('Button コンポーネントの基本スタイルが正しく設定されていること', () => {
    const buttonBaseStyle = theme.components.Button.baseStyle;
    expect(buttonBaseStyle.fontWeight).toBe('bold');
  });

  it('Heading コンポーネントのサイズ設定が正しく設定されていること', () => {
    const headingSizes = theme.components.Heading.sizes;
    expect(headingSizes.xl.fontSize).toEqual(['24px', '28px', '32px']);
    expect(headingSizes.lg.lineHeight).toEqual(['28px', '30px', '32px']);
  });

  it('Text コンポーネントの基本スタイルが正しく設定されていること', () => {
    const textBaseStyle = theme.components.Text.baseStyle;
    expect(textBaseStyle.fontSize).toEqual(['14px', '16px']);
    expect(textBaseStyle.lineHeight).toEqual(['20px', '24px']);
  });

  it('横向き時のグローバルスタイルが正しく適用されること', () => {
    const globalStyles = theme.styles.global({ colorMode: 'light' });
    expect(globalStyles.body.bg).toBe('gray.50');
    expect(
      globalStyles['@media (orientation: landscape) and (max-height: 500px)'][
        'html, body'
      ].fontSize,
    ).toBe('0.9em');
  });

  it('ブレークポイントが正しく設定されていること', () => {
    const breakpoints = theme.breakpoints;
    expect(breakpoints.sm).toBe('30em');
    expect(breakpoints.md).toBe('48em');
    expect(breakpoints.lg).toBe('62em');
    expect(breakpoints.xl).toBe('80em');
    expect(breakpoints['2xl']).toBe('96em');
  });

  it('Button コンポーネントのsolidバリアントが正しく設定されていること', () => {
    const buttonVariants = theme.components.Button.variants;
    const mockProps: ThemeProps = {
      colorMode: 'light',
      colorScheme: 'brand',
      theme: theme as Theme,
    };

    const solidStyle = buttonVariants.solid(mockProps);

    expect(solidStyle).toEqual({
      bg: 'brand.500',
      color: 'white',
      _hover: {
        bg: 'brand.600',
        _disabled: {
          bg: 'brand.500',
        },
      },
      _active: {
        bg: 'brand.700',
      },
    });
  });

  it('Button コンポーネントのsolidバリアントが異なるカラースキームで正しく動作すること', () => {
    const buttonVariants = theme.components.Button.variants;
    const mockProps: ThemeProps = {
      colorMode: 'light',
      colorScheme: 'blue',
      theme: theme as Theme,
    };

    const solidStyle = buttonVariants.solid(mockProps);

    expect(solidStyle).toEqual({
      bg: 'blue.500',
      color: 'white',
      _hover: {
        bg: 'blue.600',
        _disabled: {
          bg: 'blue.500',
        },
      },
      _active: {
        bg: 'blue.700',
      },
    });
  });
});
