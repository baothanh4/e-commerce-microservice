import React from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onProductClick: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: number, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onProductClick,
  isFavorite,
  onToggleFavorite,
}) => {
  // Format price in VND (e.g. 8.500.000 ₫)
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="bg-surface-container-lowest dark:bg-tertiary-container/30 rounded-xl overflow-hidden border border-outline-variant/40 hover:shadow-xl hover:border-outline-variant/80 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
    >
      <div className="relative h-[280px] bg-surface-variant/30 overflow-hidden">
        {/* Product Image */}
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={product.name} 
          src={product.image}
        />

        {/* Favorite Button */}
        <button 
          type="button"
          onClick={(e) => onToggleFavorite(product.id, e)}
          className={`absolute top-3 right-3 p-2 bg-white/95 dark:bg-primary/95 rounded-full shadow-md transition-all scale-95 duration-150 hover:scale-105 z-10 ${
            isFavorite ? 'text-secondary dark:text-secondary-fixed' : 'text-outline hover:text-secondary'
          }`}
          title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <Heart className={`w-[18px] h-[18px] ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Badge overlay (e.g. Bán chạy, Mới) */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="bg-surface-bright dark:bg-surface-container-low text-primary dark:text-primary-fixed font-bold text-label-sm px-2.5 py-1 rounded border border-outline-variant/40 shadow-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center z-10">
          <button 
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            className="bg-[#0A2540] dark:bg-secondary-container hover:bg-primary dark:hover:bg-secondary text-white font-semibold text-label-md py-2.5 px-6 rounded-lg w-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
          >
            <ShoppingBag className="w-[18px] h-[18px]" /> Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline-sm text-[16px] leading-[24px] font-bold text-primary dark:text-primary-fixed-dim mb-1 truncate group-hover:text-secondary dark:group-hover:text-secondary-fixed transition-colors">
            {product.name}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 mb-3 truncate">
            {product.material || product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-body-lg text-body-lg font-bold text-primary dark:text-primary-fixed">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center text-[#F59E0B] bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
            <Star className="w-[14px] h-[14px] fill-current mr-1" />
            <span className="font-bold text-label-sm text-on-surface dark:text-tertiary-fixed-dim">
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
