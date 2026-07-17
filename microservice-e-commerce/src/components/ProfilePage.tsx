import React, { useState, useEffect } from 'react';
import { User, MapPin, LogOut, ArrowRight, Plus, Trash2, Edit } from 'lucide-react';
import type { Order } from '../types';

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

  // Address-related states
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
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
              {activeTab === 'profile' ? (
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
                      <button className="font-mono text-[9px] uppercase tracking-widest text-secondary hover:underline flex items-center gap-1">
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
                            orders.map((order) => (
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
              ) : (
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
    </div>
  );
};
