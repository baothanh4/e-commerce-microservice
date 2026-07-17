import React from 'react';
import { ShoppingBag, ChevronRight, Home, CreditCard } from 'lucide-react';
import type { CartItem, Order } from '../types';

interface OrderDetailPageProps {
  order: Order | null;
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'checkout' | 'order-detail') => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="min-h-screen bg-surface py-16 flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-12 h-12 text-outline/35 mb-4 animate-bounce" />
        <h2 className="font-display-serif text-xl font-medium text-primary">Không tìm thấy đơn hàng</h2>
        <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-2 mb-6">
          Vui lòng kiểm tra lại đường dẫn hoặc quay lại lịch sử mua hàng.
        </p>
        <button onClick={() => onNavigate('home')} className="btn-push px-6 py-2.5 font-mono text-xs text-white">
          QUAY LẠI TRANG CHỦ
        </button>
      </div>
    );
  }

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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto select-none animate-fadeIn">
      
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/75 mb-8">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">TRANG CHỦ</button>
        <ChevronRight className="w-3 h-3 text-outline/30" />
        <button onClick={() => onNavigate('profile')} className="hover:text-primary transition-colors">TÀI KHOẢN</button>
        <ChevronRight className="w-3 h-3 text-outline/30" />
        <span className="text-primary font-bold">CHI TIẾT ĐƠN HÀNG</span>
      </div>

      <div className="border border-outline-variant/15 rounded-lg bg-surface-container-lowest overflow-hidden">
        
        {/* Receipt Header Banner */}
        <div className="p-6 md:p-8 bg-surface-container-low/20 border-b border-outline-variant/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-mono text-[9px] uppercase tracking-wider mb-2 font-bold">
              Đặt hàng thành công
            </span>
            <h1 className="font-display-serif text-2xl font-semibold text-primary">
              Mã đơn: <span className="font-mono">{order.id}</span>
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-1.5">
              Ngày đặt: {order.createdAt}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Trạng thái vận chuyển</p>
            <p className="font-display-serif text-lg font-medium text-emerald-600 mt-0.5">
              {order.status === 'PENDING' ? 'Đang chuẩn bị hàng' :
               order.status === 'PROCESSING' ? 'Đang giao hàng' :
               order.status === 'COMPLETED' ? 'Đã giao thành công' : 'Đơn hàng đã hủy'}
            </p>
          </div>
        </div>

        {/* Recipient Details & Payment info blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-outline-variant/10">
          
          {/* Shipping details */}
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-outline-variant/10 space-y-4">
            <div className="flex items-center gap-2 text-primary font-display-serif font-semibold border-b border-outline-variant/10 pb-2">
              <Home className="w-4 h-4 text-secondary" />
              <span>Địa Chỉ Giao Hàng</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-on-surface-variant/90 leading-relaxed">
              <p><span className="font-bold text-primary">Người nhận:</span> {order.receiverName}</p>
              <p><span className="font-bold text-primary">Điện thoại:</span> {order.phoneNumber}</p>
              <p className="flex"><span className="font-bold text-primary shrink-0 mr-1.5">Địa chỉ:</span> <span>{order.address}</span></p>
            </div>
          </div>

          {/* Payment Method details */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-primary font-display-serif font-semibold border-b border-outline-variant/10 pb-2">
              <CreditCard className="w-4 h-4 text-secondary" />
              <span>Phương Thức Thanh Toán</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-on-surface-variant/90 leading-relaxed">
              <p>
                <span className="font-bold text-primary">Hình thức:</span>{' '}
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thẻ ngân hàng'}
              </p>
              {order.paymentMethod === 'CARD' && order.cardInfo && (
                <>
                  <p><span className="font-bold text-primary">Số thẻ:</span> {order.cardInfo.cardNumber}</p>
                  <p><span className="font-bold text-primary">Chủ thẻ:</span> {order.cardInfo.cardName}</p>
                </>
              )}
              <p>
                <span className="font-bold text-primary">Trạng thái thanh toán:</span>{' '}
                {order.paymentMethod === 'CARD' ? (
                  <span className="text-emerald-600 font-bold">Đã thanh toán qua cổng thẻ</span>
                ) : (
                  <span className="text-[#FF5F38] font-bold">Chờ thanh toán khi nhận hàng</span>
                )}
              </p>
            </div>
          </div>

        </div>

        {/* Itemized Products purchased table */}
        <div className="p-6 md:p-8">
          <h2 className="font-display-serif text-lg font-semibold text-primary mb-4">
            Danh Sách Sản Phẩm
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/15">
                  <th className="py-3 px-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Sản phẩm</th>
                  <th className="py-3 px-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">SKU</th>
                  <th className="py-3 px-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold text-center">Đơn giá</th>
                  <th className="py-3 px-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold text-center">Số lượng</th>
                  <th className="py-3 px-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {order.items.map((item) => (
                  <tr key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`}>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img src={getItemImage(item)} alt={item.product.name} className="w-12 h-12 object-cover rounded border border-outline-variant/10 flex-shrink-0" />
                      <div>
                        <h4 className="font-display-serif text-sm font-semibold text-primary line-clamp-1">{item.product.name}</h4>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-0.5">
                            {item.selectedColor && `Màu: ${item.selectedColor}`} {item.selectedColor && item.selectedSize && '•'} {item.selectedSize && `Size: ${item.selectedSize}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-on-surface-variant/80">
                      {getMatchingVariant(item)?.sku || item.product.sku || 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-center text-primary">
                      {formatPrice(getItemPrice(item))}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-center text-primary font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-right text-primary font-bold">
                      {formatPrice(getItemPrice(item) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing calculations breakdown */}
          <div className="border-t border-outline-variant/15 mt-6 pt-4 flex flex-col items-end space-y-2">
            <div className="w-full max-w-xs space-y-2 font-mono text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="text-primary font-bold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển:</span>
                <span className="text-secondary font-bold">Miễn phí</span>
              </div>
              <div className="border-t border-outline-variant/10 pt-2 flex justify-between font-display-serif text-lg font-bold text-primary">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Return navigation */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => onNavigate('home')} 
          className="btn-push-outline px-8 py-3 text-xs font-mono tracking-wider"
        >
          TIẾP TỤC MUA SẮM
        </button>
      </div>

    </div>
  );
};
