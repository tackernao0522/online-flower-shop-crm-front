import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CustomerSearchForm from '../CustomerSearchForm';

describe('CustomerSearchForm', () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('検索入力フィールドに値を入力できる', () => {
    const mockSetSearchTerm = jest.fn();
    const { getByPlaceholderText } = renderWithChakra(
      <CustomerSearchForm
        searchTerm="山田"
        setSearchTerm={mockSetSearchTerm}
        onSearch={() => {}}
        onKeyDown={() => {}}
      />,
    );
    const input = getByPlaceholderText('顧客名または電話番号( - は除く)');

    // 入力値が反映されているか確認
    expect(input).toHaveValue('山田');

    // 値を変更した時にsetSearchTermが呼ばれることを確認
    fireEvent.change(input, { target: { value: '田中' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('田中');
  });

  it('検索ボタンのクリックでonSearchが呼び出される', () => {
    const mockOnSearch = jest.fn();
    const searchTerm = '山田';
    const { getByText } = renderWithChakra(
      <CustomerSearchForm
        searchTerm={searchTerm}
        setSearchTerm={() => {}}
        onSearch={mockOnSearch}
        onKeyDown={() => {}}
      />,
    );

    const button = getByText('検索');

    // 検索ボタンをクリック
    fireEvent.click(button);

    // 現在のsearchTermでonSearchが呼び出されたか確認
    expect(mockOnSearch).toHaveBeenCalledWith(searchTerm);
  });

  it('Enterキー押下でonSearchが呼び出される', () => {
    const mockOnSearch = jest.fn();
    const searchTerm = '山田';
    const { getByPlaceholderText } = renderWithChakra(
      <CustomerSearchForm
        searchTerm={searchTerm}
        setSearchTerm={() => {}}
        onSearch={mockOnSearch}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            mockOnSearch(searchTerm);
          }
        }}
      />,
    );

    const input = getByPlaceholderText('顧客名または電話番号( - は除く)');

    // Enterキーを押下
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // 現在のsearchTermでonSearchが呼び出されたか確認
    expect(mockOnSearch).toHaveBeenCalledWith(searchTerm);
  });
});
