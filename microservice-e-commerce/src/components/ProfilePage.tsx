import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Settings, MapPin, LogOut, ArrowRight, Plus, Trash2, Edit } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile') => void;
  currentUser: { name: string; email: string; token: string; role: string } | null;
  onLogout: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, currentUser, onLogout }) => {
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
        let response;
        try {
          response = await fetch('http://localhost:8080/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${currentUser.token}`
            }
          });
        } catch (err) {
          response = await fetch('http://localhost:8083/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${currentUser.token}`
            }
          });
        }

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
      let response;
      try {
        response = await fetch('http://localhost:8080/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        response = await fetch('http://localhost:8083/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(payload)
        });
      }

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
    <div className="min-h-screen bg-surface dark:bg-primary/5 text-on-surface dark:text-inverse-on-surface">
      <div className="flex flex-col md:flex-row w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 gap-gutter relative">
        
        {/* Left Side Navigation (Desktop/Tablet) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col bg-surface-container-low dark:bg-tertiary-container/30 rounded-xl overflow-hidden self-start border border-outline-variant/30 dark:border-outline-variant/10">
          <div className="p-6 border-b border-outline-variant/30 dark:border-outline-variant/10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-sm border border-outline-variant/50 dark:border-outline-variant/20 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-2xl font-bold">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
              {name || currentUser.name}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-1">
              {currentUser.email}
            </p>
          </div>
          <nav className="flex flex-col gap-1.5 p-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-white font-bold'
                  : 'text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30'
              }`}
            >
              <User className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Hồ sơ cá nhân</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30 rounded-lg text-left w-full transition-all duration-200">
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Lịch sử đơn hàng</span>
            </button>
            <button 
              onClick={() => { setActiveTab('addresses'); fetchProvinces(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition-all duration-200 ${
                activeTab === 'addresses'
                  ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-white font-bold'
                  : 'text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30'
              }`}
            >
              <MapPin className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Sổ địa chỉ</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30 rounded-lg text-left w-full transition-all duration-200">
              <Settings className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Cài đặt</span>
            </button>
            <div className="pt-4 mt-2 border-t border-outline-variant/30 dark:border-outline-variant/10">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-error hover:bg-error-container/20 rounded-lg text-left transition-all duration-200 font-semibold"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span className="font-label-md text-label-md">Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-6">
          <div className="mb-2">
            <h1 className="font-headline-md md:font-display-lg text-headline-md md:text-display-lg text-primary dark:text-primary-fixed-dim font-bold mb-1">
              Hồ Sơ Của Tôi
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/60">
              Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.
            </p>
          </div>

          {isLoading ? (
            <div className="bg-surface-container-lowest dark:bg-tertiary-container/30 rounded-2xl border border-outline-variant/40 dark:border-outline-variant/10 p-12 flex justify-center items-center shadow-sm">
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-8 w-8 text-secondary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' ? (
                <>
                  {/* Form Section */}
                  <section className="bg-surface-container-lowest dark:bg-tertiary-container/40 rounded-2xl border border-outline-variant/40 dark:border-outline-variant/10 p-6 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary-container to-primary" />
                    
                    <h2 className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim font-bold mb-6 border-b border-outline-variant/30 dark:border-outline-variant/10 pb-4">
                      Thông Tin Cá Nhân
                    </h2>

                    {message && (
                      <div className={`mb-6 p-3.5 border rounded-xl font-body-sm text-body-sm flex items-center gap-2 animate-fadeIn ${
                        message.type === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/20 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                          : 'bg-error-container/40 dark:bg-error-container/10 border-error/20 text-error dark:text-error-container'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-error'}`} />
                        <span>{message.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="fullName">
                          Họ và Tên
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Nguyễn Văn A"
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="email">
                          Địa Chỉ Email (Không thể thay đổi)
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={currentUser.email}
                          readOnly
                          disabled
                          className="px-4 py-3 bg-surface-container dark:bg-primary/10 border border-outline-variant/30 dark:border-outline-variant/10 rounded-xl font-body-md text-body-md text-outline cursor-not-allowed outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="phone">
                          Số Điện Thoại
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+84 912 345 678"
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="dob">
                          Ngày Sinh
                        </label>
                        <input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider mb-1">
                          Giới tính
                        </label>
                        <div className="flex flex-wrap items-center gap-6">
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              name="gender"
                              type="radio"
                              value="male"
                              checked={gender === 'male'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 cursor-pointer"
                            />
                            <span className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface group-hover:text-secondary-container transition-colors select-none">Nam</span>
                          </label>
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              name="gender"
                              type="radio"
                              value="female"
                              checked={gender === 'female'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 cursor-pointer"
                            />
                            <span className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface group-hover:text-secondary-container transition-colors select-none">Nữ</span>
                          </label>
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              name="gender"
                              type="radio"
                              value="prefer_not_to_say"
                              checked={gender === 'prefer_not_to_say' || gender === 'other'}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 cursor-pointer"
                            />
                            <span className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface group-hover:text-secondary-container transition-colors select-none">Khác / Không tiết lộ</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-[#FF5F38] to-[#FF7A55] text-white rounded-xl font-label-md text-label-md px-6 py-3
                            hover:from-[#E8522D] hover:to-[#FF6B45] active:scale-[0.98] transition-all duration-200
                            shadow-[0px_4px_16px_rgba(255,95,56,0.3)] hover:shadow-[0px_6px_24px_rgba(255,95,56,0.4)]
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Đang cập nhật...</span>
                            </>
                          ) : (
                            <>
                              <span>Cập Nhật Hồ Sơ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </section>

                  {/* Recent Orders Section */}
                  <section className="bg-surface-container-lowest dark:bg-tertiary-container/30 rounded-2xl border border-outline-variant/40 dark:border-outline-variant/10 overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 dark:border-outline-variant/10">
                      <h2 className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim font-bold">Đơn Hàng Gần Đây</h2>
                      <button className="font-label-md text-label-md text-secondary-container hover:text-secondary transition-colors flex items-center gap-1 select-none">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low dark:bg-primary/20 border-b border-outline-variant/50 dark:border-outline-variant/10">
                            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">Mã đơn hàng</th>
                            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">Ngày đặt</th>
                            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">Trạng thái</th>
                            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider text-right">Tổng tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30 dark:divide-outline-variant/10">
                          <tr className="hover:bg-surface-bright dark:hover:bg-primary/10 transition-colors cursor-pointer">
                            <td className="py-4 px-6 font-body-md text-body-md font-medium text-primary dark:text-primary-fixed-dim">#NX-88392</td>
                            <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60">24/10/2024</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400">
                                Đã giao
                              </span>
                            </td>
                            <td className="py-4 px-6 font-body-md text-body-md font-semibold text-right text-primary dark:text-primary-fixed-dim">3,250,000 đ</td>
                          </tr>
                          <tr className="hover:bg-surface-bright dark:hover:bg-primary/10 transition-colors cursor-pointer">
                            <td className="py-4 px-6 font-body-md text-body-md font-medium text-primary dark:text-primary-fixed-dim">#NX-88104</td>
                            <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60">12/10/2024</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400">
                                Đang xử lý
                              </span>
                            </td>
                            <td className="py-4 px-6 font-body-md text-body-md font-semibold text-right text-primary dark:text-primary-fixed-dim">8,500,000 đ</td>
                          </tr>
                          <tr className="hover:bg-surface-bright dark:hover:bg-primary/10 transition-colors cursor-pointer">
                            <td className="py-4 px-6 font-body-md text-body-md font-medium text-primary dark:text-primary-fixed-dim">#NX-87944</td>
                            <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60">28/09/2024</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400">
                                Đã giao
                              </span>
                            </td>
                            <td className="py-4 px-6 font-body-md text-body-md font-semibold text-right text-primary dark:text-primary-fixed-dim">1,450,000 đ</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="bg-surface-container-lowest dark:bg-tertiary-container/40 rounded-2xl border border-outline-variant/40 dark:border-outline-variant/10 p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary-container to-primary" />
                  
                  <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 dark:border-outline-variant/10 pb-4">
                    <h2 className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim font-bold">
                      Sổ Địa Chỉ Giao Hàng
                    </h2>
                    {!isAddressFormOpen && (
                      <button
                        onClick={() => { resetAddressForm(); setIsAddressFormOpen(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF5F38] to-[#FF7A55] text-white rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm text-body-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Địa Chỉ Mới</span>
                      </button>
                    )}
                  </div>

                  {message && (
                    <div className={`mb-6 p-3.5 border rounded-xl font-body-sm text-body-sm flex items-center gap-2 animate-fadeIn ${
                      message.type === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/20 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                        : 'bg-error-container/40 dark:bg-error-container/10 border-error/20 text-error dark:text-error-container'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-error'}`} />
                      <span>{message.text}</span>
                    </div>
                  )}

                  {isAddressFormOpen ? (
                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
                      <h3 className="md:col-span-2 text-body-lg font-bold text-on-surface dark:text-inverse-on-surface">
                        {isEditingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thông Tin Địa Chỉ Mới'}
                      </h3>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="receiverName">
                          Tên Người Nhận
                        </label>
                        <input
                          id="receiverName"
                          type="text"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          required
                          placeholder="Nguyễn Văn A"
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="addressPhone">
                          Số Điện Thoại Nhận Hàng
                        </label>
                        <input
                          id="addressPhone"
                          type="tel"
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          required
                          placeholder="0912345678"
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">
                          Tỉnh / Thành Phố
                        </label>
                        <select
                          value={selectedProvinceCode}
                          onChange={(e) => { setSelectedProvinceCode(e.target.value); setSelectedWardCode(''); }}
                          required
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        >
                          <option value="">-- Chọn Tỉnh/Thành phố --</option>
                          {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">
                          Xã / Phường / Thị Trấn
                        </label>
                        <select
                          value={selectedWardCode}
                          onChange={(e) => setSelectedWardCode(e.target.value)}
                          required
                          disabled={!selectedProvinceCode}
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                          {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider" htmlFor="addressDetail">
                          Địa chỉ chi tiết (Số nhà, ngõ, đường...)
                        </label>
                        <input
                          id="addressDetail"
                          type="text"
                          value={addressDetail}
                          onChange={(e) => setAddressDetail(e.target.value)}
                          required
                          placeholder="Số 10, ngõ 20, đường Láng"
                          className="px-4 py-3 bg-surface-container-lowest dark:bg-primary/20 border border-outline-variant/50 dark:border-outline-variant/15 rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 uppercase tracking-wider">
                          Loại Địa Chỉ (Nhãn)
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setAddressLabel('HOME')}
                            className={`flex-1 py-2 rounded-lg font-semibold border transition-all ${
                              addressLabel === 'HOME'
                                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-white border-transparent'
                                : 'bg-surface-bright dark:bg-surface-container/20 border-outline-variant/40 text-on-surface-variant'
                            }`}
                          >
                            Nhà Riêng
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddressLabel('OFFICE')}
                            className={`flex-1 py-2 rounded-lg font-semibold border transition-all ${
                              addressLabel === 'OFFICE'
                                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-white border-transparent'
                                : 'bg-surface-bright dark:bg-surface-container/20 border-outline-variant/40 text-on-surface-variant'
                            }`}
                          >
                            Văn Phòng
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:col-span-2 pt-2">
                        <input
                          id="defaultAddressCheckbox"
                          type="checkbox"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 cursor-pointer rounded"
                        />
                        <label htmlFor="defaultAddressCheckbox" className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface cursor-pointer select-none">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => { setIsAddressFormOpen(false); resetAddressForm(); }}
                          className="px-5 py-2.5 bg-surface-container dark:bg-surface-container/20 text-on-surface-variant dark:text-tertiary-fixed-dim rounded-xl font-semibold border border-outline-variant/40 hover:bg-surface-container-high transition-colors"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-[#FF5F38] to-[#FF7A55] text-white rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                        >
                          {isEditingAddress ? 'Lưu Thay Đổi' : 'Thêm Địa Chỉ'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      {addresses.length === 0 ? (
                        <div className="text-center py-12 text-on-surface-variant dark:text-tertiary-fixed-dim/60">
                          <MapPin className="w-12 h-12 mx-auto text-outline-variant mb-3" />
                          <p className="font-body-lg text-body-lg font-medium">Bạn chưa lưu địa chỉ nào</p>
                          <p className="font-body-sm text-body-sm mt-1">Vui lòng bấm nút phía trên để thêm địa chỉ giao hàng đầu tiên.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map((addr: any) => (
                            <div
                              key={addr.id}
                              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                addr.default 
                                  ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary dark:border-secondary-fixed' 
                                  : 'bg-surface-bright dark:bg-surface-container/20 border-outline-variant/40 dark:border-outline-variant/10'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="font-bold font-body-md text-body-md text-primary dark:text-primary-fixed-dim">
                                    {addr.receiverName}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    addr.label === 'OFFICE'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                      : 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400'
                                  }`}>
                                    {addr.label === 'OFFICE' ? 'Văn Phòng' : 'Nhà Riêng'}
                                  </span>
                                  {addr.default && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 rounded text-[10px] font-bold uppercase">
                                      Mặc định
                                    </span>
                                  )}
                                </div>

                                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70 mb-1.5 flex items-center gap-1.5">
                                  <span className="font-semibold">Điện thoại:</span> {addr.phoneNumber}
                                </p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70 flex items-start gap-1.5">
                                  <span className="font-semibold shrink-0">Địa chỉ:</span> 
                                  <span>{addr.addressDetail}, {addr.ward?.fullName}, {addr.province?.fullName}</span>
                                </p>
                              </div>

                              <div className="flex gap-3 mt-5 pt-3 border-t border-outline-variant/10 justify-end">
                                <button
                                  onClick={() => startEditAddress(addr)}
                                  className="text-body-sm text-secondary-container hover:text-secondary font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-body-sm text-error hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
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
