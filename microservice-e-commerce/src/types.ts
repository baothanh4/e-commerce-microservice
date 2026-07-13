export interface ColorOption {
  name: string;
  value: string;
}

export interface SpecItem {
  label: string;
  value: string;
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
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
