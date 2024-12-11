import { render, screen, fireEvent } from '@testing-library/react';
import OrderForm from '../OrderForm';
import { ChakraProvider } from '@chakra-ui/react';

export enum OrderStatusMock {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

describe('OrderForm', () => {
  const mockHandleInputChange = jest.fn();
  const mockHandleOrderItemChange = jest.fn();
  const mockHandleAddOrderItem = jest.fn();
  const mockHandleRemoveOrderItem = jest.fn();

  const defaultProps = {
    newOrder: {
      customerId: '',
      orderItems: [
        {
          productId: '',
          quantity: 1,
        },
      ],
      status: OrderStatusMock.PENDING,
    },
    formErrors: {},
    modalMode: 'add' as const,
    statusDisplayText: {
      [OrderStatusMock.PENDING]: '未処理',
      [OrderStatusMock.PROCESSING]: '処理中',
      [OrderStatusMock.CONFIRMED]: '確認済み',
      [OrderStatusMock.SHIPPED]: '発送済み',
      [OrderStatusMock.DELIVERED]: '配達済み',
      [OrderStatusMock.CANCELLED]: 'キャンセル',
    },
    handleInputChange: mockHandleInputChange,
    handleOrderItemChange: mockHandleOrderItemChange,
    handleAddOrderItem: mockHandleAddOrderItem,
    handleRemoveOrderItem: mockHandleRemoveOrderItem,
  };

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('顧客IDの入力フィールドが正しく表示される', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    // ラベルとプレースホルダーの両方をチェック
    expect(screen.getByText('顧客ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('顧客IDを入力')).toBeInTheDocument();
  });

  test('商品追加ボタンをクリックすると handleAddOrderItem が呼ばれる', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    fireEvent.click(screen.getByText('商品を追加'));
    expect(mockHandleAddOrderItem).toHaveBeenCalledTimes(1);
  });

  test('商品削除ボタンをクリックすると handleRemoveOrderItem が呼ばれる', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('商品を削除'));
    expect(mockHandleRemoveOrderItem).toHaveBeenCalledWith(0);
  });

  test('商品IDを入力すると handleOrderItemChange が正しく呼ばれる', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    const input = screen.getByPlaceholderText('商品ID');
    fireEvent.change(input, { target: { value: 'PROD001' } });
    expect(mockHandleOrderItemChange).toHaveBeenCalledWith(
      0,
      'productId',
      'PROD001',
    );
  });

  test('数量を変更すると handleOrderItemChange が正しく呼ばれる', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    const input = screen.getByPlaceholderText('数量');
    fireEvent.change(input, { target: { value: '5' } });
    expect(mockHandleOrderItemChange).toHaveBeenCalledWith(0, 'quantity', 5);
  });

  test('編集モードではステータス選択が表示される', () => {
    renderWithChakra(<OrderForm {...defaultProps} modalMode="edit" />);
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('未処理')).toBeInTheDocument();
  });

  test('追加モードではステータス選択が表示されない', () => {
    renderWithChakra(<OrderForm {...defaultProps} />);
    expect(screen.queryByText('ステータス')).not.toBeInTheDocument();
  });

  test('フォームエラーが正しく表示される', () => {
    const propsWithErrors = {
      ...defaultProps,
      formErrors: {
        customerId: '顧客IDは必須です',
        orderItems: '商品情報を入力してください',
      },
    };
    renderWithChakra(<OrderForm {...propsWithErrors} />);
    expect(screen.getByText('顧客IDは必須です')).toBeInTheDocument();
    expect(screen.getByText('商品情報を入力してください')).toBeInTheDocument();
  });
});
