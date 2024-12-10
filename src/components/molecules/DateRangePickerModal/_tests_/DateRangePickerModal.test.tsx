import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DateRangePickerModal from '../DateRangePickerModal';
import '@testing-library/jest-dom';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('DateRangePickerModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが正しく開閉される', async () => {
    const { rerender } = renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    rerender(
      <DateRangePickerModal
        isOpen={false}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('正しい日付入力が可能', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/開始日/);
    const endDateInput = screen.getByLabelText(/終了日/);

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    expect(startDateInput).toHaveValue('2024-01-01');
    expect(endDateInput).toHaveValue('2024-01-31');
  });

  it('初期値が正しく設定される', async () => {
    const initialStartDate = new Date('2024-01-01');
    const initialEndDate = new Date('2024-01-31');

    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/開始日/);
    const endDateInput = screen.getByLabelText(/終了日/);

    expect(startDateInput).toHaveValue('2024-01-01');
    expect(endDateInput).toHaveValue('2024-01-31');
  });

  it('不正な日付入力時にエラーが表示される', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/開始日/);
    const endDateInput = screen.getByLabelText(/終了日/);

    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '開始日は終了日より前の日付を選択してください',
      );
    });
  });

  it('適用ボタンが正しく動作する', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/開始日/);
    const endDateInput = screen.getByLabelText(/終了日/);
    const applyButton = screen.getByRole('button', { name: '適用' });

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(applyButton).not.toBeDisabled();
    });

    fireEvent.click(applyButton);
    expect(mockOnApply).toHaveBeenCalledWith(
      new Date('2024-01-01T00:00:00.000Z'),
      new Date('2024-01-31T23:59:59.999Z'),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('キャンセルボタンが正しく動作する', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('日付未入力時は適用ボタンが無効化される', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const applyButton = screen.getByRole('button', { name: '適用' });
    expect(applyButton).toBeDisabled();
  });
});
