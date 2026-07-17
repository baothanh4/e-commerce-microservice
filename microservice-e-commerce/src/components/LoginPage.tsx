import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'dashboard') => void;
  onLoginSuccess: (user: { name: string; email: string; token: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Forgot / Reset Password state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorsReset, setErrorsReset] = useState<{ token?: string; newPassword?: string; confirmPassword?: string }>({});

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

      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess({
          name: data.name,
          email: data.email,
          token: data.token,
          role: data.role
        });
        if (data.role === 'ADMIN') {
          onNavigate('dashboard');
        } else {
          onNavigate('home');
        }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    
    if (!email) {
      setErrors({ email: 'Vui lòng nhập địa chỉ email' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Địa chỉ email không hợp lệ' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { email };
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setResetToken(data.token);
        setSuccessMessage(`Yêu cầu thành công! Mã xác nhận của bạn là: ${data.token}`);
        
        setTimeout(() => {
          setMode('reset');
          setSuccessMessage(`Mã xác nhận đã tự động điền: ${data.token}`);
        }, 1500);
      } else {
        setSubmitError(data.message || 'Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu');
      }
    } catch (error: any) {
      console.error(error);
      setSubmitError('Lỗi kết nối đến hệ thống: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    
    const newErrorsReset: { token?: string; newPassword?: string; confirmPassword?: string } = {};
    if (!resetToken) {
      newErrorsReset.token = 'Vui lòng nhập mã xác nhận';
    }
    if (!newPassword) {
      newErrorsReset.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrorsReset.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword) {
      newErrorsReset.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPassword !== confirmPassword) {
      newErrorsReset.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrorsReset).length > 0) {
      setErrorsReset(newErrorsReset);
      return;
    }

    setIsLoading(true);
    try {
      const payload = { email, token: resetToken, newPassword, confirmPassword };
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Đặt lại mật khẩu thành công! Quay lại trang đăng nhập...');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage(null);
        }, 2000);
      } else {
        setSubmitError(data.message || 'Mã xác nhận không đúng hoặc đã hết hạn');
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
      <div className="w-full max-w-[420px] relative z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest dark:bg-tertiary-container/60 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 md:p-10 border border-outline-variant/20 dark:border-outline-variant/10 relative overflow-hidden">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <h1 className="font-display-serif text-3xl font-medium text-primary dark:text-primary-fixed-dim mb-2">
              {mode === 'login' ? 'Đăng Nhập' : mode === 'forgot' ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/75">
              {mode === 'login' ? 'Hệ thống thiết kế LuxeCommerce' : mode === 'forgot' ? 'Nhập email để nhận mã xác nhận' : 'Nhập mã xác nhận và mật khẩu mới'}
            </p>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {submitError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-md text-error font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  <span>{submitError}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                  <span>{successMessage}</span>
                </div>
              )}
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                >
                  Địa Chỉ Email
                </label>
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
                  placeholder="name@example.com"
                  className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errors.email
                      ? 'border-error'
                      : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                {errors.email && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                  >
                    Mật Khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setSubmitError(null); setSuccessMessage(null); }}
                    className="font-mono text-[9px] uppercase tracking-widest text-secondary hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
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
                    placeholder="Nhập mật khẩu"
                    className={`w-full bg-surface-container-lowest border rounded-md pl-3.5 pr-10 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                      errors.password
                        ? 'border-error'
                        : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/65 hover:text-on-surface p-1"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/40 text-secondary focus:ring-secondary/20 bg-transparent cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2.5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/75 cursor-pointer select-none"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-3.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>ĐANG ĐĂNG NHẬP...</span>
                ) : (
                  <>
                    <span>ĐĂNG NHẬP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6" noValidate>
              {submitError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-md text-error font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                  <span>{submitError}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 font-mono text-[10px] uppercase tracking-wider animate-fadeIn">
                  <span>{successMessage}</span>
                </div>
              )}
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="forgot-email"
                  className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                >
                  Địa Chỉ Email
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errors.email
                      ? 'border-error'
                      : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                {errors.email && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-3.5"
              >
                {isLoading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setSubmitError(null); setSuccessMessage(null); }}
                className="w-full text-center font-mono text-[10px] uppercase tracking-widest text-secondary hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
              {submitError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-md text-error font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                  <span>{submitError}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
                  <span>{successMessage}</span>
                </div>
              )}
              
              {/* Token/Code Field */}
              <div className="space-y-2">
                <label
                  htmlFor="reset-token"
                  className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                >
                  Mã Xác Nhận (Token)
                </label>
                <input
                  id="reset-token"
                  name="token"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => {
                    setResetToken(e.target.value);
                    if (errorsReset.token) setErrorsReset(prev => ({ ...prev, token: undefined }));
                  }}
                  placeholder="Nhập mã xác nhận"
                  className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errorsReset.token
                      ? 'border-error'
                      : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                {errorsReset.token && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errorsReset.token}</span>
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                >
                  Mật Khẩu Mới
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorsReset.newPassword) setErrorsReset(prev => ({ ...prev, newPassword: undefined }));
                    }}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full bg-surface-container-lowest border rounded-md pl-3.5 pr-10 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                      errorsReset.newPassword
                        ? 'border-error'
                        : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
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
                {errorsReset.newPassword && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errorsReset.newPassword}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="block font-mono text-[10px] uppercase tracking-widest text-primary/80 font-bold"
                >
                  Xác Nhận Mật Khẩu Mới
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorsReset.confirmPassword) setErrorsReset(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Xác nhận mật khẩu mới"
                  className={`w-full bg-surface-container-lowest border rounded-md px-3.5 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/45 transition-all outline-none focus:ring-0 ${
                    errorsReset.confirmPassword
                      ? 'border-error'
                      : 'border-outline-variant/35 hover:border-outline focus:border-secondary'
                  }`}
                />
                {errorsReset.confirmPassword && (
                  <p className="text-error font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1 animate-fadeIn">
                    <span>{errorsReset.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-push text-white font-mono text-xs uppercase tracking-widest py-3.5"
              >
                {isLoading ? 'ĐANG ĐẶT LẠI...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setSubmitError(null); setSuccessMessage(null); }}
                className="w-full text-center font-mono text-[10px] uppercase tracking-widest text-secondary hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {mode === 'login' && (
            <>
              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/15" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-surface-container-lowest font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                      Hoặc đăng nhập với
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Login Buttons */}
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

              {/* Sign Up Link */}
              <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-secondary hover:underline font-bold"
                >
                  Đăng ký ngay
                </button>
              </p>
            </>
          )}
        </div>

        {/* Trust badges below the card */}
        <div className="mt-8 flex items-center justify-center gap-6 text-on-surface-variant/40">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
            <span className="text-secondary font-bold">✓</span>
            <span>Bảo mật SSL</span>
          </div>
          <div className="w-px h-3 bg-outline-variant/20" />
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
            <span className="text-secondary font-bold">✓</span>
            <span>Mã hóa dữ liệu</span>
          </div>
          <div className="w-px h-3 bg-outline-variant/20" />
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
            <span className="text-secondary font-bold">✓</span>
            <span>Thanh toán an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
