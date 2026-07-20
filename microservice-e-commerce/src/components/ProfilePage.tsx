import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, MapPin, LogOut, ArrowRight, Plus, Trash2, Edit, ShoppingBag, Package, Search, Calendar, Eye, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { Order } from '../types';

const CANCELLATION_REASONS = [
  'Tôi muốn thay đổi địa chỉ giao hàng / số điện thoại',
  'Tôi muốn thay đổi mã giảm giá / phương thức thanh toán / mặt hàng',
  'Tôi không còn nhu cầu mua nữa',
  'Tìm thấy nơi khác có giá tốt hơn',
  'Lý do khác'
];

interface ProfilePageProps {
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'checkout' | 'order-detail') => void;
  currentUser: { name: string; email: string; token: string; role: string } | null;
  onLogout: () => void;
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onNavigate, 
  currentUser, 
  onLogout,
  orders,
  onViewOrder
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address & Navigation states
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Cancellation Modal states
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>(CANCELLATION_REASONS[0]);
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('HOME');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  const fetchProvinces = async () => {
    try {
      const response = await fetch('http://localhost:8080/users/provinces');
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tỉnh thành:", err);
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

  useEffect(() => {
    if (!selectedProvinceCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/provinces/${selectedProvinceCode}/wards`);
        if (response.ok) {
          const data = await response.json();
          setWards(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách xã phường:", err);
        try {
          const response = await fetch(`http://localhost:8081/users/provinces/${selectedProvinceCode}/wards`);
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
  }, [selectedProvinceCode]);

  const loadAddresses = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8080/users/${userId}/addresses`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (err) {
      try {
        const response = await fetch(`http://localhost:8081/users/${userId}/addresses`);
        if (response.ok) {
          const data = await response.json();
          setAddresses(data);
        }
      } catch (err2) {
        console.error(err2);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const payload = {
      receiverName,
      phoneNumber: addressPhone,
      addressDetail,
      isDefault: isDefaultAddress,
      label: addressLabel,
      province: { code: selectedProvinceCode },
      ward: { code: selectedWardCode }
    };

    try {
      const url = currentAddressId 
        ? `http://localhost:8080/users/${userId}/addresses/${currentAddressId}`
        : `http://localhost:8080/users/${userId}/addresses`;
      const method = currentAddressId ? 'PUT' : 'POST';

      let response;
      try {
        response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        const fallbackUrl = currentAddressId 
          ? `http://localhost:8081/users/${userId}/addresses/${currentAddressId}`
          : `http://localhost:8081/users/${userId}/addresses`;
        response = await fetch(fallbackUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setIsAddressFormOpen(false);
        resetAddressForm();
        loadAddresses();
        setMessage({ type: 'success', text: currentAddressId ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!' });
      } else {
        const errMsg = await response.text();
        setMessage({ type: 'error', text: 'Thao tác thất bại: ' + errMsg });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!userId || !window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      const url = `http://localhost:8080/users/${userId}/addresses/${addressId}`;
      let response;
      try {
        response = await fetch(url, { method: 'DELETE' });
      } catch (err) {
        response = await fetch(`http://localhost:8081/users/${userId}/addresses/${addressId}`, { method: 'DELETE' });
      }

      if (response.ok) {
        loadAddresses();
        setMessage({ type: 'success', text: 'Xóa địa chỉ thành công!' });
      } else {
        const errMsg = await response.text();
        setMessage({ type: 'error', text: 'Xóa thất bại: ' + errMsg });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    }
  };

  const startEditAddress = (addr: any) => {
    setCurrentAddressId(addr.id);
    setReceiverName(addr.receiverName);
    setAddressPhone(addr.phoneNumber);
    setSelectedProvinceCode(addr.province.code);
    setSelectedWardCode(addr.ward.code);
    setAddressDetail(addr.addressDetail);
    setIsDefaultAddress(addr.default);
    setAddressLabel(addr.label || 'HOME');
    setIsEditingAddress(true);
    setIsAddressFormOpen(true);
  };

  const resetAddressForm = () => {
    setCurrentAddressId(null);
    setReceiverName('');
    setAddressPhone('');
    setSelectedProvinceCode('');
    setSelectedWardCode('');
    setAddressDetail('');
    setIsDefaultAddress(false);
    setAddressLabel('HOME');
  };

  const handleOpenCancelModal = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status === 'PROCESSING') {
      alert('Đơn hàng đã được duyệt và đang trong quá trình vận chuyển. Bạn không thể tự hủy đơn. Vui lòng liên hệ bộ phận hỗ trợ khách hàng!');
      return;
    }
    if (order.status === 'COMPLETED') {
      alert('Đơn hàng đã hoàn thành, không thể hủy!');
      return;
    }
    setCancelModalOrder(order);
    setCancelReasonOption(CANCELLATION_REASONS[0]);
    setCustomCancelReason('');
  };

  useEffect(() => {
    if (cancelModalOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cancelModalOrder]);

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setIsCancelling(true);

    const finalReason = cancelReasonOption === 'Lý do khác' 
      ? (customCancelReason.trim() || 'Lý do khác')
      : cancelReasonOption;

    try {
      const response = await fetch(`http://localhost:8080/users/orders/${cancelModalOrder.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setMessage({ type: 'success', text: `Đã hủy thành công đơn hàng #${cancelModalOrder.id}` });
        
        cancelModalOrder.status = 'CANCELLED';
        cancelModalOrder.cancelReason = updatedData.cancelReason || finalReason;
        cancelModalOrder.cancelledAt = updatedData.cancelledAt || new Date().toLocaleString('vi-VN');

        // Sync to localStorage cache
        try {
          const localRaw = localStorage.getItem('luxe_orders');
          if (localRaw) {
            const localOrders: Order[] = JSON.parse(localRaw);
            const updatedLocal = localOrders.map(o => o.id === cancelModalOrder.id ? {
              ...o,
              status: 'CANCELLED' as const,
              cancelReason: cancelModalOrder.cancelReason,
              cancelledAt: cancelModalOrder.cancelledAt
            } : o);
            localStorage.setItem('luxe_orders', JSON.stringify(updatedLocal));
          }
        } catch (e) {
          console.warn('Lỗi lưu localStorage:', e);
        }

        setCancelModalOrder(null);
      } else {
        const errText = await response.text();
        alert('Cập nhật trạng thái hủy đơn lên Server thất bại: ' + errText);
        setMessage({ type: 'error', text: 'Hủy đơn thất bại: ' + errText });
      }
    } catch (err: any) {
      alert('Không thể kết nối Server để hủy đơn: ' + err.message);
      setMessage({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setIsCancelling(false);
    }
  };

  // Load addresses and provinces when tab changes to addresses
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchProvinces();
      if (userId) {
        loadAddresses();
      }
    }
  }, [activeTab, userId]);

  // Fetch user profile on mount
  useEffect(() => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });

        if (response.ok) {
          const data: any = await response.json();
          setUserId(data.id || null);
          setAddresses(data.addresses || []);
          setName(data.name || '');
          setPhone(data.phone || '');
          setDob(data.dob || '');
          setGender(data.gender ? data.gender.toLowerCase() : 'prefer_not_to_say');
        } else {
          setMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ' });
        }
      } catch (error: any) {
        console.error(error);
        setMessage({ type: 'error', text: 'Lỗi kết nối đến server: ' + error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, onNavigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsUpdating(true);
    setMessage(null);

    const payload = {
      name,
      email: currentUser.email,
      phone: phone || null,
      dob: dob || null,
      gender: gender === 'prefer_not_to_say' ? null : gender.toUpperCase()
    };

    try {
      const response = await fetch('http://localhost:8080/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data: UserProfile = await response.json();
        setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        
        // Also update stored name in localStorage
        const savedUserStr = localStorage.getItem('currentUser');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          savedUser.name = data.name;
          localStorage.setItem('currentUser', JSON.stringify(savedUser));
        }
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: 'Cập nhật thất bại: ' + (data.message || 'Lỗi không xác định') });
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Lỗi kết nối: ' + error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="flex flex-col md:flex-row w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter relative select-none animate-fadeIn">
        
        {/* Left Side Navigation (Desktop/Tablet) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-5 self-start">
          <div className="pb-5 mb-5 border-b border-outline-variant/15 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border border-outline-variant/20 bg-surface-container-low flex items-center justify-center text-primary text-xl font-display-serif font-medium shadow-sm mb-3">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="font-display-serif text-lg font-medium text-primary">
              {name || currentUser.name}
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/75 mt-1">
              {currentUser.email}
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left w-full transition-colors ${
                activeTab === 'profile'
                  ? 'bg-secondary/5 text-secondary font-bold font-mono text-[10px] uppercase tracking-wider border-l-2 border-secondary'
                  : 'text-on-surface-variant/80 font-mono text-[10px] uppercase tracking-wider hover:bg-surface-container-low'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hồ sơ cá nhân</span>
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left w-full transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-secondary/5 text-secondary font-bold font-mono text-[10px] uppercase tracking-wider border-l-2 border-secondary'
                  : 'text-on-surface-variant/80 font-mono text-[10px] uppercase tracking-wider hover:bg-surface-container-low'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Sổ địa chỉ</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-3 py-2.5 rounded text-left w-full transition-colors ${
                activeTab === 'orders'
                  ? 'bg-secondary/5 text-secondary font-bold font-mono text-[10px] uppercase tracking-wider border-l-2 border-secondary'
                  : 'text-on-surface-variant/80 font-mono text-[10px] uppercase tracking-wider hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Lịch sử đơn hàng</span>
              </div>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 font-mono text-[9px] bg-secondary/10 text-secondary rounded-full font-bold">
                  {orders.length}
                </span>
              )}
            </button>
            
            <div className="pt-4 mt-2 border-t border-outline-variant/15">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-error hover:bg-error/5 rounded text-left transition-all font-semibold font-mono text-[10px] uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-8">
          <div className="border-b border-outline-variant/15 pb-4">
            <h1 className="font-display-serif text-3xl font-medium text-primary mb-1">
              Tài Khoản
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75">
              Quản lý thông tin cá nhân và thiết lập tài khoản
            </p>
          </div>

          {isLoading ? (
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-12 flex justify-center items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-outline">ĐANG TẢI...</span>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <>
                  {/* Form Section */}
                  <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-6 md:p-8 relative overflow-hidden">
                    <h2 className="font-display-serif text-xl font-medium text-primary mb-6 border-b border-outline-variant/10 pb-3">
                      Thông Tin Cá Nhân
                    </h2>

                    {message && (
                      <div className={`mb-6 p-3 border rounded-md font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn ${
                        message.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : 'bg-error-container/20 border-error/20 text-error'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-error'}`} />
                        <span>{message.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="fullName">
                          Họ và Tên
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="email">
                          Địa Chỉ Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={currentUser.email}
                          readOnly
                          disabled
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-md px-3.5 py-2.5 font-mono text-xs text-outline cursor-not-allowed outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="phone">
                          Số Điện Thoại
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+84 912 345 678"
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="dob">
                          Ngày Sinh
                        </label>
                        <input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold mb-3">
                          Giới tính
                        </label>
                        <div className="flex flex-wrap items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              name="gender"
                              type="radio"
                              value="male"
                              checked={gender === 'male'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-4 h-4 text-secondary focus:ring-secondary/20 bg-transparent border-outline-variant"
                            />
                            <span className="font-mono text-xs text-on-surface uppercase tracking-wider">Nam</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              name="gender"
                              type="radio"
                              value="female"
                              checked={gender === 'female'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-4 h-4 text-secondary focus:ring-secondary/20 bg-transparent border-outline-variant"
                            />
                            <span className="font-mono text-xs text-on-surface uppercase tracking-wider">Nữ</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              name="gender"
                              type="radio"
                              value="prefer_not_to_say"
                              checked={gender === 'prefer_not_to_say' || gender === 'other'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-4 h-4 text-secondary focus:ring-secondary/20 bg-transparent border-outline-variant"
                            />
                            <span className="font-mono text-xs text-on-surface uppercase tracking-wider">Khác</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="btn-push text-white font-mono text-xs uppercase tracking-widest px-6 py-3"
                        >
                          {isUpdating ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT HỒ SƠ'}
                        </button>
                      </div>
                    </form>
                  </section>

                  {/* Recent Orders Section */}
                  <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-outline-variant/15">
                      <h2 className="font-display-serif text-xl font-medium text-primary">Đơn Hàng Gần Đây</h2>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="font-mono text-[9px] uppercase tracking-widest text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant/15">
                            <th className="py-3 px-6 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Mã đơn</th>
                            <th className="py-3 px-6 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Ngày đặt</th>
                            <th className="py-3 px-6 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Trạng thái</th>
                            <th className="py-3 px-6 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold text-right">Tổng tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 font-mono text-xs">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-outline">
                                BẠN CHƯA CÓ ĐƠN HÀNG NÀO.
                              </td>
                            </tr>
                          ) : (
                            orders.slice(0, 5).map((order) => (
                              <tr 
                                key={order.id} 
                                onClick={() => onViewOrder(order)}
                                className="hover:bg-surface-container-low transition-colors cursor-pointer"
                              >
                                <td className="py-4 px-6 font-semibold text-primary">#{order.id}</td>
                                <td className="py-4 px-6 text-on-surface-variant/80">{order.createdAt.split(',')[0]}</td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                                    order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                                    order.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-600' :
                                    order.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                                    'bg-amber-500/10 text-[#FF5F38]'
                                  }`}>
                                    {order.status === 'COMPLETED' ? 'Đã giao' :
                                     order.status === 'PROCESSING' ? 'Đang giao' :
                                     order.status === 'CANCELLED' ? 'Đã hủy' : 'Đang xử lý'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-semibold text-right text-primary">
                                  {order.total.toLocaleString('vi-VN')} ₫
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'orders' && (
                <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-6 md:p-8 relative overflow-hidden animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-outline-variant/10 pb-4">
                    <div>
                      <h2 className="font-display-serif text-2xl font-medium text-primary flex items-center gap-2">
                        <Package className="w-6 h-6 text-secondary" />
                        Lịch Sử Đơn Hàng
                      </h2>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75 mt-1">
                        Quản lý và theo dõi thông tin tất cả đơn hàng đã mua ({orders.length} đơn hàng)
                      </p>
                    </div>

                    {/* Search Box */}
                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                      <input
                        type="text"
                        placeholder="Tìm mã đơn hoặc sản phẩm..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/35 focus:border-secondary rounded-md pl-9 pr-3 py-2 font-mono text-xs text-on-surface outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-outline-variant/15 pb-3">
                    {[
                      { key: 'ALL', label: 'Tất cả' },
                      { key: 'PROCESSING', label: 'Đang xử lý / Giao hàng' },
                      { key: 'COMPLETED', label: 'Đã hoàn thành' },
                      { key: 'CANCELLED', label: 'Đã hủy' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setOrderStatusFilter(tab.key as any)}
                        className={`px-3.5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all font-semibold cursor-pointer ${
                          orderStatusFilter === tab.key
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-container-low text-on-surface-variant/80 hover:bg-surface-container-high'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Orders List */}
                  {(() => {
                    const filteredOrders = orders.filter((order) => {
                      if (orderStatusFilter === 'PROCESSING' && !(order.status === 'PROCESSING' || order.status === 'PENDING')) return false;
                      if (orderStatusFilter === 'COMPLETED' && order.status !== 'COMPLETED') return false;
                      if (orderStatusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false;

                      if (orderSearchQuery.trim()) {
                        const query = orderSearchQuery.toLowerCase().trim();
                        const matchesId = order.id.toLowerCase().includes(query);
                        const matchesReceiver = order.receiverName?.toLowerCase().includes(query);
                        const matchesItem = order.items?.some(i => i.product.name.toLowerCase().includes(query));
                        return matchesId || matchesReceiver || matchesItem;
                      }

                      return true;
                    });

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="text-center py-16 px-4">
                          <ShoppingBag className="w-12 h-12 mx-auto text-outline/30 mb-3 animate-pulse" />
                          <h3 className="font-display-serif text-lg font-medium text-primary">Không tìm thấy đơn hàng nào</h3>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-outline mt-1 mb-6">
                            {orders.length === 0 
                              ? 'Bạn chưa thực hiện đơn hàng nào trên LuxeCommerce.' 
                              : 'Không có đơn hàng nào phù hợp với bộ lọc đã chọn.'}
                          </p>
                          {orders.length === 0 && (
                            <button
                              onClick={() => onNavigate('products')}
                              className="btn-push text-white font-mono text-xs uppercase tracking-widest px-6 py-2.5 cursor-pointer"
                            >
                              KHÁM PHÁ SẢN PHẨM NGAY
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {filteredOrders.map((order) => {
                          const isCompleted = order.status === 'COMPLETED';
                          const isCancelled = order.status === 'CANCELLED';
                          const isProcessing = order.status === 'PROCESSING' || order.status === 'PENDING';

                          return (
                            <div 
                              key={order.id} 
                              className="border border-outline-variant/20 rounded-lg bg-surface-container-lowest hover:border-outline-variant/50 transition-all overflow-hidden shadow-sm"
                            >
                              {/* Order Card Header */}
                              <div className="bg-surface-container-low/40 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-3 border-b border-outline-variant/15">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-bold text-primary">#{order.id}</span>
                                  <span className="text-outline/40">•</span>
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/75 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-outline" /> {order.createdAt}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold ${
                                    isCompleted ? 'bg-emerald-500/10 text-emerald-600' :
                                    isProcessing ? 'bg-blue-500/10 text-blue-600' :
                                    isCancelled ? 'bg-error/10 text-error' :
                                    'bg-amber-500/10 text-[#FF5F38]'
                                  }`}>
                                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                    {isProcessing && <Clock className="w-3 h-3" />}
                                    {isCancelled && <XCircle className="w-3 h-3" />}
                                    {isCompleted ? 'Đã giao thành công' :
                                     order.status === 'PROCESSING' ? 'Đang vận chuyển' :
                                     isCancelled ? 'Đã hủy' : 'Đang chờ xử lý'}
                                  </span>
                                </div>
                              </div>

                              {/* Order Items List */}
                              <div className="p-4 sm:p-6 divide-y divide-outline-variant/10">
                                {(() => {
                                  const itemMap = new Map<string, any>();
                                  for (const item of order.items || []) {
                                    const key = `${item.product?.id || item.product?.name}_${item.selectedColor || ''}_${item.selectedSize || ''}`;
                                    if (itemMap.has(key)) {
                                      const existing = itemMap.get(key);
                                      existing.quantity += item.quantity;
                                    } else {
                                      itemMap.set(key, { ...item });
                                    }
                                  }
                                  const uniqueItems = Array.from(itemMap.values());

                                  return uniqueItems.map((item, idx) => (
                                    <div key={`${order.id}-item-${idx}`} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                      <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-outline-variant/20 bg-white dark:bg-surface-container-low p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                                          <img 
                                            src={item.product.image || 'https://via.placeholder.com/300'} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-contain object-center rounded transition-transform hover:scale-105"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div>
                                          <h4 className="font-display-serif text-sm font-semibold text-primary line-clamp-1">{item.product.name}</h4>
                                          {(item.selectedColor || item.selectedSize) && (
                                            <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/75 mt-0.5">
                                              {item.selectedColor && `Màu: ${item.selectedColor}`} {item.selectedColor && item.selectedSize && '•'} {item.selectedSize && `Size: ${item.selectedSize}`}
                                            </p>
                                          )}
                                          <p className="font-mono text-xs text-outline mt-1">
                                            Số lượng: <span className="font-bold text-primary">{item.quantity}</span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right self-end sm:self-center">
                                        <p className="font-mono text-xs font-semibold text-primary">
                                          {item.product.price.toLocaleString('vi-VN')} ₫
                                        </p>
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>

                              {order.status === 'CANCELLED' && order.cancelReason && (
                                <div className="mx-4 sm:mx-6 mb-3 p-3 bg-error/5 border border-error/20 rounded font-mono text-[11px] text-error flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">Lý do hủy đơn: </span>
                                    <span>{order.cancelReason}</span>
                                    {order.cancelledAt && <span className="text-outline text-[10px] ml-2">({order.cancelledAt})</span>}
                                  </div>
                                </div>
                              )}

                              {/* Order Card Footer */}
                              <div className="bg-surface-container-low/20 p-4 sm:px-6 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="font-mono text-[11px] text-on-surface-variant/80">
                                  <span>Giao tới: </span>
                                  <span className="font-semibold text-primary">{order.receiverName}</span>
                                  <span className="text-outline mx-1">•</span>
                                  <span>{order.phoneNumber}</span>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-auto">
                                  <div className="text-right">
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-outline block">Tổng tiền đơn hàng</span>
                                    <span className="font-display-serif text-lg font-bold text-primary">
                                      {order.total.toLocaleString('vi-VN')} ₫
                                    </span>
                                  </div>

                                  {order.status === 'PENDING' && (
                                    <button
                                      onClick={(e) => handleOpenCancelModal(order, e)}
                                      className="px-3.5 py-2 border border-error/40 text-error hover:bg-error/10 rounded font-mono text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm"
                                    >
                                      Hủy đơn hàng
                                    </button>
                                  )}

                                  <button
                                    onClick={() => onViewOrder(order)}
                                    className="btn-push text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Xem Chi Tiết</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </section>
              )}

              {activeTab === 'addresses' && (
                <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-6 md:p-8 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6 border-b border-outline-variant/10 pb-4">
                    <h2 className="font-display-serif text-xl font-medium text-primary">
                      Sổ Địa Chỉ Giao Hàng
                    </h2>
                    {!isAddressFormOpen && (
                      <button
                        onClick={() => { resetAddressForm(); setIsAddressFormOpen(true); }}
                        className="btn-push text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Địa Chỉ</span>
                      </button>
                    )}
                  </div>

                  {message && (
                    <div className={`mb-6 p-3 border rounded-md font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn ${
                      message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : 'bg-error-container/20 border-error/20 text-error'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-error'}`} />
                      <span>{message.text}</span>
                    </div>
                  )}

                  {isAddressFormOpen ? (
                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn" noValidate>
                      <h3 className="md:col-span-2 font-display-serif text-base font-semibold text-primary">
                        {isEditingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thông Tin Địa Chỉ Mới'}
                      </h3>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="receiverName">
                          Tên Người Nhận
                        </label>
                        <input
                          id="receiverName"
                          type="text"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="addressPhone">
                          Số Điện Thoại Nhận Hàng
                        </label>
                        <input
                          id="addressPhone"
                          type="tel"
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          required
                          placeholder="0912345678"
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                          Tỉnh / Thành Phố
                        </label>
                        <select
                          value={selectedProvinceCode}
                          onChange={(e) => { setSelectedProvinceCode(e.target.value); setSelectedWardCode(''); }}
                          required
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 rounded-md px-3 py-2.5 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary transition-all cursor-pointer"
                        >
                          <option value="">-- Chọn Tỉnh/Thành phố --</option>
                          {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                          Xã / Phường / Thị Trấn
                        </label>
                        <select
                          value={selectedWardCode}
                          onChange={(e) => setSelectedWardCode(e.target.value)}
                          required
                          disabled={!selectedProvinceCode}
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 rounded-md px-3 py-2.5 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                          {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold" htmlFor="addressDetail">
                          Địa chỉ chi tiết (Số nhà, đường...)
                        </label>
                        <input
                          id="addressDetail"
                          type="text"
                          value={addressDetail}
                          onChange={(e) => setAddressDetail(e.target.value)}
                          required
                          placeholder="Số 10, ngõ 20, đường Láng"
                          className="w-full bg-surface-container-lowest border border-outline-variant/35 hover:border-outline focus:border-secondary rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                          Loại Địa Chỉ
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setAddressLabel('HOME')}
                            className={`flex-1 py-2 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                              addressLabel === 'HOME'
                                ? 'bg-secondary/5 text-secondary border-secondary font-bold'
                                : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant/80'
                            }`}
                          >
                            Nhà Riêng
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddressLabel('OFFICE')}
                            className={`flex-1 py-2 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                              addressLabel === 'OFFICE'
                                ? 'bg-secondary/5 text-secondary border-secondary font-bold'
                                : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant/80'
                            }`}
                          >
                            Văn Phòng
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 md:col-span-2 pt-2">
                        <input
                          id="defaultAddressCheckbox"
                          type="checkbox"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          className="w-4 h-4 text-secondary focus:ring-secondary/20 bg-transparent border-outline-variant cursor-pointer rounded"
                        />
                        <label htmlFor="defaultAddressCheckbox" className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75 cursor-pointer select-none">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => { setIsAddressFormOpen(false); resetAddressForm(); }}
                          className="btn-push-outline px-5 py-2.5 text-xs font-mono tracking-wider"
                        >
                          HỦY BỎ
                        </button>
                        <button
                          type="submit"
                          className="btn-push text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5"
                        >
                          {isEditingAddress ? 'LƯU THAY ĐỔI' : 'THÊM ĐỊA CHỈ'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      {addresses.length === 0 ? (
                        <div className="text-center py-12 text-on-surface-variant/60">
                          <MapPin className="w-10 h-10 mx-auto text-outline/30 mb-3" />
                          <p className="font-display-serif text-lg font-medium text-primary">Bạn chưa lưu địa chỉ nào</p>
                          <p className="font-mono text-[9px] uppercase tracking-wider text-outline mt-1">Vui lòng bấm nút phía trên để thêm địa chỉ giao hàng đầu tiên.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map((addr: any) => (
                            <div
                              key={addr.id}
                              className={`p-5 rounded border transition-colors relative flex flex-col justify-between ${
                                addr.default 
                                  ? 'bg-secondary/5 border-secondary' 
                                  : 'bg-surface-container-lowest border-outline-variant/30'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="font-display-serif text-sm font-semibold text-primary">
                                    {addr.receiverName}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                    addr.label === 'OFFICE'
                                      ? 'bg-blue-500/10 text-blue-600'
                                      : 'bg-orange-500/10 text-orange-600'
                                  }`}>
                                    {addr.label === 'OFFICE' ? 'Văn Phòng' : 'Nhà Riêng'}
                                  </span>
                                  {addr.default && (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                                      Mặc định
                                    </span>
                                  )}
                                </div>

                                <p className="font-mono text-xs text-on-surface-variant/80 mb-1 flex items-center gap-1.5">
                                  <span className="font-bold">Điện thoại:</span> {addr.phoneNumber}
                                </p>
                                <p className="font-mono text-xs text-on-surface-variant/80 flex items-start gap-1.5 leading-relaxed">
                                  <span className="font-bold shrink-0">Địa chỉ:</span> 
                                  <span>{addr.addressDetail}, {addr.ward?.fullName}, {addr.province?.fullName}</span>
                                </p>
                              </div>

                              <div className="flex gap-4 mt-5 pt-3 border-t border-outline-variant/10 justify-end font-mono text-[10px] uppercase tracking-wider font-bold">
                                <button
                                  onClick={() => startEditAddress(addr)}
                                  className="text-secondary hover:underline flex items-center gap-1"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-error hover:underline flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Cancellation Reason Modal rendered via Portal to document.body to prevent parent container transform/animation bugs */}
      {cancelModalOrder && createPortal(
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-surface max-w-lg w-full border border-outline-variant/20 rounded-lg shadow-2xl p-6 relative flex flex-col max-h-[85vh] animate-fadeInUp">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4 mb-2 shrink-0">
              <div>
                <h3 className="font-display-serif text-xl font-semibold text-primary">
                  Hủy Đơn Hàng #{cancelModalOrder.id}
                </h3>
                <p className="font-mono text-[10px] text-outline uppercase tracking-wider mt-0.5">
                  Ngày đặt: {cancelModalOrder.createdAt}
                </p>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-on-surface-variant hover:text-primary font-mono text-xs font-bold cursor-pointer"
              >
                [ĐÓNG]
              </button>
            </div>

            {/* Subtitle & Scrollable Reasons List */}
            <div className="overflow-y-auto space-y-3 pr-1.5 my-2 flex-1">
              <p className="font-mono text-xs text-on-surface-variant/90 mb-3">
                Vui lòng chọn lý do bạn muốn hủy đơn hàng này. Thao tác hủy đơn không thể hoàn tác.
              </p>

              {CANCELLATION_REASONS.map((reason) => (
                <label 
                  key={reason} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    cancelReasonOption === reason 
                      ? 'border-secondary bg-secondary/5 font-semibold text-primary shadow-sm' 
                      : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReasonOption === reason}
                    onChange={() => setCancelReasonOption(reason)}
                    className="w-4 h-4 text-secondary focus:ring-secondary/20 bg-transparent border-outline-variant cursor-pointer"
                  />
                  <span className="font-mono text-xs">{reason}</span>
                </label>
              ))}

              {cancelReasonOption === 'Lý do khác' && (
                <textarea
                  rows={3}
                  placeholder="Nhập lý do chi tiết của bạn..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/35 focus:border-secondary rounded-md p-3 font-mono text-xs text-on-surface outline-none mt-2"
                />
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 border-t border-outline-variant/15 pt-4 mt-2 shrink-0">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="btn-push-outline px-5 py-2.5 text-xs font-mono tracking-wider cursor-pointer"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="btn-push bg-error hover:bg-error/90 text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5 cursor-pointer shadow-md"
              >
                {isCancelling ? 'ĐANG HỦY...' : 'XÁC NHẬN HỦY ĐƠN'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
