import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { OrderSearchFilter } from '../OrderSearchFilter';
import '@testing-library/jest-dom';
import { OrderStatus } from '@/types/order';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

const convertKeysToExpectedFormat = <T,>(
  obj: Record<string, T>,
): Record<OrderStatus, T> => {
  const formattedObj: Partial<Record<OrderStatus, T>> = {};
  Object.keys(obj).forEach(key => {
    formattedObj[key.toUpperCase() as OrderStatus] = obj[key];
  });
  return formattedObj as Record<OrderStatus, T>;
};

const rawStatusColorScheme = {
  pending: 'blue',
  processing: 'yellow',
  confirmed: 'teal',
  shipped: 'purple',
  completed: 'green',
  canceled: 'red',
};

const rawStatusDisplayText = {
  pending: '保留中',
  processing: '処理中',
  confirmed: '確認済み',
  shipped: '発送済み',
  completed: '完了',
  canceled: 'キャンセル',
};

const statusColorScheme = convertKeysToExpectedFormat(rawStatusColorScheme);
const statusDisplayText = convertKeysToExpectedFormat(rawStatusDisplayText);

describe('OrderSearchFilter', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnSearchSubmit = jest.fn();
  const mockOnSearchKeyDown = jest.fn();
  const mockOnStatusFilter = jest.fn();
  const mockOnDateRangeFilter = jest.fn();
  const mockOnDatePickerOpen = jest.fn();
  const mockClearFilters = jest.fn();

  const setup = () => {
    renderWithChakra(
      <OrderSearchFilter
        searchTerm=""
        dateRange={{ start: null, end: null }}
        isSearching={false}
        status="idle"
        statusColorScheme={statusColorScheme}
        statusDisplayText={statusDisplayText}
        onSearchChange={mockOnSearchChange}
        onSearchSubmit={mockOnSearchSubmit}
        onSearchKeyDown={mockOnSearchKeyDown}
        onStatusFilter={mockOnStatusFilter}
        onDateRangeFilter={mockOnDateRangeFilter}
        onDatePickerOpen={mockOnDatePickerOpen}
        clearFilters={mockClearFilters}
      />,
    );
  };

  it('検索バーが正しく表示される', () => {
    setup();
    expect(
      screen.getByPlaceholderText('注文番号、顧客名で検索...'),
    ).toBeInTheDocument();
  });

  it('検索ボタンをクリックすると、onSearchSubmit が呼び出される', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: '検索' }));
    expect(mockOnSearchSubmit).toHaveBeenCalled();
  });

  it('検索バーの入力変更で onSearchChange が呼び出される', () => {
    setup();
    const searchInput =
      screen.getByPlaceholderText('注文番号、顧客名で検索...');
    fireEvent.change(searchInput, { target: { value: 'テスト検索' } });
    expect(mockOnSearchChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('ステータスメニューのアイテムをクリックすると、onStatusFilter が呼び出される', () => {
    setup();
    fireEvent.click(screen.getByText('ステータス'));
    fireEvent.click(screen.getByText('保留中'));
    expect(mockOnStatusFilter).toHaveBeenCalledWith('PENDING');
  });

  it('日付範囲メニューの「本日」をクリックすると、onDateRangeFilter が呼び出される', () => {
    setup();
    fireEvent.click(screen.getByText('期間'));
    fireEvent.click(screen.getByText('本日'));
    expect(mockOnDateRangeFilter).toHaveBeenCalledWith('today');
  });

  it('日付ピッカーを開くボタンをクリックすると、onDatePickerOpen が呼び出される', () => {
    setup();
    fireEvent.click(screen.getByText('期間'));
    fireEvent.click(screen.getByText('期間を指定...'));
    expect(mockOnDatePickerOpen).toHaveBeenCalled();
  });

  it('フィルタをクリアすると、clearFilters が呼び出される', () => {
    setup();
    fireEvent.click(screen.getByText('ステータス'));
    fireEvent.click(screen.getByText('フィルタをクリア'));
    expect(mockClearFilters).toHaveBeenCalled();
  });

  it('指定された日付範囲が表示される', () => {
    renderWithChakra(
      <OrderSearchFilter
        searchTerm=""
        dateRange={{
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        }}
        isSearching={false}
        status="idle"
        statusColorScheme={statusColorScheme}
        statusDisplayText={statusDisplayText}
        onSearchChange={mockOnSearchChange}
        onSearchSubmit={mockOnSearchSubmit}
        onSearchKeyDown={mockOnSearchKeyDown}
        onStatusFilter={mockOnStatusFilter}
        onDateRangeFilter={mockOnDateRangeFilter}
        onDatePickerOpen={mockOnDatePickerOpen}
        clearFilters={mockClearFilters}
      />,
    );

    expect(
      screen.getByText('期間: 2024/01/01 - 2024/01/31'),
    ).toBeInTheDocument();
  });
});
