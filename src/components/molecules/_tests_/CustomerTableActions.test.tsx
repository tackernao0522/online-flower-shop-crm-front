import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CustomerTableActions from '../../molecules/CustomerTableActions';
import { Customer } from '@/types/customer';

describe('CustomerTableActions', () => {
  const mockCustomer: Customer = {
    id: '1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    phoneNumber: '090-1234-5678',
    address: '東京都千代田区1-2-3',
    birthDate: '1990-01-01',
    created_at: '2023-01-01',
    updated_at: '2023-01-02',
    purchaseHistory: [],
    notes: 'これはテスト用のメモです',
  };

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('モバイル表示で編集と削除アイコンボタンが表示される', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { getByLabelText } = renderWithChakra(
      <CustomerTableActions
        customer={mockCustomer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isMobile={true}
      />,
    );

    const editButton = getByLabelText('Edit customer');
    expect(editButton).toBeInTheDocument();

    const deleteButton = getByLabelText('Delete customer');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCustomer);

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockCustomer);
  });

  it('デスクトップ表示で編集と削除ボタンが表示される', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { getByText } = renderWithChakra(
      <CustomerTableActions
        customer={mockCustomer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isMobile={false}
      />,
    );

    const editButton = getByText('編集');
    expect(editButton).toBeInTheDocument();

    const deleteButton = getByText('削除');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCustomer);

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockCustomer);
  });
});
