import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, Button } from '@chakra-ui/react';
import { useMediaQuery } from '@chakra-ui/react';
import PageHeader from '../PageHeader';

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: jest.fn(),
}));

describe('PageHeader コンポーネント', () => {
  it('タイトルが正しく表示される', () => {
    render(
      <ChakraProvider>
        <PageHeader title="テストタイトル" />
      </ChakraProvider>,
    );

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
  });

  it('ボタンが正しく表示される', () => {
    render(
      <ChakraProvider>
        <PageHeader
          title="テストタイトル"
          buttons={
            <>
              <Button>ボタン1</Button>
              <Button>ボタン2</Button>
            </>
          }
        />
      </ChakraProvider>,
    );

    expect(screen.getByText('ボタン1')).toBeInTheDocument();
    expect(screen.getByText('ボタン2')).toBeInTheDocument();
  });

  it('mobileStack=true の場合、モバイルでスタック表示になる', () => {
    (useMediaQuery as jest.Mock).mockReturnValue([true]);

    const { container } = render(
      <ChakraProvider>
        <PageHeader
          title="テストタイトル"
          buttons={<Button>テストボタン</Button>}
          mobileStack={true}
        />
      </ChakraProvider>,
    );

    const headerContainer = container.firstChild as HTMLElement;
    expect(headerContainer).toHaveStyle('flex-direction: column');
  });

  it('mobileStack=false の場合、モバイルでも横並び表示になる', () => {
    const { container } = render(
      <ChakraProvider>
        <PageHeader
          title="テストタイトル"
          buttons={<Button>テストボタン</Button>}
          mobileStack={false}
        />
      </ChakraProvider>,
    );

    const headerContainer = container.firstChild as HTMLElement;
    expect(headerContainer).toHaveStyle('flex-direction: row');
  });

  it('カスタムのspacingとtitleSizeが適用される', () => {
    const { container } = render(
      <ChakraProvider>
        <PageHeader title="テストタイトル" spacing={8} titleSize="2xl" />
      </ChakraProvider>,
    );

    const headerContainer = container.firstChild as HTMLElement;
    const heading = screen.getByRole('heading');

    expect(headerContainer).toHaveStyle({
      marginBottom: 'var(--chakra-space-8)',
    });
    expect(heading).toHaveAttribute(
      'class',
      expect.stringContaining('chakra-heading'),
    );
  });

  it('追加のFlexPropsが正しく適用される', () => {
    const { container } = render(
      <ChakraProvider>
        <PageHeader title="テストタイトル" bg="gray.100" p={4} />
      </ChakraProvider>,
    );

    const headerContainer = container.firstChild as HTMLElement;
    expect(headerContainer).toHaveStyle({
      backgroundColor: 'var(--chakra-colors-gray-100)',
      padding: 'var(--chakra-space-4)',
    });
  });
});
