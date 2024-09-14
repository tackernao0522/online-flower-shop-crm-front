export interface PurchaseHistory {
  id: string;
  date: string;
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  created_at: string;
  updated_at: string;
  purchaseHistory?: PurchaseHistory[];
  notes?: string;
}
