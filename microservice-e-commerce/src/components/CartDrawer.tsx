import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  onRemoveItem: (productId: number, color?: string, size?: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  // Helper to find matching variant
  const getMatchingVariant = (item: CartItem) => {
    if (!item.product.variants || !item.selectedColor || !item.selectedSize) return null;
    return item.product.variants.find(v => 
      v.color.toLowerCase() === item.selectedColor!.toLowerCase() &&
      v.size.toLowerCase() === item.selectedSize!.toLowerCase()
    );
  };

  const getItemPrice = (item: CartItem) => {
    const variant = getMatchingVariant(item);
    return variant ? variant.price : item.product.price;
  };

  const getItemImage = (item: CartItem) => {
    const variant = getMatchingVariant(item);
    return variant && variant.image ? variant.image : item.product.image;
  };

  // Calculate subtotal using variant prices
  const subtotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  // Format price in VND
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-surface-container-lowest dark:bg-tertiary-container shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-secondary" />
            <h2 className="font-display-serif text-2xl font-medium text-primary dark:text-primary-fixed-dim">
              Giỏ Hàng
            </h2>
            <span className="font-mono text-[10px] bg-surface-container-low dark:bg-surface-container-high px-2 py-0.5 rounded text-secondary font-bold">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-outline-variant/15">
          {cartItems.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-surface-container-low rounded-full text-outline/50">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-display-serif text-xl font-medium text-primary">
                  Giỏ hàng còn trống
                </p>
                <p className="text-xs text-on-surface-variant/80 mt-2 max-w-[220px] leading-relaxed">
                  Hãy lướt xem các danh mục và thêm những thiết kế bạn thích vào giỏ hàng nhé!
                </p>
              </div>
              <button 
                onClick={onClose}
                className="btn-push-outline text-xs font-mono tracking-wider px-5 py-2.5"
              >
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`} 
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Product image */}
                <div className="w-16 h-16 rounded overflow-hidden bg-surface-container-low flex-shrink-0 border border-outline-variant/10">
                  <img 
                    src={getItemImage(item)} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info and controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-display-serif text-base font-semibold text-primary dark:text-primary-fixed-dim line-clamp-1">
                        {item.product.name}
                      </h3>
                      <button 
                        onClick={() => onRemoveItem(item.product.id, item.selectedColor, item.selectedSize)}
                        className="text-outline hover:text-error transition-colors ml-2 p-0.5"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Show selected variants */}
                    {(item.selectedColor || item.selectedSize) && (
                      <div className="flex flex-wrap gap-1.5 mt-1 text-[9px] font-mono uppercase tracking-wider text-on-surface-variant/70">
                        {item.selectedColor && (
                          <span>Màu: {item.selectedColor}</span>
                        )}
                        {item.selectedColor && item.selectedSize && <span>•</span>}
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-outline-variant/30 rounded overflow-hidden bg-surface-container-lowest">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                        className="p-1 px-2 hover:bg-surface-container-low text-outline hover:text-on-surface transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-primary min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                        className="p-1 px-2 hover:bg-surface-container-low text-outline hover:text-on-surface transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-primary dark:text-primary-fixed">
                      {formatPrice(getItemPrice(item) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-outline-variant/15 bg-surface-container-low/20 dark:bg-tertiary-container/30 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                <span>Tạm tính</span>
                <span className="text-primary font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                <span>Vận chuyển</span>
                <span className="text-secondary font-bold">Miễn phí</span>
              </div>
              <div className="border-t border-outline-variant/10 pt-3 flex justify-between font-display-serif text-lg font-bold text-primary">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <button
              onClick={onCheckout}
              className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-3.5"
            >
              THANH TOÁN NGAY
            </button>
            <p className="text-center font-mono text-[9px] uppercase tracking-widest text-outline">
              Hỗ trợ thanh toán: Visa, Mastercard, Chuyển khoản ngân hàng.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
