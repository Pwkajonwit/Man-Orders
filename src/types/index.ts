export type UserRole = "admin" | "orderer" | "buyer";
export interface User {
  id: string;
  name: string;
  role: UserRole;
  lineId?: string;
  photoURL?: string;
  createdAt: Date | any;
}
export interface Item {
  id: string;
  name: string;
  qty: number;
  unit: string;
  status: "to_buy" | "bought" | "out_of_stock" | "cancelled";
  category?: string;
  price?: number;
  note?: string;
  boughtAt?: Date | any;
}
export interface Order {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterUsername?: string;
  storeName?: string;
  location?: string;
  contact?: string;
  items: Item[];
  status: "pending" | "buying" | "sorting" | "completed" | "cancelled";
  createdAt: Date | any;
  updatedAt: Date | any;
  buyerId?: string;
  note?: string;
}

export interface AppSettings {
  systemName: string;
  companyName: string;
  categories: string[];
  units: string[];
  lineNotifyEnabled: boolean;
  orderFilteringEnabled: boolean;
  updatedAt?: Date | any;
}

export interface NetworkStore {
  id: string;
  name: string;
  type: string;
  location: string;
  mapUrl?: string;
  phone: string;
  orders: number;
  createdAt?: any;
  updatedAt?: any;
}

