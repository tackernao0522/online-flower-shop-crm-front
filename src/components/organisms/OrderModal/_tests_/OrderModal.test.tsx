import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderModal from '../OrderModal';
import { ChakraProvider } from '@chakra-ui/react';
import { Order, OrderStatus, OrderForm, OrderItem } from '@/types/order';

import '@testing-library/jest-dom';

const mockToast = jest.fn();

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useBreakpointValue: () => false,
  useToast: () => mockToast,
}));

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
    mockToast.mockClear();
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

  it('タブが正しく切り替わる', () => {
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

  it('割引が適用されている場合、割引情報が表示される', () => {
    const orderWithDiscount = {
      ...mockActiveOrder,
      discountApplied: 1000,
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithDiscount} />,
    );
    expect(screen.getByText('適用割引')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
  });

  it('割引が0円の場合、割引情報が表示されない', () => {
    const orderWithoutDiscount = {
      ...mockActiveOrder,
      discountApplied: 0,
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithoutDiscount} />,
    );
    expect(screen.queryByText('適用割引')).not.toBeInTheDocument();
  });

  it('顧客情報が設定されていない場合、適切なメッセージが表示される', () => {
    const orderWithoutCustomer = {
      ...mockActiveOrder,
      customer: null,
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithoutCustomer} />,
    );
    const customerInfoTab = screen.getByText('顧客情報');
    fireEvent.click(customerInfoTab);
    expect(screen.getByText('顧客情報が見つかりません')).toBeInTheDocument();
  });

  it('モーダルモードに応じて正しいヘッダーが表示される', () => {
    renderWithChakra(<OrderModal {...defaultProps} modalMode="detail" />);
    expect(screen.getByText('注文詳細')).toBeInTheDocument();

    renderWithChakra(<OrderModal {...defaultProps} modalMode="add" />);
    expect(screen.getByText('新規注文作成')).toBeInTheDocument();

    renderWithChakra(<OrderModal {...defaultProps} modalMode="edit" />);
    expect(screen.getByText('注文編集')).toBeInTheDocument();
  });

  describe('モバイル表示', () => {
    it('モバイルモードで正しくDrawerとして表示される', () => {
      renderWithChakra(<OrderModal {...defaultProps} isMobile={true} />);
      expect(screen.getByRole('dialog')).toHaveClass('chakra-modal__content');
    });

    it('モバイルモードで商品名をクリックするとtoastが表示される', () => {
      renderWithChakra(<OrderModal {...defaultProps} isMobile={true} />);
      const productName = screen.getByText('テスト商品1');
      fireEvent.click(productName);

      expect(mockToast).toHaveBeenCalledWith({
        title: '商品名',
        description: 'テスト商品1',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    });
  });

  describe('モバイル表示での商品名', () => {
    it('商品名が長い場合に省略表示される', () => {
      const longNameOrder = {
        ...mockActiveOrder,
        order_items: [
          {
            ...mockOrderItem,
            product: {
              ...mockOrderItem.product,
              name: 'とても長い商品名'.repeat(10),
            },
          },
        ],
      };
      renderWithChakra(
        <OrderModal
          {...defaultProps}
          activeOrder={longNameOrder}
          isMobile={true}
        />,
      );
      const productNameElement = screen.getByText(
        'とても長い商品名'.repeat(10),
      );
      expect(productNameElement).toHaveStyle({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      });
    });

    it('商品名クリック時にtoastが正しいパラメータで表示される', () => {
      renderWithChakra(<OrderModal {...defaultProps} isMobile={true} />);
      const productName = screen.getByText('テスト商品1');
      fireEvent.click(productName);

      expect(mockToast).toHaveBeenCalledWith({
        title: '商品名',
        description: 'テスト商品1',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    });
  });

  it('ユーザーが未割り当ての場合、適切に表示される', () => {
    const orderWithoutUser = {
      ...mockActiveOrder,
      user: null,
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithoutUser} />,
    );
    expect(screen.getByText('未割り当て')).toBeInTheDocument();
  });

  it('商品のIDがnullの場合でも商品一覧が表示される', () => {
    const orderWithNullProductId = {
      ...mockActiveOrder,
      order_items: [
        {
          ...mockOrderItem,
          id: null,
        },
      ],
    };
    renderWithChakra(
      <OrderModal {...defaultProps} activeOrder={orderWithNullProductId} />,
    );
    expect(screen.getByText('テスト商品1')).toBeInTheDocument();
  });

  describe('モーダルのフッターボタン', () => {
    it('詳細モードでは作成/更新ボタンが表示されない', () => {
      renderWithChakra(<OrderModal {...defaultProps} modalMode="detail" />);
      expect(screen.queryByText('作成')).not.toBeInTheDocument();
      expect(screen.queryByText('更新')).not.toBeInTheDocument();
    });

    it('追加モードでは作成ボタンが表示される', () => {
      renderWithChakra(
        <OrderModal {...defaultProps} modalMode="add" activeOrder={null} />,
      );
      expect(screen.getByText('作成')).toBeInTheDocument();
    });

    it('編集モードでは更新ボタンが表示される', () => {
      renderWithChakra(<OrderModal {...defaultProps} modalMode="edit" />);
      expect(screen.getByText('更新')).toBeInTheDocument();
    });
  });

  describe('モバイル表示でのモーダルヘッダーとボタン', () => {
    it('詳細モードではDrawerヘッダーに注文詳細と表示される', () => {
      renderWithChakra(
        <OrderModal {...defaultProps} modalMode="detail" isMobile={true} />,
      );
      expect(screen.getByText('注文詳細')).toBeInTheDocument();
    });

    it('追加モードではDrawerヘッダーに新規注文作成と表示され、作成ボタンが表示される', () => {
      renderWithChakra(
        <OrderModal
          {...defaultProps}
          modalMode="add"
          isMobile={true}
          activeOrder={null}
        />,
      );
      expect(screen.getByText('新規注文作成')).toBeInTheDocument();
      expect(screen.getByText('作成')).toBeInTheDocument();
    });

    it('編集モードではDrawerヘッダーに注文編集と表示され、更新ボタンが表示される', () => {
      renderWithChakra(
        <OrderModal {...defaultProps} modalMode="edit" isMobile={true} />,
      );
      expect(screen.getByText('注文編集')).toBeInTheDocument();
      expect(screen.getByText('更新')).toBeInTheDocument();
    });
  });
});
