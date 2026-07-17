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
      className="bg-surface-container-lowest dark:bg-tertiary-container/10 rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-outline-variant/60 transition-all duration-500 group cursor-pointer flex flex-col justify-between"
    >
      <div className="relative h-[300px] bg-surface-variant/10 overflow-hidden">
        {/* Subtle inner overlay frame */}
        <div className="absolute inset-3 border border-white/10 rounded-xl z-20 pointer-events-none group-hover:inset-2.5 transition-all duration-500" />
        
        {/* Product Image */}
        <img 
          className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105" 
          alt={product.name} 
          src={product.image}
        />

        {/* Favorite Button */}
        <button 
          type="button"
          onClick={(e) => onToggleFavorite(product.id, e)}
          className={`absolute top-3 right-3 p-2 bg-white/90 dark:bg-primary/90 rounded-full shadow-md transition-all scale-95 duration-200 hover:scale-105 z-10 ${
            isFavorite ? 'text-secondary dark:text-secondary' : 'text-outline hover:text-secondary'
          }`}
          title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Badge overlay (e.g. Bán chạy, Mới, New Arrival) */}
        {(() => {
          const isNew = (() => {
            if (!product.createdAt) return false;
            const createdDate = new Date(product.createdAt);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return createdDate > oneWeekAgo;
          })();

          if (isNew) {
            return (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-secondary text-white font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded shadow-md border border-secondary">
                  NEW ARRIVAL
                </span>
              </div>
            );
          }

          if (product.badge) {
            return (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-surface-bright dark:bg-surface-container-low text-primary dark:text-primary font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded border border-outline-variant/30 shadow-sm">
                  {product.badge}
                </span>
              </div>
            );
          }

          return null;
        })()}

        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-primary/70 to-transparent flex justify-center z-10">
          <button 
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            className="bg-primary dark:bg-secondary-container hover:bg-secondary dark:hover:bg-secondary text-white font-mono text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg w-full shadow-md hover:shadow-lg transition-colors duration-200 flex items-center justify-center gap-2 transform active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info details */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-surface-container-lowest dark:bg-tertiary-container/5">
        <div>
          <h3 className="font-display-serif text-[20px] leading-[26px] font-medium text-primary dark:text-primary mb-1 truncate group-hover:text-secondary dark:group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant/80 dark:text-tertiary-fixed-dim/60 mb-4 truncate font-mono uppercase tracking-wider">
            // {product.material || product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/10">
          <span className="font-body-lg text-body-lg font-bold text-primary dark:text-primary">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center text-[#F59E0B] bg-amber-500/10 px-2 py-0.5 rounded">
            <Star className="w-3.5 h-3.5 fill-current mr-1" />
            <span className="font-bold text-label-sm text-on-surface">
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
