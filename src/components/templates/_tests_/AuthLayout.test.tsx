import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AuthLayout from '../AuthLayout';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('AuthLayout', () => {
  it('タイトルと子要素が正しくレンダリングされること', () => {
    renderWithChakra(
      <AuthLayout title="テストタイトル">
        <div data-testid="child-element">子要素</div>
      </AuthLayout>,
    );

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('背景色が正しく適用されていること', () => {
    renderWithChakra(
      <AuthLayout title="背景色テスト">
        <div>コンテンツ</div>
      </AuthLayout>,
    );

    const flexContainer = screen
      .getByText('背景色テスト')
      .closest('div')?.parentElement;
    expect(flexContainer).toHaveStyle(
      'background-color: var(--chakra-colors-gray-50)',
    );
  });

  it('ボックスシャドウが適用されていること', () => {
    renderWithChakra(
      <AuthLayout title="シャドウテスト">
        <div>コンテンツ</div>
      </AuthLayout>,
    );

    const boxElement = screen.getByText('シャドウテスト').closest('div');
    expect(boxElement).toHaveStyle('box-shadow: var(--chakra-shadows-lg)');
  });

  it('isLoading が true のとき Skeleton が表示され、タイトルが表示されないこと', () => {
    renderWithChakra(
      <AuthLayout title="ロード中テスト" isLoading={true}>
        <div>子要素</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId('authlayout-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('ロード中テスト')).toBeNull();
  });
});
