import React, { useState, useMemo, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

type ViewType = 'home' | 'products' | 'detail' | 'login' | 'register' | 'dashboard';

interface RegisterPageProps {
  onNavigate: (view: ViewType) => void;
  onRegisterSuccess: (user: { name: string; email: string; token: string; role: string }) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Address-related states
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

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

  // Fetch wards when provinceCode changes
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

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-error' };
    if (score <= 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'Khá', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Mạnh', color: 'bg-emerald-500' };
    return { score: 5, label: 'Rất mạnh', color: 'bg-emerald-600' };
  }, [formData.password]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    if (formData.phone && !/^[\d\s+()-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản để tiếp tục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        dob: formData.dob || null,
        gender: formData.gender ? formData.gender.toUpperCase() : null,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        provinceCode: provinceCode || null,
        wardCode: wardCode || null,
        addressDetail: addressDetail || null,
      };

      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess('Đăng ký thành công! Đang tự động đăng nhập...');
        
        // Auto-login request after successful registration
        try {
          const loginPayload = { email: formData.email, password: formData.password };
          const loginResponse = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload),
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            onRegisterSuccess({
              name: loginData.name,
              email: loginData.email,
              token: loginData.token,
              role: loginData.role
            });
            if (loginData.role === 'ADMIN') {
              setTimeout(() => {
                onNavigate('dashboard');
              }, 1000);
            } else {
              setTimeout(() => {
                onNavigate('home');
              }, 1000);
            }
          } else {
            setTimeout(() => {
              onNavigate('login');
            }, 1500);
          }
        } catch (loginErr) {
          console.error('Lỗi tự động đăng nhập:', loginErr);
          setTimeout(() => {
            onNavigate('login');
          }, 1500);
        }
      } else {
        setSubmitError(data.message || 'Đăng ký thất bại, vui lòng kiểm tra lại');
      }
    } catch (error: any) {
      console.error(error);
      setSubmitError('Lỗi kết nối đến hệ thống: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-margin-mobile md:px-margin-desktop relative select-none animate-fadeInUp">
      <div className="w-full max-w-[480px] relative z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest dark:bg-tertiary-container/60 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 md:p-10 border border-outline-variant/20 dark:border-outline-variant/10 relative overflow-hidden">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <h1 className="font-display-serif text-3xl font-medium text-primary dark:text-primary-fixed-dim mb-2">
              Đăng Ký Tài Khoản
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/75">
              Tham gia LuxeCommerce để trải nghiệm mua sắm cao cấp
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {submitError && (
              <div className="p-3 bg-error-container/20 border border-error/20 rounded-md text-error font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                <span className="w-1 h-1 bg-error rounded-full" />
                <span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span>{submitSuccess}</span>
              </div>
            )}
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="reg-name" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                Họ Và Tên
              </label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                  errors.fullName ? 'border-error' : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                }`}
              />
              {errors.fullName && (
                <p className="text-error font-mono text-[9px] uppercase tracking-wider mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="reg-email" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                Địa Chỉ Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@example.com"
                className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                  errors.email ? 'border-error' : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                }`}
              />
              {errors.email && (
                <p className="text-error font-mono text-[9px] uppercase tracking-wider mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="reg-phone" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                Số Điện Thoại <span className="text-outline/50 normal-case tracking-normal">(Tùy chọn)</span>
              </label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+84 912 345 678"
                className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                  errors.phone ? 'border-error' : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                }`}
              />
              {errors.phone && (
                <p className="text-error font-mono text-[9px] uppercase tracking-wider mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Date of Birth + Gender row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="reg-dob" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                  Ngày Sinh
                </label>
                <input
                  id="reg-dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                  className="w-full bg-surface-container-lowest border rounded-md px-3.5 py-2 font-mono text-xs text-on-surface border-outline-variant/35 hover:border-outline focus:border-secondary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="reg-gender" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                  Giới Tính
                </label>
                <select
                  id="reg-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface border-outline-variant/35 hover:border-outline focus:border-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="">Chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="reg-password" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`w-full bg-surface-container-lowest border rounded-md pl-3.5 pr-10 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errors.password ? 'border-error' : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/65 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 animate-fadeIn">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-outline-variant/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/75">
                    Độ mạnh: {passwordStrength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-error font-mono text-[9px] uppercase tracking-wider mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="reg-confirm-password" className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full bg-surface-container-lowest border rounded-md pl-3.5 pr-10 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errors.confirmPassword ? 'border-error' : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/65 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-error font-mono text-[9px] uppercase tracking-wider mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="pt-2">
              <div className="p-5 bg-surface-container-low/20 rounded-md border border-outline-variant/15 grid grid-cols-1 gap-4">
                <h4 className="font-display-serif text-sm font-semibold text-primary">
                  Địa Chỉ Giao Hàng (Mặc định)
                </h4>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Tỉnh / Thành Phố
                  </label>
                  <select
                    value={provinceCode}
                    onChange={(e) => { setProvinceCode(e.target.value); setWardCode(''); }}
                    required
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/35 rounded-md font-mono text-xs text-on-surface focus:outline-none focus:border-secondary transition-all outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Xã / Phường / Thị Trấn
                  </label>
                  <select
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                    required
                    disabled={!provinceCode}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/35 rounded-md font-mono text-xs text-on-surface focus:outline-none focus:border-secondary transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Địa chỉ chi tiết (Số nhà, đường...)
                  </label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    required
                    placeholder="Số 10, ngõ 20, đường Láng"
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/35 rounded-md font-mono text-xs text-on-surface focus:outline-none focus:border-secondary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="agree-terms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => updateField('agreeTerms', e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant/40 text-secondary focus:ring-secondary/20 bg-transparent cursor-pointer mt-0.5"
              />
              <label
                htmlFor="agree-terms"
                className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75 cursor-pointer select-none leading-relaxed"
              >
                Đồng ý điều khoản &amp; bảo mật của LuxeCommerce.
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-error font-mono text-[9px] uppercase tracking-wider">{errors.agreeTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-3.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>ĐANG XỬ LÝ...</span>
              ) : (
                <>
                  <span>TẠO TÀI KHOẢN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/15" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-surface-container-lowest font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>
          </div>

          {/* Social Register Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-outline-variant/30 rounded-md hover:bg-surface-container-low transition-colors active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-outline-variant/30 rounded-md hover:bg-surface-container-low transition-colors active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">Facebook</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-secondary hover:underline font-bold"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
