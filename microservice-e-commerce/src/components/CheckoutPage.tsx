import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import type { CartItem, Order } from '../types';

interface CheckoutPageProps {
  cartItems: CartItem[];
  currentUser: { name: string; email: string; token: string; role: string } | null;
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'checkout' | 'order-detail') => void;
  onPlaceOrder: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  currentUser,
  onNavigate,
  onPlaceOrder,
}) => {
  const [receiverName, setReceiverName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const subtotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('http://localhost:8080/users/provinces');
        if (response.ok) {
          const data = await response.json();
          setProvinces(data);
        }
      } catch (err) {
        try {
          const response = await fetch('http://localhost:8081/users/provinces');
          if (response.ok) {
            const data = await response.json();
            setProvinces(data);
          }
        } catch (err2) {
          console.error(err2);
        }
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards when province changes
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/provinces/${provinceCode}/wards`);
        if (response.ok) {
          const data = await response.json();
          setWards(data);
        }
      } catch (err) {
        try {
          const response = await fetch(`http://localhost:8081/users/provinces/${provinceCode}/wards`);
          if (response.ok) {
            const data = await response.json();
            setWards(data);
          }
        } catch (err2) {
          console.error(err2);
        }
      }
    };
    fetchWards();
  }, [provinceCode]);

  // Load default address if logged in
  useEffect(() => {
    if (!currentUser) return;

    const loadUserDataAndAddresses = async () => {
      try {
        // Step 1: fetch profile to get user details
        const profileRes = await fetch('http://localhost:8080/auth/profile', {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!profileRes.ok) {
          // If profile fetch fails, fallback to currentUser state details
          setReceiverName(currentUser.name || '');
          return;
        }
        const profileData = await profileRes.json();
        
        // Immediately fill name and phone from profile data
        setReceiverName(profileData.name || currentUser.name || '');
        setPhone(profileData.phone || '');

        const userId = profileData.id;
        if (!userId) return;

        // Step 2: Try loading addresses from profile response or endpoints safely
        let addressesList = profileData.addresses || [];
        
        if (addressesList.length === 0) {
          try {
            const addrRes = await fetch(`http://localhost:8080/users/${userId}/addresses`);
            if (addrRes.ok) {
              addressesList = await addrRes.json();
            } else {
              const addrResFallback = await fetch(`http://localhost:8081/users/${userId}/addresses`);
              if (addrResFallback.ok) {
                addressesList = await addrResFallback.json();
              }
            }
          } catch (addrErr) {
            console.warn("Addresses endpoint not available, using default profile info:", addrErr);
          }
        }

        // Step 3: find default address to overwrite details if found
        const defaultAddr = addressesList.find((a: any) => a.default) || addressesList[0];
        if (defaultAddr) {
          setReceiverName(defaultAddr.receiverName || profileData.name || currentUser.name || '');
          setPhone(defaultAddr.phoneNumber || profileData.phone || '');
          setProvinceCode(defaultAddr.province?.code || '');
          // Delay ward code selection slightly to allow wards options list to finish fetching
          setTimeout(() => {
            setWardCode(defaultAddr.ward?.code || '');
          }, 300);
          setAddressDetail(defaultAddr.addressDetail || '');
        }
      } catch (err) {
        console.error("Error auto-filling checkout address:", err);
      }
    };

    loadUserDataAndAddresses();
  }, [currentUser]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!receiverName.trim()) errors.receiverName = 'Vui lòng nhập tên người nhận';
    if (!phone.trim() || !/^[\d\s+()-]{8,15}$/.test(phone)) errors.phone = 'Số điện thoại không hợp lệ';
    if (!provinceCode) errors.province = 'Vui lòng chọn tỉnh thành';
    if (!wardCode) errors.ward = 'Vui lòng chọn xã phường';
    if (!addressDetail.trim()) errors.addressDetail = 'Vui lòng nhập số nhà, ngõ, đường';

    if (paymentMethod === 'CARD') {
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, '').length !== 16) {
        errors.cardNumber = 'Số thẻ gồm 16 chữ số';
      }
      if (!cardName.trim()) errors.cardName = 'Tên chủ thẻ không được trống';
      if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errors.cardExpiry = 'Định dạng MM/YY';
      }
      if (!cardCvv.trim() || cardCvv.length !== 3) {
        errors.cardCvv = 'Mã bảo mật gồm 3 chữ số';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const selectedProvince = provinces.find(p => p.code === provinceCode)?.fullName || '';
    const selectedWard = wards.find(w => w.code === wardCode)?.fullName || '';
    const fullAddress = `${addressDetail}, ${selectedWard}, ${selectedProvince}`;

    const newOrder: Order = {
      id: 'LXC-' + Date.now().toString().slice(-6),
      items: cartItems,
      subtotal,
      total: subtotal,
      receiverName,
      phoneNumber: phone,
      address: fullAddress,
      paymentMethod,
      cardInfo: paymentMethod === 'CARD' ? {
        cardNumber: '**** **** **** ' + cardNumber.slice(-4),
        cardName: cardName.toUpperCase(),
        expiryDate: cardExpiry,
      } : undefined,
      status: 'PENDING',
      createdAt: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTimeout(() => {
      onPlaceOrder(newOrder);
      setIsLoading(false);
    }, 1200);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto select-none">
      {/* Header back link */}
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại cửa hàng</span>
      </button>

      <h1 className="font-display-serif text-3xl md:text-4xl font-medium text-primary mb-1">
        Thanh Toán
      </h1>
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75 mb-10 pb-4 border-b border-outline-variant/15">
        Hoàn tất thông tin đặt hàng nội thất cao cấp
      </p>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded border border-outline-variant/15">
          <ShoppingBag className="w-12 h-12 mx-auto text-outline/35 mb-4" />
          <h2 className="font-display-serif text-xl font-medium text-primary">Giỏ hàng trống</h2>
          <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-2 mb-6">
            Thêm sản phẩm vào giỏ để tiến hành đặt hàng.
          </p>
          <button onClick={() => onNavigate('products')} className="btn-push px-6 py-2.5 font-mono text-xs text-white">
            XEM SẢN PHẨM
          </button>
        </div>
      ) : (
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Shipping Form & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {/* Delivery Section */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-6 space-y-5">
              <h2 className="font-display-serif text-lg font-semibold text-primary border-b border-outline-variant/10 pb-2.5">
                Thông Tin Giao Hàng
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                      Tên Người Nhận *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={receiverName}
                      onChange={(e) => {
                        setReceiverName(e.target.value);
                        if (formErrors.receiverName) setFormErrors(prev => ({ ...prev, receiverName: '' }));
                      }}
                      className={`w-full bg-surface border rounded px-3 py-2 font-mono text-xs text-on-surface outline-none transition-all ${
                        formErrors.receiverName ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                      }`}
                    />
                    {formErrors.receiverName && <p className="text-error font-mono text-[9px] uppercase tracking-wider">{formErrors.receiverName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                      Số Điện Thoại Nhận Hàng *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full bg-surface border rounded px-3 py-2 font-mono text-xs text-on-surface outline-none transition-all ${
                        formErrors.phone ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                      }`}
                    />
                    {formErrors.phone && <p className="text-error font-mono text-[9px] uppercase tracking-wider">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                      Tỉnh / Thành Phố *
                    </label>
                    <select
                      value={provinceCode}
                      onChange={(e) => {
                        setProvinceCode(e.target.value);
                        setWardCode('');
                        if (formErrors.province) setFormErrors(prev => ({ ...prev, province: '' }));
                      }}
                      required
                      className={`w-full bg-surface border rounded px-3 py-2 font-mono text-xs text-on-surface outline-none transition-all cursor-pointer ${
                        formErrors.province ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                      }`}
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.fullName}</option>
                      ))}
                    </select>
                    {formErrors.province && <p className="text-error font-mono text-[9px] uppercase tracking-wider">{formErrors.province}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                      Xã / Phường / Thị Trấn *
                    </label>
                    <select
                      value={wardCode}
                      onChange={(e) => {
                        setWardCode(e.target.value);
                        if (formErrors.ward) setFormErrors(prev => ({ ...prev, ward: '' }));
                      }}
                      required
                      disabled={!provinceCode}
                      className={`w-full bg-surface border rounded px-3 py-2 font-mono text-xs text-on-surface outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        formErrors.ward ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                      }`}
                    >
                      <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.fullName}</option>
                      ))}
                    </select>
                    {formErrors.ward && <p className="text-error font-mono text-[9px] uppercase tracking-wider">{formErrors.ward}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                    Địa Chỉ Chi Tiết *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, ngõ, tên đường..."
                    value={addressDetail}
                    onChange={(e) => {
                      setAddressDetail(e.target.value);
                      if (formErrors.addressDetail) setFormErrors(prev => ({ ...prev, addressDetail: '' }));
                    }}
                    className={`w-full bg-surface border rounded px-3 py-2 font-mono text-xs text-on-surface outline-none transition-all ${
                      formErrors.addressDetail ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                    }`}
                  />
                  {formErrors.addressDetail && <p className="text-error font-mono text-[9px] uppercase tracking-wider">{formErrors.addressDetail}</p>}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-6 space-y-5">
              <h2 className="font-display-serif text-lg font-semibold text-primary border-b border-outline-variant/10 pb-2.5">
                Phương Thức Thanh Toán
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* COD Select */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'COD'
                      ? 'bg-secondary/5 border-secondary'
                      : 'bg-surface border-outline-variant/30 hover:border-outline-variant/80'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-primary">COD</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-secondary' : 'border-outline/40'
                    }`}>
                      {paymentMethod === 'COD' && <span className="w-1.5 h-1.5 bg-secondary rounded-full" />}
                    </span>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/80 leading-relaxed">
                    Thanh toán bằng tiền mặt khi giao hàng tận nơi.
                  </p>
                </button>

                {/* Credit Card Select */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'CARD'
                      ? 'bg-secondary/5 border-secondary'
                      : 'bg-surface border-outline-variant/30 hover:border-outline-variant/80'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-primary">Thẻ ngân hàng</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'CARD' ? 'border-secondary' : 'border-outline/40'
                    }`}>
                      {paymentMethod === 'CARD' && <span className="w-1.5 h-1.5 bg-secondary rounded-full" />}
                    </span>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/80 leading-relaxed">
                    Hỗ trợ thẻ nội địa và thẻ quốc tế Visa/Mastercard.
                  </p>
                </button>
              </div>

              {/* CARD sub-form details */}
              {paymentMethod === 'CARD' && (
                <div className="p-5 border border-outline-variant/15 rounded bg-surface-container-low/20 space-y-4 animate-fadeIn">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-primary">
                    Thông Tin Thẻ Thanh Toán
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                        Số Thẻ *
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4211 2234 5567 8890"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format with spaces
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setCardNumber(formatted);
                          if (formErrors.cardNumber) setFormErrors(prev => ({ ...prev, cardNumber: '' }));
                        }}
                        className={`w-full bg-surface border rounded px-3 py-1.5 font-mono text-xs text-on-surface outline-none transition-all ${
                          formErrors.cardNumber ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                        }`}
                      />
                      {formErrors.cardNumber && <p className="text-error font-mono text-[8px] uppercase tracking-wider">{formErrors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                        Tên Chủ Thẻ *
                      </label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={cardName}
                        onChange={(e) => {
                          setCardName(e.target.value.toUpperCase());
                          if (formErrors.cardName) setFormErrors(prev => ({ ...prev, cardName: '' }));
                        }}
                        className={`w-full bg-surface border rounded px-3 py-1.5 font-mono text-xs text-on-surface outline-none transition-all ${
                          formErrors.cardName ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                        }`}
                      />
                      {formErrors.cardName && <p className="text-error font-mono text-[8px] uppercase tracking-wider">{formErrors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                          Ngày Hết Hạn *
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) {
                              val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            }
                            setCardExpiry(val);
                            if (formErrors.cardExpiry) setFormErrors(prev => ({ ...prev, cardExpiry: '' }));
                          }}
                          className={`w-full bg-surface border rounded px-3 py-1.5 font-mono text-xs text-on-surface outline-none transition-all ${
                            formErrors.cardExpiry ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                          }`}
                        />
                        {formErrors.cardExpiry && <p className="text-error font-mono text-[8px] uppercase tracking-wider">{formErrors.cardExpiry}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                          Mã Bảo Mật (CVV) *
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, ''));
                            if (formErrors.cardCvv) setFormErrors(prev => ({ ...prev, cardCvv: '' }));
                          }}
                          className={`w-full bg-surface border rounded px-3 py-1.5 font-mono text-xs text-on-surface outline-none transition-all ${
                            formErrors.cardCvv ? 'border-error' : 'border-outline-variant/35 focus:border-secondary'
                          }`}
                        />
                        {formErrors.cardCvv && <p className="text-error font-mono text-[8px] uppercase tracking-wider">{formErrors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-6 space-y-6">
            <h2 className="font-display-serif text-lg font-semibold text-primary border-b border-outline-variant/10 pb-2.5">
              Đơn Hàng Của Bạn
            </h2>

            {/* List items */}
            <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-12 h-12 rounded overflow-hidden border border-outline-variant/10 bg-surface flex-shrink-0">
                    <img src={getItemImage(item)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display-serif text-sm font-semibold text-primary truncate">
                      {item.product.name}
                    </h3>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-0.5">
                      SL: {item.quantity} {item.selectedColor && `• Màu: ${item.selectedColor}`} {item.selectedSize && `• Size: ${item.selectedSize}`}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {formatPrice(getItemPrice(item) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotals breakdown */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-2">
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
                <span>Tạm tính</span>
                <span className="text-primary font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
                <span>Phí vận chuyển</span>
                <span className="text-secondary font-bold">Miễn phí</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-3 flex justify-between font-display-serif text-lg font-bold text-primary">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>ĐANG XỬ LÝ ĐƠN HÀNG...</span>
              ) : (
                <span>ĐẶT HÀNG NGAY</span>
              )}
            </button>

            <p className="text-center font-mono text-[8px] uppercase tracking-widest text-outline">
              Bằng việc bấm đặt hàng, bạn đồng ý với các chính sách vận chuyển &amp; hoàn tiền của LuxeCommerce.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
