import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShoppingBag } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register') => void;
  onLoginSuccess: (user: { name: string; email: string; token: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError(null);
    try {
      const payload = { email, password };

      let response;
      try {
        response = await fetch('http://localhost:8080/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Không kết nối được Gateway 8080, thử gọi trực tiếp auth-service 8083...');
        response = await fetch('http://localhost:8083/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess({
          name: data.name,
          email: data.email,
          token: data.token,
          role: data.role
        });
        onNavigate('home');
      } else {
        setSubmitError(data.message || 'Email hoặc mật khẩu không hợp lệ');
      }
    } catch (error: any) {
      console.error(error);
      setSubmitError('Lỗi kết nối đến hệ thống: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-secondary-container/10 via-secondary-fixed/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-gradient-to-tr from-primary-container/8 via-primary-fixed/5 to-transparent rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-secondary-container/30 rounded-full" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary-fixed/20 rounded-full" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-secondary-fixed-dim/25 rounded-full" style={{ animation: 'float 7s ease-in-out infinite 0.5s' }} />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest dark:bg-tertiary-container/60 rounded-2xl shadow-[0px_20px_60px_rgba(10,37,64,0.12)] dark:shadow-[0px_20px_60px_rgba(0,0,0,0.4)] p-8 md:p-10 border border-outline-variant/40 dark:border-outline-variant/10 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-container to-primary-container" />
          
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg mb-5 group cursor-pointer" onClick={() => onNavigate('home')}>
              <ShoppingBag className="w-7 h-7 text-on-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-bold mb-2">
              Chào Mừng Trở Lại
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/70">
              Đăng nhập vào tài khoản LuxeCommerce
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {submitError && (
              <div className="p-3.5 bg-error-container/40 dark:bg-error-container/10 border border-error/20 rounded-xl text-error dark:text-error-container font-body-sm text-body-sm flex items-center gap-2 animate-fadeIn">
                <span className="w-1.5 h-1.5 bg-error rounded-full flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 mb-2 uppercase tracking-wider"
              >
                Địa Chỉ Email
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className={`w-full h-[50px] pl-11 pr-4 bg-surface-container-lowest dark:bg-primary/30 border rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline/60 dark:placeholder:text-outline-variant/40 transition-all duration-200 outline-none ${
                    errors.email
                      ? 'border-error ring-2 ring-error/20'
                      : focusedField === 'email'
                        ? 'border-secondary-container ring-2 ring-secondary-container/20 dark:border-secondary-fixed-dim dark:ring-secondary-fixed-dim/20'
                        : 'border-outline-variant/50 dark:border-outline-variant/20 hover:border-outline dark:hover:border-outline-variant/40'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-error dark:text-error-container font-body-sm text-body-sm flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1 h-1 bg-error rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block font-label-sm text-label-sm text-on-surface dark:text-primary-fixed-dim/90 uppercase tracking-wider"
                >
                  Mật Khẩu
                </label>
                <button
                  type="button"
                  className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed-dim hover:text-secondary-container dark:hover:text-secondary-fixed transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-secondary-container' : 'text-outline dark:text-outline-variant'
                }`}>
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nhập mật khẩu của bạn"
                  className={`w-full h-[50px] pl-11 pr-12 bg-surface-container-lowest dark:bg-primary/30 border rounded-xl font-body-md text-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline/60 dark:placeholder:text-outline-variant/40 transition-all duration-200 outline-none ${
                    errors.password
                      ? 'border-error ring-2 ring-error/20'
                      : focusedField === 'password'
                        ? 'border-secondary-container ring-2 ring-secondary-container/20 dark:border-secondary-fixed-dim dark:ring-secondary-fixed-dim/20'
                        : 'border-outline-variant/50 dark:border-outline-variant/20 hover:border-outline dark:hover:border-outline-variant/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-outline dark:text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors rounded-lg hover:bg-surface-container dark:hover:bg-primary/40"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-error dark:text-error-container font-body-sm text-body-sm flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1 h-1 bg-error rounded-full" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  rememberMe
                    ? 'bg-secondary-container border-secondary-container'
                    : 'border-outline-variant/60 dark:border-outline-variant/30 hover:border-outline dark:hover:border-outline-variant/50'
                }`}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <label
                className="ml-3 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/70 cursor-pointer select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
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
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-7 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/40 dark:border-outline-variant/15" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-container-lowest dark:bg-tertiary-container/60 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/50">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 h-[46px] border border-outline-variant/40 dark:border-outline-variant/15 rounded-xl
                hover:bg-surface-container dark:hover:bg-primary/20 hover:border-outline/50 dark:hover:border-outline-variant/30
                transition-all duration-200 group active:scale-[0.97]"
            >
              {/* Google Icon SVG */}
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
              {/* Facebook Icon SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-label-sm text-label-sm text-on-surface dark:text-inverse-on-surface">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-7 text-center font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-label-md text-label-md text-primary dark:text-primary-fixed hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors ml-1 underline-offset-2 hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>

        {/* Trust badges below the card */}
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
