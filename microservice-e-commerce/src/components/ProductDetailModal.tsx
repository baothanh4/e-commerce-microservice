import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Plus, Minus, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import type { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Default');

  if (!isOpen || !product) return null;

  // Format price in VND
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity
    onClose();
  };

  // Mock colors for customization
  const colors = [
    { name: 'Xám Ghi', value: '#6B7280' },
    { name: 'Đồng Cổ', value: '#B45309' },
    { name: 'Xanh Navy', value: '#1E3A8A' },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[850px] max-h-[90vh] overflow-y-auto bg-surface-container-lowest dark:bg-tertiary-container rounded-2xl shadow-2xl p-6 z-50 border border-outline-variant/35 animate-scaleUp">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:bg-surface-container-highest dark:hover:bg-surface-container-low hover:text-on-surface transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-variant/20 border border-outline-variant/20">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Small Thumbnails mockup */}
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-secondary bg-surface-variant/10 cursor-pointer">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-variant/10 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover filter brightness-90" />
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-variant/10 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover filter sepia-[0.2]" />
              </div>
            </div>
          </div>

          {/* Right Column: Info & Checkout */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block text-secondary dark:text-secondary-fixed text-xs font-bold uppercase tracking-wider mb-2">
                {product.category}
              </span>
              
              <h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed mb-2">
                {product.name}
              </h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'fill-current text-[#F59E0B]' 
                          : 'text-outline-variant'
                      }`} 
                    />
                  ))}
                  <span className="font-bold text-body-sm text-on-surface dark:text-tertiary-fixed-dim ml-1.5">
                    {product.rating}
                  </span>
                </div>
                <span className="text-body-sm text-outline">|</span>
                <span className="text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 font-medium">
                  128 đánh giá
                </span>
              </div>

              <div className="text-[26px] leading-[32px] font-bold text-secondary dark:text-secondary-fixed mb-4">
                {formatPrice(product.price)}
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 mb-6 leading-relaxed">
                {product.description}. LuxeCommerce cam kết mang lại sản phẩm chất lượng cao nhất với quy trình hoàn thiện thủ công tỉ mỉ đến từng chi tiết.
              </p>

              {/* Color Selector Mock */}
              <div className="mb-6">
                <span className="block text-body-sm font-semibold text-primary dark:text-primary-fixed-dim mb-2">
                  Màu sắc: {selectedColor}
                </span>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === color.name 
                          ? 'border-secondary scale-110 shadow-sm' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications checklist */}
              <div className="border-t border-b border-outline-variant/30 py-4 mb-6 space-y-2">
                <div className="grid grid-cols-2 text-body-sm">
                  <span className="text-outline">Chất liệu:</span>
                  <span className="font-medium text-primary dark:text-primary-fixed-dim">{product.material || 'Gỗ tự nhiên, Nệm vải bọc'}</span>
                </div>
                <div className="grid grid-cols-2 text-body-sm">
                  <span className="text-outline">Bảo hành:</span>
                  <span className="font-medium text-primary dark:text-primary-fixed-dim">12 tháng tại nhà</span>
                </div>
                <div className="grid grid-cols-2 text-body-sm">
                  <span className="text-outline">Tình trạng:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Còn hàng (Sẵn sàng giao)</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Quantity input */}
                <div className="flex items-center border border-outline-variant/60 rounded-lg bg-surface-container-low dark:bg-surface-container-high/10">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-surface-container-highest dark:hover:bg-surface-container/30 text-outline hover:text-on-surface transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-body-md text-primary dark:text-primary-fixed-dim min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-surface-container-highest dark:hover:bg-surface-container/30 text-outline hover:text-on-surface transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-secondary-container hover:bg-secondary text-white font-semibold text-label-md py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Thêm Vào Giỏ Hàng
                </button>
              </div>

              <div className="flex gap-3 text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 pt-2 justify-center md:justify-start">
                <button 
                  onClick={() => onToggleFavorite(product.id)}
                  className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-secondary' : ''}`} />
                  {isFavorite ? 'Đã yêu thích' : 'Yêu thích sản phẩm'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-outline-variant/25 mt-8 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-body-sm text-primary dark:text-primary-fixed-dim">Giao Hàng Miễn Phí</p>
              <p className="text-[11px] text-outline">Đơn hàng từ 1.000.000 ₫</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-body-sm text-primary dark:text-primary-fixed-dim">Đổi Trả Dễ Dàng</p>
              <p className="text-[11px] text-outline">Trong vòng 7 ngày đầu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-body-sm text-primary dark:text-primary-fixed-dim">Cam Kết Chính Hãng</p>
              <p className="text-[11px] text-outline">Bảo hành 100% chất lượng</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
