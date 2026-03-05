export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  BILLING = 'BILLING',
  INVENTORY = 'INVENTORY',
  CUSTOMERS = 'CUSTOMERS',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  timestamp: Date;
  items: CartItem[];
  total: number;
  customerId?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  discountAmount?: number;
}

export interface DailyStat {
  date: string;
  sales: number;
  orders: number;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  joinDate: Date;
}