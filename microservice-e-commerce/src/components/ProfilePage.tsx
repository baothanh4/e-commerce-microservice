import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, ShoppingBag, Settings, MapPin, LogOut, ArrowRight, Check } from 'lucide-react';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          const data: UserProfile = await response.json();
          setProfile(data);
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
        setProfile(data);
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
            <button className="flex items-center gap-3 px-4 py-3 bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-white rounded-lg font-bold text-left w-full transition-transform duration-200">
              <User className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Hồ sơ cá nhân</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30 rounded-lg text-left w-full transition-all duration-200">
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span className="font-label-md text-label-md">Lịch sử đơn hàng</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:bg-surface-variant dark:hover:bg-primary/30 rounded-lg text-left w-full transition-all duration-200">
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
              <div className="animate-spin h-8 w-8 text-secondary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <svg className="animate-spin h-8 w-8 text-secondary-container" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          ) : (
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
                  <h2 class="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim font-bold">Đơn Hàng Gần Đây</h2>
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
          )}
        </main>
        
      </div>
    </div>
  );
};
