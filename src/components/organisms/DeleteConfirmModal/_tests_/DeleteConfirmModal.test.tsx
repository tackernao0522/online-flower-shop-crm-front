import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: '注文の削除',
  targetName: '注文番号: ORD-2024-001',
};

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('DeleteConfirmModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが開いている時、指定されたタイトルが表示される', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('注文の削除')).toBeInTheDocument();
  });

  it('削除対象の名前が正しく表示される', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText(/注文番号: ORD-2024-001/)).toBeInTheDocument();
  });

  it('警告メッセージが表示される', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('この操作は取り消せません。')).toBeInTheDocument();
  });

  it('削除ボタンをクリックするとonConfirmが呼ばれる', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('削除'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('キャンセル'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('モーダルが閉じている時、コンテンツが表示されない', () => {
    renderWithChakra(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('注文の削除')).not.toBeInTheDocument();
  });
});
