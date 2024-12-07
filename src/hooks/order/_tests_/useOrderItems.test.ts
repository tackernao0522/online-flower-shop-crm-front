import { renderHook, act } from '@testing-library/react';
import { useOrderItems } from '../useOrderItems';
import type { OrderForm, OrderFormItem, FormErrors } from '@/types/order';

describe('useOrderItems フック', () => {
  let mockSetNewOrder: jest.Mock;
  let mockSetFormErrors: jest.Mock;

  beforeEach(() => {
    mockSetNewOrder = jest.fn();
    mockSetFormErrors = jest.fn();
  });

  test('handleOrderItemChange が正しく動作する', () => {
    const initialOrder: OrderForm = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [
        { productId: 'product1', quantity: 1 },
        { productId: 'product2', quantity: 2 },
      ],
    };

    const { result } = renderHook(() =>
      useOrderItems({
        newOrder: initialOrder,
        setNewOrder: mockSetNewOrder,
        setFormErrors: mockSetFormErrors,
      }),
    );

    act(() => {
      result.current.handleOrderItemChange(1, 'quantity', 3);
    });

    expect(mockSetNewOrder).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleInputChange が正しく動作する（orderItems に対応）', () => {
    const initialOrder: OrderForm = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [
        { productId: 'product1', quantity: 1 },
        { productId: 'product2', quantity: 2 },
      ],
    };

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
          name: 'orderItems.1.quantity',
          value: '4',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockSetNewOrder).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleInputChange が正しく動作する（トップレベルのフィールドに対応）', () => {
    const initialOrder: OrderForm = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [
        { productId: 'product1', quantity: 1 },
        { productId: 'product2', quantity: 2 },
      ],
    };

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

    expect(mockSetNewOrder).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleAddOrderItem が正しく動作する', () => {
    const initialOrder: OrderForm = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [{ productId: 'product1', quantity: 1 }],
    };

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

    expect(mockSetNewOrder).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleRemoveOrderItem が正しく動作する', () => {
    const initialOrder: OrderForm = {
      customerId: 'customer1',
      status: 'PENDING',
      orderItems: [
        { productId: 'product1', quantity: 1 },
        { productId: 'product2', quantity: 2 },
      ],
    };

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

    expect(mockSetNewOrder).toHaveBeenCalledWith(expect.any(Function));
  });
});
