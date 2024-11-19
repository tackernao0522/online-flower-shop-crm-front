import type { Customer } from "./customer";
import type { Product } from "./product";
import type { User } from "./user";

// 注文ステータスの型
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// APIレスポンスの注文商品の型
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: Product;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// フォームの注文商品入力用の型
export interface OrderFormItem {
  productId: string;
  quantity: number;
}

// APIレスポンスの注文の型
export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  discountApplied: number;
  customerId: string;
  userId: string;
  campaignId: string | null;
  customer: Customer;
  order_items: OrderItem[]; // APIレスポンスではorder_itemsを使用
  user?: User;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// フォームの状態管理用の型
export interface OrderForm {
  customerId: string;
  orderItems: OrderFormItem[];
  status: OrderStatus;
}

// 日付範囲の型
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

// フォームエラーの型
export interface FormErrors {
  customerId?: string;
  orderItems?: string;
}
