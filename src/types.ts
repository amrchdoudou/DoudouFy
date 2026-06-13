export type UnitType = 'kg' | 'l' | 'g' | 'box' | 'carton' | 'unit';

export interface Product {
  id: string;
  name: string;
  purchasePrice: number; // Prix d'achat
  sellingPrice: number;  // Prix de vente
  unitType: UnitType;
  quantity: number;
  supplier: string;      // Fournisseur
  minStockAlert: number; // Seuil d'alerte
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitType: UnitType;
  purchasePrice: number;
  sellingPrice: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivery' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerId: string; // "anonymous" if no customer
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  totalPurchaseCost: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'purchase' | 'stock_adjustment' | 'refund';
  description: string;
  amount: number; // Positive for income, negative for expense
  profit: number; // Profit generated
}

export type Language = 'fr' | 'en' | 'ar';
