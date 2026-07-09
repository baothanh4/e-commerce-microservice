import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, ChevronDown, ArrowRight, ShoppingBag, Check } from 'lucide-react';

type ViewType = 'home' | 'products' | 'detail' | 'login' | 'register';

interface RegisterPageProps {
  onNavigate: (view: ViewType) => void;
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

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
        confirmPassword: formData.confirmPassword
      };

      let response;
      try {
        response = await fetch('http://localhost:8080/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Không kết nối được Gateway 8080, thử gọi trực tiếp auth-service 8083...');
        response = await fetch('http://localhost:8083/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(data.message || 'Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          onNavigate('login');
        }, 1500);
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

  const inputBaseClass = (field: string, hasError: boolean) =>
    `w-full h-[50px] bg-surface-container-lowest dark:bg-primary/30 border rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline/60 dark:placeholder:text-outline-variant/40 transition-all duration-200 outline-none ${
      hasError
        ? 'border-error ring-2 ring-error/20'
        : focusedField === field
          ? 'border-secondary-container ring-2 ring-secondary-container/20 dark:border-secondary-fixed-dim dark:ring-secondary-fixed-dim/20'
          : 'border-outline-variant/50 dark:border-outline-variant/20 hover:border-outline dark:hover:border-outline-variant/40'
    }`;

  const ErrorMessage: React.FC<{ message?: string }> = ({ message }) =>
    message ? (
      <p className="mt-1.5 text-error dark:text-error-container font-body-sm text-body-sm flex items-center gap-1 animate-fadeIn">
        <span className="inline-block w-1 h-1 bg-error rounded-full" />
        {message}
      </p>
    ) : null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-br from-primary-container/10 via-primary-fixed/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-secondary-container/10 via-secondary-fixed/5 to-transparent rounded-full blur-3xl" style={{ animation: 'pulse 5s ease-in-out infinite' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-secondary-container/25 rounded-full" style={{ animation: 'float 7s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary-fixed/20 rounded-full" style={{ animation: 'float 9s ease-in-out infinite 1.5s' }} />
        <div className="absolute top-2/3 right-1/2 w-1.5 h-1.5 bg-secondary-fixed-dim/20 rounded-full" style={{ animation: 'float 6s ease-in-out infinite 0.8s' }} />
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest dark:bg-tertiary-container/60 rounded-2xl shadow-[0px_20px_60px_rgba(10,37,64,0.12)] dark:shadow-[0px_20px_60px_rgba(0,0,0,0.4)] p-8 md:p-10 border border-outline-variant/40 dark:border-outline-variant/10 backdrop-blur-sm relative overflow-hidden">
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary-container to-primary" />

          {/* Logo / Brand */}
          <div className="text-center mb-7">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg mb-5 group cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <ShoppingBag className="w-7 h-7 text-on-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-bold mb-2">
              Tạo Tài Khoản
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/70">
              Tham gia LuxeCommerce để trải nghiệm mua sắm cao cấp
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {submitError && (
              <div className="p-3.5 bg-error-container/40 dark:bg-error-container/10 border border-error/20 rounded-xl text-error dark:text-error-container font-body-sm text-body-sm flex items-center gap-2 animate-fadeIn">
                <span className="w-1.5 h-1.5 bg-error rounded-full flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500/25 rounded-xl text-emerald-600 dark:text-emerald-400 font-body-sm text-body-sm flex items-center gap-2 animate-fadeIn">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                Họ Và Tên
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'fullName' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <User className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nguyễn Văn A"
                  className={`${inputBaseClass('fullName', !!errors.fullName)} pl-11 pr-4`}
                />
              </div>
              <ErrorMessage message={errors.fullName} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                Địa Chỉ Email
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className={`${inputBaseClass('email', !!errors.email)} pl-11 pr-4`}
                />
              </div>
              <ErrorMessage message={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                Số Điện Thoại <span className="text-outline/60 normal-case tracking-normal">(Tùy chọn)</span>
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'phone' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Phone className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+84 912 345 678"
                  className={`${inputBaseClass('phone', !!errors.phone)} pl-11 pr-4`}
                />
              </div>
              <ErrorMessage message={errors.phone} />
            </div>

            {/* Date of Birth + Gender row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-dob" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                  Ngày Sinh
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
                    focusedField === 'dob' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                  }`}>
                    <Calendar className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="reg-dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                    onFocus={() => setFocusedField('dob')}
                    onBlur={() => setFocusedField(null)}
                    className={`${inputBaseClass('dob', false)} pl-11 pr-3`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-gender" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                  Giới Tính
                </label>
                <div className="relative group">
                  <select
                    id="reg-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    onFocus={() => setFocusedField('gender')}
                    onBlur={() => setFocusedField(null)}
                    className={`${inputBaseClass('gender', false)} pl-4 pr-10 appearance-none cursor-pointer`}
                  >
                    <option value="">Chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline dark:text-outline-variant">
                    <ChevronDown className="w-[18px] h-[18px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                Mật Khẩu
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`${inputBaseClass('password', !!errors.password)} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-outline dark:text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors rounded-lg hover:bg-surface-container dark:hover:bg-primary/40"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
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
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-outline-variant/30 dark:bg-outline-variant/15'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${
                    passwordStrength.score <= 1 ? 'text-error' :
                    passwordStrength.score <= 2 ? 'text-amber-600 dark:text-amber-400' :
                    passwordStrength.score <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Độ mạnh: {passwordStrength.label}
                  </p>
                </div>
              )}
              <ErrorMessage message={errors.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-1.5 uppercase tracking-wider">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'confirmPassword' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nhập lại mật khẩu"
                  className={`${inputBaseClass('confirmPassword', !!errors.confirmPassword)} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-outline dark:text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors rounded-lg hover:bg-surface-container dark:hover:bg-primary/40"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
                {/* Match indicator */}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500 animate-fadeIn">
                    <Check className="w-[18px] h-[18px]" />
                  </div>
                )}
              </div>
              <ErrorMessage message={errors.confirmPassword} />
            </div>

            {/* Terms and Conditions */}
            <div className="pt-1">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => updateField('agreeTerms', !formData.agreeTerms)}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer mt-0.5 ${
                    formData.agreeTerms
                      ? 'bg-secondary-container border-secondary-container'
                      : errors.agreeTerms
                        ? 'border-error'
                        : 'border-outline-variant/60 dark:border-outline-variant/30 hover:border-outline dark:hover:border-outline-variant/50'
                  }`}
                >
                  {formData.agreeTerms && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <label
                  className="font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70 cursor-pointer select-none leading-relaxed"
                  onClick={() => updateField('agreeTerms', !formData.agreeTerms)}
                >
                  Tôi đồng ý với{' '}
                  <span className="text-primary dark:text-primary-fixed font-medium hover:underline cursor-pointer">Điều khoản dịch vụ</span>
                  {' '}và{' '}
                  <span className="text-primary dark:text-primary-fixed font-medium hover:underline cursor-pointer">Chính sách bảo mật</span>
                  {' '}của LuxeCommerce.
                </label>
              </div>
              <ErrorMessage message={errors.agreeTerms} />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] bg-gradient-to-r from-[#FF5F38] to-[#FF7A55] text-white rounded-xl font-label-md text-label-md
                  hover:from-[#E8522D] hover:to-[#FF6B45] active:scale-[0.98] transition-all duration-200
                  shadow-[0px_4px_16px_rgba(255,95,56,0.3)] hover:shadow-[0px_6px_24px_rgba(255,95,56,0.4)]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                  flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  <>
                    <span>Tạo Tài Khoản</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/40 dark:border-outline-variant/15" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-container-lowest dark:bg-tertiary-container/60 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/50">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>
          </div>

          {/* Social Register Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 h-[46px] border border-outline-variant/40 dark:border-outline-variant/15 rounded-xl
                hover:bg-surface-container dark:hover:bg-primary/20 hover:border-outline/50 dark:hover:border-outline-variant/30
                transition-all duration-200 group active:scale-[0.97]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-label-sm text-label-sm text-on-surface dark:text-inverse-on-surface">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 h-[46px] border border-outline-variant/40 dark:border-outline-variant/15 rounded-xl
                hover:bg-surface-container dark:hover:bg-primary/20 hover:border-outline/50 dark:hover:border-outline-variant/30
                transition-all duration-200 group active:scale-[0.97]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-label-sm text-label-sm text-on-surface dark:text-inverse-on-surface">Facebook</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-label-md text-label-md text-primary dark:text-primary-fixed hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors ml-1 underline-offset-2 hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-on-surface-variant/50 dark:text-tertiary-fixed-dim/30">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-[11px] font-medium">Bảo mật SSL</span>
          </div>
          <div className="w-px h-3 bg-outline-variant/30" />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-[11px] font-medium">Mã hóa dữ liệu</span>
          </div>
          <div className="w-px h-3 bg-outline-variant/30" />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <span className="text-[11px] font-medium">Thanh toán an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
