import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { OrderManagementHeader } from '../OrderManagementHeader';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('OrderManagementHeader', () => {
  const mockOnAddOrder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが正しく表示される', () => {
    renderWithChakra(<OrderManagementHeader onAddOrder={mockOnAddOrder} />);
    expect(screen.getByText('注文管理')).toBeInTheDocument();
  });

  it('新規注文作成ボタンが表示され、クリックで正しく動作する', () => {
    renderWithChakra(<OrderManagementHeader onAddOrder={mockOnAddOrder} />);

    const addButton = screen.getByRole('button', { name: '新規注文作成' });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(mockOnAddOrder).toHaveBeenCalledTimes(1);
  });

  it('ダッシュボードへ戻るボタンが表示される', () => {
    renderWithChakra(<OrderManagementHeader onAddOrder={mockOnAddOrder} />);
    expect(
      screen.getByRole('button', { name: 'ダッシュボードへ戻る' }),
    ).toBeInTheDocument();
  });

  it('新規注文作成ボタンにアイコンが表示される', () => {
    renderWithChakra(<OrderManagementHeader onAddOrder={mockOnAddOrder} />);
    const addButton = screen.getByRole('button', { name: '新規注文作成' });
    const icon = addButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('モバイル表示時にボタンがスタック表示される', () => {
    renderWithChakra(<OrderManagementHeader onAddOrder={mockOnAddOrder} />);
    const buttonsContainer = screen
      .getByRole('button', { name: '新規注文作成' })
      .closest('div');
    expect(buttonsContainer).toHaveStyle({ flexDirection: 'column' });
  });
});
