export interface StockItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  location?: string;
  items: StockItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface TransferItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface StatusHistoryEntry {
  status: TransferStatus;
  at: string;
  by?: string;
}

export interface Transfer {
  _id: string;
  fromWarehouse: Warehouse | string;
  toWarehouse: Warehouse | string;
  items: TransferItem[];
  status: TransferStatus;
  statusHistory?: StatusHistoryEntry[];
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthPayload {
  user: AuthUser;
  token: string;
}

export interface DashboardStats {
  warehouses: number;
  transfers: {
    pending: number;
    inTransit: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  recentTransfers: Transfer[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
