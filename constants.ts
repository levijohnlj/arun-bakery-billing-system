import { Product, DailyStat, SaleRecord, Customer } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Sourdough Loaf', category: 'Bread', price: 180.00, cost: 45.00, stock: 12, minStock: 5, unit: 'pcs' },
  { id: 'p2', name: 'Butter Croissant', category: 'Pastry', price: 120.00, cost: 30.00, stock: 45, minStock: 20, unit: 'pcs' },
  { id: 'p3', name: 'Almond Danish', category: 'Pastry', price: 140.00, cost: 40.00, stock: 8, minStock: 10, unit: 'pcs' },
  { id: 'p4', name: 'Masala Chai', category: 'Beverage', price: 40.00, cost: 10.00, stock: 500, minStock: 100, unit: 'cups' },
  { id: 'p5', name: 'Cappuccino', category: 'Beverage', price: 150.00, cost: 35.00, stock: 400, minStock: 100, unit: 'cups' },
  { id: 'p6', name: 'Veg Puff', category: 'Savory', price: 45.00, cost: 12.00, stock: 30, minStock: 15, unit: 'pcs' },
  { id: 'p7', name: 'Chocolate Truffle', category: 'Cake', price: 1200.00, cost: 400.00, stock: 4, minStock: 2, unit: 'kg' },
  { id: 'p8', name: 'Mumbai Vada Pav', category: 'Savory', price: 35.00, cost: 12.00, stock: 50, minStock: 15, unit: 'pcs' },
];

export const MOCK_DAILY_STATS: DailyStat[] = [
  { date: 'Mon', sales: 12000, orders: 45 },
  { date: 'Tue', sales: 14500, orders: 52 },
  { date: 'Wed', sales: 11000, orders: 38 },
  { date: 'Thu', sales: 16000, orders: 60 },
  { date: 'Fri', sales: 21000, orders: 85 },
  { date: 'Sat', sales: 28000, orders: 110 },
  { date: 'Sun', sales: 24000, orders: 95 },
];

export const INITIAL_SALES: SaleRecord[] = [
  { id: 's1', timestamp: new Date(new Date().setHours(8, 30)), total: 240.00, items: [] },
  { id: 's2', timestamp: new Date(new Date().setHours(9, 15)), total: 120.00, items: [] },
  { id: 's3', timestamp: new Date(new Date().setHours(10, 45)), total: 560.00, items: [] },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Aditi Sharma', phone: '9876543210', email: 'aditi@example.com', loyaltyPoints: 120, totalSpent: 4500.50, joinDate: new Date('2023-01-15') },
  { id: 'c2', name: 'Rahul Verma', phone: '9876500001', email: 'rahul@example.com', loyaltyPoints: 45, totalSpent: 1200.00, joinDate: new Date('2023-03-22') },
  { id: 'c3', name: 'Priya Singh', phone: '9876500002', email: 'priya@example.com', loyaltyPoints: 310, totalSpent: 8900.75, joinDate: new Date('2022-11-05') },
];

// Placeholder for Shop QR Code (UPI)
// In a real app, this would be uploaded by the admin
export const SHOP_QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=bakery@upi&pn=CrumbAndCo&mc=5462&tid=123456&tr=123456&tn=BakeryPayment&am=0&cu=INR";