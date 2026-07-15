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
  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

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
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-surface-container-lowest dark:bg-tertiary-container shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-secondary" />
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
              Giỏ Hàng Của Bạn
            </h2>
            <span className="bg-surface-container-high dark:bg-surface-container-low text-primary dark:text-primary-fixed text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-outline hover:bg-surface-container-highest dark:hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-surface-container-high dark:bg-surface-container-low rounded-full text-outline">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-body-lg text-primary dark:text-primary-fixed-dim">
                  Giỏ hàng còn trống
                </p>
                <p className="text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-1 max-w-[240px]">
                  Hãy lướt xem các danh mục và thêm những thiết kế bạn thích vào giỏ hàng nhé!
                </p>
              </div>
              <button 
                onClick={onClose}
                className="bg-primary dark:bg-secondary-container hover:bg-secondary text-white font-semibold text-label-md px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`} 
                className="flex gap-4 p-3 bg-surface-bright dark:bg-surface-container/20 rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 transition-all duration-200"
              >
                {/* Product image */}
                <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-surface-variant/40 flex-shrink-0">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info and controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-body-md text-primary dark:text-primary-fixed-dim line-clamp-1">
                        {item.product.name}
                      </h3>
                      {/* Show selected variants */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-outline">
                          {item.selectedColor && (
                            <span className="bg-surface-container-high dark:bg-surface-container-low px-1.5 py-0.5 rounded">
                              Màu: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="bg-surface-container-high dark:bg-surface-container-low px-1.5 py-0.5 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.product.id, item.selectedColor, item.selectedSize)}
                      className="text-outline hover:text-error dark:hover:text-red-400 p-1 transition-colors ml-2"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/50 truncate mt-1">
                    {item.product.material || 'Chất liệu cao cấp'}
                  </p>

                  <div className="flex justify-between items-end mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-outline-variant/50 rounded-lg overflow-hidden bg-surface-container-low dark:bg-surface-container-high/10">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                        className="p-1 px-2 hover:bg-surface-container-highest dark:hover:bg-surface-container/30 text-outline hover:text-on-surface transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-body-sm font-bold text-primary dark:text-primary-fixed-dim min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                        className="p-1 px-2 hover:bg-surface-container-highest dark:hover:bg-surface-container/30 text-outline hover:text-on-surface transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-body-md text-primary dark:text-primary-fixed">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-outline-variant/40 bg-surface-container-low/50 dark:bg-tertiary-container/50 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70">
                <span>Phí vận chuyển</span>
                <span className="text-secondary dark:text-secondary-fixed font-semibold">Miễn phí</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-3 flex justify-between text-body-lg font-bold text-primary dark:text-primary-fixed">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <button
              onClick={onCheckout}
              className="w-full bg-[#FF5F38] hover:bg-[#e04a25] text-white font-semibold text-label-md py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center block transform active:scale-95"
            >
              Thanh Toán Ngay
            </button>
            <p className="text-center text-[11px] text-outline">
              Hỗ trợ thanh toán: Visa, Mastercard, Chuyển khoản ngân hàng.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
