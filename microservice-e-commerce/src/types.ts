export interface ColorOption {
  name: string;
  value: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductVariant {
  id?: number;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  badge?: string;
  category: string;     // e.g. "Nội thất", "Đồ trang trí"
  subCategory: string;  // e.g. "Phòng Khách", "Phòng Ngủ", "Bàn Ghế Ăn", "Đồ Trang Trí"
  brand: string;        // e.g. "LuxeBrand", "OakaHome", "ClassicFit", "UrbanStyle"
  material: string;     // e.g. "Gỗ sồi tự nhiên", "Đồng thau"
  description: string;
  image: string;
  gallery?: string[];
  sizes?: string[];     // e.g. ["40mm", "42mm"] or ["Compact", "Standard", "Deluxe"]
  colors?: ColorOption[];
  specs?: SpecItem[];
  highlights?: string[];
  sku?: string;
  stock?: number;
  createdAt?: string;
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  receiverName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: 'COD' | 'CARD';
  cardInfo?: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
