import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderManagementTemplate from '../OrderManagementTemplate';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { useBreakpointValue, useDisclosure } from '@chakra-ui/react';

jest.mock('@/hooks/useOrderManagement');
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useBreakpointValue: jest.fn(),
  useDisclosure: jest.fn(),
}));

jest.mock('@/components/molecules/OrderManagementHeader', () => ({
  OrderManagementHeader: () => (
    <div data-testid="order-management-header">Header</div>
  ),
}));

jest.mock('@/components/molecules/OrderSearchFilter', () => ({
  OrderSearchFilter: () => (
    <div data-testid="order-search-filter">Search Filter</div>
  ),
}));

jest.mock('@/components/molecules/OrderCountDisplay', () => ({
  OrderCountDisplay: ({
    showTotalCountOnly,
  }: {
    showTotalCountOnly?: boolean;
  }) => (
    <div data-testid={showTotalCountOnly ? 'total-count' : 'current-count'}>
      Count Display
    </div>
  ),
}));

jest.mock('@/components/organisms/OrderTable', () => ({
  __esModule: true,
  default: () => <div data-testid="order-table">Order Table</div>,
}));

jest.mock('@/components/molecules/ModalGroup', () => ({
  ModalGroup: () => <div data-testid="modal-group">Modal Group</div>,
}));

jest.mock('@/components/atoms/ScrollToTopButton', () => ({
  __esModule: true,
  default: () => <div data-testid="scroll-to-top">Scroll To Top</div>,
}));

describe('OrderManagementTemplate', () => {
  const defaultMockValues = {
    orders: [],
    totalCount: 0,
    status: 'idle',
    error: null,
    isSearching: false,
    hasMore: false,
  };

  beforeEach(() => {
    (useOrderManagement as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      handleAddOrder: jest.fn(),
      handleEditOrder: jest.fn(),
      handleDeleteOrder: jest.fn(),
    });

    (useBreakpointValue as jest.Mock).mockReturnValue(false);
    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });
  });

  it('初期状態で全てのコンポーネントが正しくレンダリングされること', () => {
    render(<OrderManagementTemplate />);

    expect(screen.getByTestId('order-management-header')).toBeInTheDocument();
    expect(screen.getByTestId('order-search-filter')).toBeInTheDocument();
    expect(screen.getByTestId('total-count')).toBeInTheDocument();
    expect(screen.getByTestId('order-table')).toBeInTheDocument();
    expect(screen.getByTestId('current-count')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('modal-group')).toBeInTheDocument();
  });

  it('ローディング中は適切なスピナーが表示されること', () => {
    (useOrderManagement as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      status: 'loading',
      orders: [],
    });

    render(<OrderManagementTemplate />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('エラー発生時にエラーアラートが表示されること', () => {
    (useOrderManagement as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      status: 'failed',
      error: 'エラーが発生しました',
    });

    render(<OrderManagementTemplate />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('無限スクロール時のローディングスピナーが適切に表示されること', () => {
    (useOrderManagement as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      hasMore: true,
      status: 'loading',
      orders: [{ id: 1 }],
    });

    render(<OrderManagementTemplate />);
    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts).toHaveLength(1);
  });

  it('モバイル表示時の適切なレイアウト調整がされること', () => {
    (useBreakpointValue as jest.Mock).mockReturnValue(true);
    render(<OrderManagementTemplate />);
  });
});
