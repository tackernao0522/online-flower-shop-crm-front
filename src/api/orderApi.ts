import { AppDispatch } from '@/store';
import { fetchOrders as fetchOrdersAction } from '@/features/orders/ordersSlice';
import type { Order } from '@/types/order';

interface FetchOrdersParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

interface FetchOrdersResponse {
  data: Order[];
  meta: { total: number };
}

export const fetchOrdersHelper = async (
  dispatch: AppDispatch,
  params: FetchOrdersParams,
): Promise<FetchOrdersResponse> => {
  const response = await dispatch(fetchOrdersAction(params)).unwrap();
  return {
    data: response.data.data,
    meta: response.meta,
  };
};
