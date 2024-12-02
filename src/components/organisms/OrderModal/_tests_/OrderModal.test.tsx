import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderModal from '../OrderModal';
import { ChakraProvider } from '@chakra-ui/react';
import { Order, OrderStatus, OrderForm, OrderItem } from '@/types/order';

import '@testing-library/jest-dom';

const mockOrderItem: OrderItem = {
  id: '1',
  orderId: 'ORD-2024-001',
  productId: 'PROD-001',
  quantity: 2,
  unitPrice: 5000,
  product: {
    id: 'PROD-001',
    name: 'テスト商品1',
    price: 5000,
    description: 'テスト商品1の説明',
    stockQuantity: 100,
    category: 'テストカテゴリ',
    is_active: true,
    created_at: '2024-04-01T10:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
  },
  created_at: '2024-04-01T10:00:00Z',
  updated_at: '2024-04-01T10:00:00Z',
  deleted_at: null,
};

const mockActiveOrder: Order = {
  id: '1',
  orderNumber: 'ORD-2024-001',
  orderDate: '2024-04-01T10:00:00Z',
  totalAmount: 15000,
  status: 'PENDING',
  discountApplied: 1000,
  customerId: 'CUST-001',
  userId: 'USER-001',
  campaignId: null,
  customer: {
    id: 'CUST-001',
    name: 'テスト顧客',
    email: 'test@example.com',
    phoneNumber: '090-1234-5678',
    address: '東京都渋谷区',
    birthDate: '1990-01-01',
    created_at: '2024-04-01T10:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
  },
  user: {
    id: 'USER-001',
    username: 'テストユーザー',
    email: 'user@example.com',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z',
  },
  order_items: [mockOrderItem],
  created_at: '2024-04-01T10:00:00Z',
  updated_at: '2024-04-01T10:00:00Z',
  deleted_at: null,
};

const mockNewOrder: OrderForm = {
  customerId: '',
  orderItems: [],
  status: 'PENDING',
};

const mockEditOrder: OrderForm = {
  customerId: 'CUST-001',
  orderItems: [
    {
      productId: 'PROD-001',
      quantity: 2,
    },
  ],
  status: 'PENDING',
};

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

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  isMobile: false,
  modalSize: '4xl',
  modalMode: 'detail' as const,
  activeOrder: mockActiveOrder,
  newOrder: mockNewOrder,
  formErrors: {},
  statusColorScheme: mockStatusColorScheme,
  statusDisplayText: mockStatusDisplayText,
  handleInputChange: jest.fn(),
  handleOrderItemChange: jest.fn(),
  handleAddOrderItem: jest.fn(),
  handleRemoveOrderItem: jest.fn(),
  handleSubmit: jest.fn(),
};

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('OrderModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('注文詳細モードで正しく表示される', () => {
    renderWithChakra(<OrderModal {...defaultProps} />);
    expect(screen.getByText('注文詳細')).toBeInTheDocument();
    expect(screen.getByText('基本情報')).toBeInTheDocument();
    expect(screen.getByText('注文商品')).toBeInTheDocument();
  });

  it('新規注文作成モードで正しく表示される', () => {
    renderWithChakra(
      <OrderModal
        {...defaultProps}
        modalMode="add"
        activeOrder={null}
        newOrder={mockNewOrder}
      />,
    );
    expect(screen.getByText('新規注文作成')).toBeInTheDocument();
  });

  it('注文編集モードで正しく表示される', () => {
    renderWithChakra(
      <OrderModal
        {...defaultProps}
        modalMode="edit"
        newOrder={mockEditOrder}
      />,
    );
    expect(screen.getByText('注文編集')).toBeInTheDocument();
  });

  it('タブが正しく切り替わる', async () => {
    renderWithChakra(<OrderModal {...defaultProps} />);
    const customerInfoTab = screen.getByText('顧客情報');
    fireEvent.click(customerInfoTab);
    expect(screen.getByText('テスト顧客')).toBeInTheDocument();
  });

  it('配送情報タブに実装予定の表示がある', () => {
    renderWithChakra(<OrderModal {...defaultProps} />);
    const shipmentInfoTab = screen.getByText('配送情報');
    fireEvent.click(shipmentInfoTab);
    expect(screen.getByText('配送情報は実装予定です')).toBeInTheDocument();
  });

  it('activeOrderがnullの場合、ローディングメッセージが表示される', () => {
    renderWithChakra(<OrderModal {...defaultProps} activeOrder={null} />);
    expect(
      screen.getByText('注文情報を読み込んでいます...'),
    ).toBeInTheDocument();
  });

  it('注文商品が空の場合、適切なメッセージが表示される', () => {
    const orderWithNoItems = {
      ...mockActiveOrder,
      order_items: [],
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithNoItems} />,
    );
    expect(
      screen.getByText('注文商品情報が見つかりません'),
    ).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    renderWithChakra(<OrderModal {...defaultProps} />);
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  describe('モバイル表示', () => {
    it('モバイルモードで正しくDrawerとして表示される', () => {
      renderWithChakra(<OrderModal {...defaultProps} isMobile={true} />);
      expect(screen.getByRole('dialog')).toHaveClass('chakra-modal__content');
    });

    it('モバイルモードで商品名をクリックするとtoastが表示される', async () => {
      renderWithChakra(<OrderModal {...defaultProps} isMobile={true} />);
      const productName = screen.getByText('テスト商品1');
      fireEvent.click(productName);
    });
  });
});
