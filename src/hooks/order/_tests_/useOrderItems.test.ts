import { renderHook, act } from '@testing-library/react';
import { useOrderItems } from '../useOrderItems';
import type { OrderForm } from '@/types/order';

describe('useOrderItems フック', () => {
  let mockSetNewOrder: jest.Mock;
  let mockSetFormErrors: jest.Mock;
  let initialOrder: OrderForm;

  beforeEach(() => {
    mockSetNewOrder = jest.fn();
    mockSetFormErrors = jest.fn();
    initialOrder = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [
        { productId: 'product1', quantity: 1 },
        { productId: 'product2', quantity: 2 },
      ],
    };
  });

  describe('handleOrderItemChange', () => {
    test('数量を正の整数に正規化する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleOrderItemChange(0, 'quantity', -1);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].quantity).toBe(1);
    });

    test('文字列の数値を適切に処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleOrderItemChange(0, 'quantity', '5');
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].quantity).toBe(5);
    });

    test('不正な数値入力を1に正規化する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleOrderItemChange(0, 'quantity', 'invalid');
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].quantity).toBe(1);
    });

    test('数値型のquantity値を適切に処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleOrderItemChange(0, 'quantity', 5);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].quantity).toBe(5);
    });

    test('productIdフィールドの変更を処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleOrderItemChange(0, 'productId', 'newProduct');
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].productId).toBe('newProduct');
    });
  });

  describe('handleInputChange', () => {
    test('orderItemsの数量に対して最小値1を保証する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'orderItems.0.quantity',
            value: '-5',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].quantity).toBe(1);
    });

    test('フォームエラーをクリアする', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'customerId',
            value: 'customer2',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const setErrorsCallback = mockSetFormErrors.mock.calls[0][0];
      const updatedErrors = setErrorsCallback({ customerId: 'Required' });
      expect(updatedErrors.customerId).toBeUndefined();
    });

    test('select要素の変更を処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'orderItems.0.productId',
            value: 'product3',
          },
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[0].productId).toBe('product3');
    });

    test('通常のフォームフィールド（orderItems以外）の変更を処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'notes',
            value: 'テスト注文',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.notes).toBe('テスト注文');
    });

    test('様々な通常フィールドの型に対する変更を正しく処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      // 文字列フィールド
      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'notes',
            value: 'テスト注文',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // 数値フィールド
      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'totalAmount',
            value: '1000',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'isPriority',
            value: 'true',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'comments',
            value: '',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const setOrderCallbacks = mockSetNewOrder.mock.calls;
      const finalUpdate = setOrderCallbacks.reduce(
        (prev, [callback]) => callback(prev),
        initialOrder,
      );

      expect(finalUpdate.notes).toBe('テスト注文');
      expect(finalUpdate.totalAmount).toBe('1000');
      expect(finalUpdate.isPriority).toBe('true');
      expect(finalUpdate.comments).toBe('');
      expect(mockSetNewOrder).toHaveBeenCalledTimes(4);
      expect(mockSetFormErrors).toHaveBeenCalledTimes(4);
    });

    test('非orderItemsフィールドの特殊文字を含む名前を正しく処理する', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: {
            name: 'special.field',
            value: 'test',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder['special.field']).toBe('test');
    });
  });

  describe('handleAddOrderItem', () => {
    test('新規商品アイテムのデフォルト値が正しい', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleAddOrderItem();
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems[2]).toEqual({
        productId: '',
        quantity: 1,
      });
    });
  });

  describe('handleRemoveOrderItem', () => {
    test('指定したインデックスの商品が削除される', () => {
      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: initialOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleRemoveOrderItem(0);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(initialOrder);
      expect(updatedOrder.orderItems).toHaveLength(1);
      expect(updatedOrder.orderItems[0]).toEqual({
        productId: 'product2',
        quantity: 2,
      });
    });

    test('最後のアイテムが削除された後の状態が正しい', () => {
      const singleItemOrder = {
        ...initialOrder,
        orderItems: [{ productId: 'product1', quantity: 1 }],
      };

      const { result } = renderHook(() =>
        useOrderItems({
          newOrder: singleItemOrder,
          setNewOrder: mockSetNewOrder,
          setFormErrors: mockSetFormErrors,
        }),
      );

      act(() => {
        result.current.handleRemoveOrderItem(0);
      });

      const setOrderCallback = mockSetNewOrder.mock.calls[0][0];
      const updatedOrder = setOrderCallback(singleItemOrder);
      expect(updatedOrder.orderItems).toHaveLength(0);
    });
  });
});
