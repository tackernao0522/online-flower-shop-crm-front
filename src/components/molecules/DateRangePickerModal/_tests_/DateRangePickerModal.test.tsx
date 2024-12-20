import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ChakraProvider,
  theme as chakraTheme,
  UseToastOptions,
} from '@chakra-ui/react';
import * as chakraUI from '@chakra-ui/react';
import DateRangePickerModal from '../DateRangePickerModal';
import '@testing-library/jest-dom';

const customTheme = {
  ...chakraTheme,
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  __breakpoints: {
    keys: ['base', 'sm', 'md', 'lg', 'xl', '2xl'],
    details: {
      base: {
        minMaxQuery: '(min-width: 0em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '0em',
      },
      sm: {
        minMaxQuery: '(min-width: 30em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '30em',
      },
      md: {
        minMaxQuery: '(min-width: 48em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '48em',
      },
      lg: {
        minMaxQuery: '(min-width: 62em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '62em',
      },
      xl: {
        minMaxQuery: '(min-width: 80em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '80em',
      },
      '2xl': {
        minMaxQuery: '(min-width: 96em)',
        maxQuery: '',
        minQuery: '',
        max: '',
        min: '96em',
      },
    },
  },
};

describe('DateRangePickerModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const renderWithChakra = (ui: React.ReactElement) => {
    const mockToast = jest.fn() as jest.Mock & {
      (options?: UseToastOptions): string;
      update: jest.Mock;
      promise: jest.Mock;
      closeAll: jest.Mock;
      close: jest.Mock;
      isActive: jest.Mock;
    };

    Object.assign(mockToast, {
      update: jest.fn(),
      promise: jest.fn(),
      closeAll: jest.fn(),
      close: jest.fn(),
      isActive: jest.fn(),
    });

    const mockedUseToast = jest.spyOn(chakraUI, 'useToast');
    mockedUseToast.mockReturnValue(mockToast);

    const utils = render(
      <ChakraProvider theme={customTheme}>{ui}</ChakraProvider>,
    );

    return {
      ...utils,
      mockToast,
    };
  };

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

  it('空の日付入力が正しく処理される', async () => {
    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    const startDateInput = screen.getByLabelText(/開始日/);

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(startDateInput, { target: { value: '' } });

    expect(startDateInput).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('日付のフォーマットエラーが正しく処理される', async () => {
    const invalidDate = new Date('invalid');

    renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        initialStartDate={invalidDate}
      />,
    );

    const startDateInput = screen.getByLabelText(/開始日/);
    expect(startDateInput).toHaveValue('');
  });

  it('モーダルが開かれるたびに状態がリセットされる', async () => {
    const { rerender } = renderWithChakra(
      <DateRangePickerModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />,
    );

    const startDateInput = screen.getByLabelText(/開始日/);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    expect(startDateInput).toHaveValue('2024-01-01');

    rerender(
      <ChakraProvider theme={customTheme}>
        <DateRangePickerModal
          isOpen={false}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </ChakraProvider>,
    );

    rerender(
      <ChakraProvider theme={customTheme}>
        <DateRangePickerModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </ChakraProvider>,
    );

    await waitFor(() => {
      const newStartDateInput = screen.getByLabelText(/開始日/);
      expect(newStartDateInput).toHaveValue('');
    });
  });
});
