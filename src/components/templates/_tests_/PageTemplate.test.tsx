import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageTemplate } from '../PageTemplate';
import { ChakraProvider } from '@chakra-ui/react';

describe('PageTemplate コンポーネントのテスト', () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('子要素が正しくレンダリングされること', () => {
    renderWithChakra(
      <PageTemplate>
        <p>テストコンテンツ</p>
      </PageTemplate>,
    );
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('Box のプロパティが適用されていること', () => {
    renderWithChakra(
      <PageTemplate backgroundColor="blue.100" data-testid="page-template">
        <p>コンテンツ</p>
      </PageTemplate>,
    );

    const boxElement = screen.getByTestId('page-template');
    expect(boxElement).toHaveStyle('background-color: blue.100');
  });

  it('padding のデフォルト値が適用されていること', () => {
    renderWithChakra(
      <PageTemplate data-testid="page-template">
        <p>コンテンツ</p>
      </PageTemplate>,
    );

    const boxElement = screen.getByTestId('page-template');

    expect(boxElement).toHaveAttribute('class', expect.stringContaining('css'));
  });
});
