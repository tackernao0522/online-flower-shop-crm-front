import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalGroup } from '../ModalGroup';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock(
  '@/components/molecules/DateRangePickerModal/DateRangePickerModal',
  () => ({
    __esModule: true,
    default: ({
      isOpen,
      onApply,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onApply: (start: Date | null, end: Date | null) => void;
    }) =>
      isOpen ? (
        <div data-testid="date-range-picker-modal">
          <button
            onClick={() =>
              onApply(new Date('2024-01-01'), new Date('2024-01-31'))
            }
            data-testid="apply-button">
            Apply
          </button>
        </div>
      ) : null,
  }),
);

jest.mock('@/components/organisms/OrderModal/OrderModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="order-modal">Order Modal</div> : null,
}));

jest.mock(
  '@/components/organisms/DeleteConfirmModal/DeleteConfirmModal',
  () => ({
    __esModule: true,
    default: ({
      isOpen,
      onConfirm,
    }: {
      isOpen: boolean;
      onConfirm: () => void;
    }) =>
      isOpen ? (
        <div data-testid="delete-confirm-modal" onClick={onConfirm}>
          Delete Confirm Modal
        </div>
      ) : null,
  }),
);

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ModalGroup', () => {
  const mockProps = {
    isOpen: false,
    onClose: jest.fn(),
    isDeleteAlertOpen: false,
    isMobile: false,
    modalSize: 'md',
    modalMode: 'detail' as const,
    activeOrder: null,
    newOrder: null,
    formErrors: {},
    statusColorScheme: {},
    statusDisplayText: {},
    handleInputChange: jest.fn(),
    handleOrderItemChange: jest.fn(),
    handleAddOrderItem: jest.fn(),
    handleRemoveOrderItem: jest.fn(),
    handleSubmit: jest.fn(),
    cancelDelete: jest.fn(),
    confirmDelete: jest.fn(),
    orderToDelete: { orderNumber: 'TEST-001' },
    isDatePickerOpen: false,
    onDatePickerClose: jest.fn(),
    handleDateRangeFilter: jest.fn(),
    dateRange: {
      start: null,
      end: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OrderModalが適切な状態で表示されること', () => {
    renderWithChakra(<ModalGroup {...mockProps} isOpen={true} />);
    expect(screen.getByTestId('order-modal')).toBeInTheDocument();
  });

  it('DeleteConfirmModalが適切な状態で表示されること', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDeleteAlertOpen={true} />);
    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
  });

  it('DateRangePickerModalが適切な状態で表示されること', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDatePickerOpen={true} />);
    expect(screen.getByTestId('date-range-picker-modal')).toBeInTheDocument();
  });

  it('削除確認モーダルでconfirmDelete関数が呼ばれること', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDeleteAlertOpen={true} />);
    fireEvent.click(screen.getByTestId('delete-confirm-modal'));
    expect(mockProps.confirmDelete).toHaveBeenCalled();
  });

  it('OrderModalが非表示の場合にレンダリングされないこと', () => {
    renderWithChakra(<ModalGroup {...mockProps} isOpen={false} />);
    expect(screen.queryByTestId('order-modal')).not.toBeInTheDocument();
  });

  it('DeleteConfirmModalが非表示の場合にレンダリングされないこと', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDeleteAlertOpen={false} />);
    expect(
      screen.queryByTestId('delete-confirm-modal'),
    ).not.toBeInTheDocument();
  });

  it('DateRangePickerModalが非表示の場合にレンダリングされないこと', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDatePickerOpen={false} />);
    expect(
      screen.queryByTestId('date-range-picker-modal'),
    ).not.toBeInTheDocument();
  });

  it('DateRangePickerModalでカスタム日付が選択された際に適切な関数が呼ばれること', () => {
    renderWithChakra(<ModalGroup {...mockProps} isDatePickerOpen={true} />);

    fireEvent.click(screen.getByTestId('apply-button'));

    expect(mockProps.handleDateRangeFilter).toHaveBeenCalledWith(
      'custom',
      new Date('2024-01-01'),
      new Date('2024-01-31'),
    );
    expect(mockProps.onDatePickerClose).toHaveBeenCalled();
  });
});
