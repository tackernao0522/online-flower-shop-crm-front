import { useCallback } from 'react';
import type { OrderForm, OrderFormItem, FormErrors } from '@/types/order';

type OrderItemField = keyof OrderFormItem;

interface UseOrderItemsProps {
  newOrder: OrderForm;
  setNewOrder: (order: OrderForm | ((prev: OrderForm) => OrderForm)) => void;
  setFormErrors: (
    errors: FormErrors | ((prev: FormErrors) => FormErrors),
  ) => void;
}

export const useOrderItems = ({
  newOrder,
  setNewOrder,
  setFormErrors,
}: UseOrderItemsProps) => {
  const handleOrderItemChange = useCallback(
    (index: number, field: OrderItemField, value: string | number): void => {
      setNewOrder((prev: OrderForm) => {
        const items = [...prev.orderItems];
        const parsedValue =
          field === 'quantity'
            ? Math.max(
                1,
                typeof value === 'number'
                  ? value
                  : parseInt(String(value), 10) || 1,
              )
            : value;

        items[index] = {
          ...items[index],
          [field]: parsedValue,
        };
        return { ...prev, orderItems: items };
      });
    },
    [setNewOrder],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;
      if (name.startsWith('orderItems.')) {
        const [, index, field] = name.split('.');
        setNewOrder((prev: OrderForm) => {
          const items = [...prev.orderItems];
          items[Number(index)] = {
            ...items[Number(index)],
            [field]:
              field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
          };
          return { ...prev, orderItems: items };
        });
      } else {
        setNewOrder((prev: OrderForm) => ({ ...prev, [name]: value }));
      }
      setFormErrors((prev: FormErrors) => ({ ...prev, [name]: undefined }));
    },
    [setNewOrder, setFormErrors],
  );

  const handleAddOrderItem = useCallback((): void => {
    setNewOrder((prev: OrderForm) => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        {
          productId: '',
          quantity: 1,
        },
      ],
    }));
  }, [setNewOrder]);

  const handleRemoveOrderItem = useCallback(
    (index: number): void => {
      setNewOrder((prev: OrderForm) => ({
        ...prev,
        orderItems: prev.orderItems.filter((_: any, i: number) => i !== index),
      }));
    },
    [setNewOrder],
  );

  return {
    handleOrderItemChange,
    handleInputChange,
    handleAddOrderItem,
    handleRemoveOrderItem,
  };
};
