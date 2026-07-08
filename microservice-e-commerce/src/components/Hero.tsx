import React from 'react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative w-full h-[550px] md:h-[600px] flex items-center bg-surface-container-high overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 animate-pulse-slow opacity-75 dark:opacity-50 transition-opacity duration-300"
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAc_NLLgeQi4KRnn31YHOuYJDD_D0pTWhujLu4e5fQtYwLiVznYLd2udhXb_FTCVU8Fm1tVI2bNLRy24LXM0ih-eF4EIfAvyTjOq_pM48wCG5iY7EUGtbGWWsA_cBSnx_sNNGeTHR2EG-fDTp1g6ZWtuH7-grqV0St2km6RUvMlNyH6hlXGrkK7ITiAzjKV2mO395CYOXDEM7jpMKSbdaN5JqS8Jp92MeGdHzErIUkBqw4kc0V8LXK9JnQc13mNHVgn82YMRgFgOA')" 
        }}
        aria-label="A luxurious modern living room setting featuring high-end minimalist furniture"
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[600px] bg-surface-container-lowest/85 dark:bg-tertiary-container/85 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-xl border border-outline-variant/40 transition-colors duration-300">
          <span className="inline-block bg-surface-container dark:bg-surface-container-low px-3 py-1 rounded-full text-label-sm font-label-sm text-primary dark:text-primary-fixed-dim mb-4 tracking-wide font-semibold">
            Bộ Sưu Tập Mùa Hè
          </span>
          <h1 className="font-display-lg text-[32px] leading-[40px] md:text-display-lg md:leading-[56px] font-bold text-primary dark:text-primary-fixed mb-6 tracking-tight">
            Phong Cách Sống Tinh Tế &amp; Hiện Đại
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-tertiary-fixed-dim/80 mb-8 leading-relaxed">
            Khám phá những thiết kế nội thất tuyển chọn, mang đến không gian sống hoàn hảo, sang trọng và đầy cảm hứng cho ngôi nhà của bạn.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onExploreClick}
              className="bg-secondary-container hover:bg-secondary text-white font-semibold text-label-md px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-200"
            >
              Khám Phá Ngay
            </button>
            <button 
              onClick={onExploreClick}
              className="bg-transparent border border-primary dark:border-primary-fixed text-primary dark:text-primary-fixed font-semibold text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-highest/55 dark:hover:bg-surface-container-low transition-all transform hover:-translate-y-0.5 duration-200"
            >
              Xem Bộ Sưu Tập
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
