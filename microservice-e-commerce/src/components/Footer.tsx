import React, { useState } from 'react';
import { Globe, Share2, Mail, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setIsSubscribed(false);
    }, 5000);
  };

  return (
    <footer className="bg-primary dark:bg-tertiary-container w-full pt-16 pb-8 border-t border-outline-variant/10 text-white/90">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-12">
        {/* Brand Info */}
        <div className="col-span-1">
          <div className="font-headline-sm text-headline-sm font-bold text-on-primary dark:text-primary-fixed mb-4">
            LuxeCommerce
          </div>
          <p className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 font-body-sm text-body-sm mb-6 max-w-[250px] leading-relaxed">
            Nâng tầm không gian sống của bạn với những thiết kế nội thất hiện đại, tinh tế và chất lượng vượt trội.
          </p>
          <div className="flex gap-4">
            <a 
              className="text-on-primary dark:text-tertiary-fixed-dim opacity-85 hover:opacity-100 hover:text-secondary-fixed-dim transition-all p-1.5 bg-white/10 rounded-full hover:bg-white/20" 
              href="#"
              title="Global website"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a 
              className="text-on-primary dark:text-tertiary-fixed-dim opacity-85 hover:opacity-100 hover:text-secondary-fixed-dim transition-all p-1.5 bg-white/10 rounded-full hover:bg-white/20" 
              href="#"
              title="Share LuxeCommerce"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-primary dark:text-primary-fixed font-bold mb-4 uppercase tracking-wider">
            Hỗ Trợ Khách Hàng
          </h4>
          <ul className="space-y-3 flex flex-col">
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Chính sách vận chuyển
            </a>
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Chính sách đổi trả
            </a>
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Liên hệ hỗ trợ
            </a>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-primary dark:text-primary-fixed font-bold mb-4 uppercase tracking-wider">
            Về Chúng Tôi
          </h4>
          <ul className="space-y-3 flex flex-col">
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Câu chuyện thương hiệu
            </a>
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Điều khoản dịch vụ
            </a>
            <a className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 hover:text-secondary-fixed-dim transition-colors font-body-sm text-body-sm w-fit" href="#">
              Chính sách bảo mật
            </a>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-primary dark:text-primary-fixed font-bold mb-4 uppercase tracking-wider">
            Đăng Ký Nhận Tin
          </h4>
          <p className="text-primary-fixed-dim/80 dark:text-tertiary-fixed-dim/70 font-body-sm text-body-sm mb-4 leading-relaxed">
            Nhận thông tin về các bộ sưu tập mới và ưu đãi độc quyền sớm nhất.
          </p>
          
          {isSubscribed ? (
            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg p-3 flex items-center gap-2 text-body-sm font-semibold animate-fadeIn">
              <Mail className="w-4 h-4 text-emerald-400" />
              Đăng ký nhận tin thành công!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex group shadow-md">
              <input
                type="email"
                required
                className="w-full bg-white/10 dark:bg-tertiary-container/30 border border-primary-fixed-dim/30 dark:border-outline-variant/30 rounded-l-lg px-4 py-2.5 text-white font-body-sm text-body-sm focus:outline-none focus:border-secondary-fixed dark:focus:border-secondary-fixed-dim focus:ring-1 focus:ring-secondary-fixed placeholder:text-primary-fixed-dim/50 outline-none"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-secondary-container hover:bg-secondary text-white px-4 py-2.5 rounded-r-lg font-semibold text-label-md transition-colors flex items-center gap-1 active:scale-95 duration-150"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright & Payments */}
      <div className="border-t border-primary-fixed-dim/20 pt-8 mt-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-primary-fixed-dim/70 dark:text-tertiary-fixed-dim/60 font-body-sm text-body-sm">
          © 2026 LuxeCommerce. All rights reserved. Designed with sophistication.
        </p>
        <div className="flex gap-2">
          {/* Payment methods */}
          <div className="w-12 h-7 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white/60 tracking-wider border border-white/5">
            VISA
          </div>
          <div className="w-12 h-7 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white/60 tracking-wider border border-white/5">
            MC
          </div>
          <div className="w-12 h-7 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white/60 tracking-wider border border-white/5">
            AMEX
          </div>
        </div>
      </div>
    </footer>
  );
};
