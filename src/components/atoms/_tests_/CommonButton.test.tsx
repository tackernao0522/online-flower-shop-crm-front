import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import CommonButton from '../CommonButton';
import { AddIcon } from '@chakra-ui/icons';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
);

describe('CommonButtonコンポーネント', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  it('正しいテキストでボタンがレンダリングされる', () => {
    renderWithProvider(<CommonButton>Click me</CommonButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('クリックイベントが正しく発火する', () => {
    const handleClick = jest.fn();
    renderWithProvider(
      <CommonButton onClick={handleClick}>Click me</CommonButton>,
    );

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('アイコン付きボタンが正しくレンダリングされる', () => {
    renderWithProvider(
      <CommonButton withIcon={<AddIcon data-testid="add-icon" />}>
        Add Item
      </CommonButton>,
    );

    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('各バリアントが正しく適用される', () => {
    const variants = [
      'primary',
      'secondary',
      'danger',
      'ghost',
      'success',
      'outline',
    ] as const;

    variants.forEach(variant => {
      const { rerender } = renderWithProvider(
        <CommonButton variant={variant} data-testid={`button-${variant}`}>
          {variant} button
        </CommonButton>,
      );

      expect(screen.getByTestId(`button-${variant}`)).toBeInTheDocument();
      rerender(<ChakraProvider theme={theme} />);
    });
  });

  it('サイズプロパティが正しく適用される', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const { rerender } = renderWithProvider(
        <CommonButton size={size} data-testid={`button-${size}`}>
          {size} button
        </CommonButton>,
      );

      expect(screen.getByTestId(`button-${size}`)).toBeInTheDocument();
      rerender(<ChakraProvider theme={theme} />);
    });
  });

  it('無効化状態が正しく適用される', () => {
    renderWithProvider(
      <CommonButton isDisabled data-testid="disabled-button">
        Disabled Button
      </CommonButton>,
    );

    const button = screen.getByTestId('disabled-button');
    expect(button).toBeDisabled();
  });

  it('アイコンの位置が正しく設定される', () => {
    renderWithProvider(
      <CommonButton
        withIcon={<AddIcon data-testid="add-icon" />}
        iconPosition="right">
        Icon Right
      </CommonButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Icon Right');
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });
});
