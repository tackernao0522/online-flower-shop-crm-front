import type { Customer } from "./customer";
import type { Product } from "./product";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

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
  orderItems: OrderItem[];
  created_at: string;
  updated_at: string;
}
