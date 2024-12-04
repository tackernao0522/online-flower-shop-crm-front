import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTable from '../OrderTable';
import { ChakraProvider } from '@chakra-ui/react';
import { Order, OrderStatus, OrderItem } from '@/types/order';
import { Customer } from '@/types/customer';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('OrderTable', () => {
  const mockCustomer1: Customer = {
    id: '1',
    name: 'テスト顧客1',
    email: 'test1@example.com',
    phoneNumber: '090-1111-1111',
    address: '東京都渋谷区1-1-1',
    birthDate: '1990-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockCustomer2: Customer = {
    id: '2',
    name: 'テスト顧客2',
    email: 'test2@example.com',
    phoneNumber: '090-2222-2222',
    address: '東京都渋谷区2-2-2',
    birthDate: '1990-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockOrderItems: OrderItem[] = [
    {
      id: '1',
      orderId: '1',
      productId: '1',
      quantity: 1,
      unitPrice: 1000,
      product: {
        id: '1',
        name: 'テスト商品1',
        price: 1000,
        description: 'テスト商品1の説明',
        category: 'テストカテゴリー1',
        stockQuantity: 10,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: undefined,
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null,
    },
  ];

  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      orderDate: '2024-03-01',
      totalAmount: 10000,
      status: 'PENDING',
      discountApplied: 0,
      customerId: '1',
      userId: '1',
      campaignId: null,
      customer: mockCustomer1,
      order_items: mockOrderItems,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null,
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      orderDate: '2024-03-02',
      totalAmount: 20000,
      status: 'DELIVERED',
      discountApplied: 0,
      customerId: '2',
      userId: '1',
      campaignId: null,
      customer: mockCustomer2,
      order_items: mockOrderItems,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null,
    },
  ];

  const mockStatusColorScheme: Record<OrderStatus, string> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    CONFIRMED: 'purple',
    SHIPPED: 'cyan',
    DELIVERED: 'green',
    CANCELLED: 'red',
  };

  const mockStatusDisplayText: Record<OrderStatus, string> = {
    PENDING: '保留中',
    PROCESSING: '処理中',
    CONFIRMED: '確認済',
    SHIPPED: '発送済',
    DELIVERED: '配達完了',
    CANCELLED: 'キャンセル済',
  };

  const mockProps = {
    orders: mockOrders,
    statusColorScheme: mockStatusColorScheme,
    statusDisplayText: mockStatusDisplayText,
    isMobile: false,
    lastElementRef: jest.fn(),
    handleOrderClick: jest.fn(),
    handleEditOrder: jest.fn(),
    handleDeleteOrder: jest.fn(),
    formatDate: (date: string) => date,
  };

  it('テーブルヘッダーが正しく表示されること', () => {
    renderWithChakra(<OrderTable {...mockProps} />);

    expect(screen.getByText('注文番号')).toBeInTheDocument();
    expect(screen.getByText('顧客名')).toBeInTheDocument();
    expect(screen.getByText('注文日')).toBeInTheDocument();
    expect(screen.getByText('合計金額')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
  });

  it('注文データが正しくレンダリングされること', () => {
    renderWithChakra(<OrderTable {...mockProps} />);

    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('テスト顧客1')).toBeInTheDocument();
    expect(screen.getByText('2024-03-01')).toBeInTheDocument();
    expect(screen.getByText('¥10,000')).toBeInTheDocument();
    expect(screen.getByText('保留中')).toBeInTheDocument();
  });

  it('PC表示時にボタンが正しく表示されること', () => {
    renderWithChakra(<OrderTable {...mockProps} />);

    expect(screen.getAllByText('詳細')).toHaveLength(2);
    expect(screen.getAllByText('編集')).toHaveLength(2);
    expect(screen.getAllByText('削除')).toHaveLength(2);
  });

  it('モバイル表示時にアイコンボタンが表示されること', () => {
    renderWithChakra(<OrderTable {...{ ...mockProps, isMobile: true }} />);

    expect(screen.getAllByLabelText('詳細を表示')).toHaveLength(2);
    expect(screen.getAllByLabelText('注文を編集')).toHaveLength(2);
    expect(screen.getAllByLabelText('注文を削除')).toHaveLength(2);
  });

  it('配達完了の注文は編集と削除が無効化されること', () => {
    renderWithChakra(<OrderTable {...mockProps} />);

    const editButtons = screen.getAllByText('編集');
    const deleteButtons = screen.getAllByText('削除');

    expect(editButtons[1]).toBeDisabled();
    expect(deleteButtons[1]).toBeDisabled();
  });

  it('ボタンクリック時にハンドラーが呼び出されること', () => {
    renderWithChakra(<OrderTable {...mockProps} />);

    fireEvent.click(screen.getAllByText('詳細')[0]);
    expect(mockProps.handleOrderClick).toHaveBeenCalledWith(mockOrders[0]);

    fireEvent.click(screen.getAllByText('編集')[0]);
    expect(mockProps.handleEditOrder).toHaveBeenCalledWith(mockOrders[0]);

    fireEvent.click(screen.getAllByText('削除')[0]);
    expect(mockProps.handleDeleteOrder).toHaveBeenCalledWith(mockOrders[0]);
  });
});
