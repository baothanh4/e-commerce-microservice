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
    <footer className="bg-[#181818] w-full pt-20 pb-10 border-t border-white/5 text-white/80">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-16">
        {/* Brand Info */}
        <div className="col-span-1">
          <div className="font-display-serif text-3xl font-medium text-white mb-4">
            LuxeCommerce
          </div>
          <p className="text-white/50 font-body-sm text-xs mb-6 max-w-[220px] leading-relaxed">
            Nâng tầm không gian sống của bạn với những thiết kế nội thất hiện đại, tinh tế và chất lượng vượt trội.
          </p>
          <div className="flex gap-3">
            <a 
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all p-2 bg-white/5 rounded-full" 
              href="#"
              title="Global website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a 
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all p-2 bg-white/5 rounded-full" 
              href="#"
              title="Share LuxeCommerce"
            >
              <Share2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="col-span-1">
          <h4 className="font-mono text-[11px] text-white/90 uppercase tracking-widest font-bold mb-4 pb-2 border-b border-white/10 w-fit">
            Hỗ Trợ Khách Hàng
          </h4>
          <ul className="space-y-3 flex flex-col">
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Vận chuyển & Giao nhận
            </a>
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Chính sách bảo hành
            </a>
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Liên hệ tư vấn
            </a>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="col-span-1">
          <h4 className="font-mono text-[11px] text-white/90 uppercase tracking-widest font-bold mb-4 pb-2 border-b border-white/10 w-fit">
            Về Chúng Tôi
          </h4>
          <ul className="space-y-3 flex flex-col">
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Câu chuyện thiết kế
            </a>
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Điều khoản dịch vụ
            </a>
            <a className="text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider w-fit" href="#">
              Chính sách bảo mật
            </a>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-1">
          <h4 className="font-mono text-[11px] text-white/90 uppercase tracking-widest font-bold mb-4 pb-2 border-b border-white/10 w-fit">
            Đăng Ký Nhận Tin
          </h4>
          <p className="text-white/50 font-body-sm text-xs mb-4 leading-relaxed">
            Nhận thông tin về các bộ sưu tập mới và ưu đãi độc quyền sớm nhất.
          </p>
          
          {isSubscribed ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md p-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider animate-fadeIn">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Đăng ký thành công!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-xs placeholder:text-white/20 focus:border-white focus:outline-none outline-none transition-all"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="btn-push-outline border-white/30 text-white hover:bg-white/10 px-3.5 py-2 rounded-md transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright & Payments */}
      <div className="border-t border-white/5 pt-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/30 font-mono text-[10px] uppercase tracking-wider">
          © 2026 LuxeCommerce. All rights reserved. Designed with sophistication.
        </p>
        <div className="flex gap-2">
          {/* Payment methods */}
          <div className="w-10 h-6 bg-white/5 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white/40 tracking-wider border border-white/5">
            VISA
          </div>
          <div className="w-10 h-6 bg-white/5 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white/40 tracking-wider border border-white/5">
            MC
          </div>
          <div className="w-10 h-6 bg-white/5 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white/40 tracking-wider border border-white/5">
            AMEX
          </div>
        </div>
      </div>
    </footer>
  );
};
