import React from 'react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative w-full py-16 md:py-24 bg-surface transition-colors duration-300 overflow-hidden border-b border-outline-variant/20">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Main Grid Container */}
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Editorial Typography & CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start text-left animate-fadeInUp">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              [ BỘ SƯU TẬP MÙA HÈ ]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              Edition 2026
            </span>
          </div>

          <h1 className="font-display-serif text-[42px] leading-[48px] md:text-[68px] md:leading-[74px] font-medium text-primary mb-6 tracking-tight">
            Phong cách sống <br />
            <span className="italic font-normal text-secondary">tinh tế</span> &amp; hiện đại
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-tertiary-fixed-dim/80 mb-8 max-w-[500px] leading-relaxed">
            Khám phá những thiết kế nội thất tuyển chọn, mang đến không gian sống hoàn hảo, sang trọng và đầy cảm hứng nghệ thuật cho ngôi nhà của bạn.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onExploreClick}
              className="btn-push text-label-md px-8 py-3.5"
            >
              Khám Phá Ngay
            </button>
            <button 
              onClick={onExploreClick}
              className="btn-push-outline text-label-md px-8 py-3.5"
            >
              Xem Bộ Sưu Tập
            </button>
          </div>
        </div>

        {/* Right Side: Elegant Framed Showcase Image */}
        <div className="lg:col-span-6 animate-fadeInUp delay-100">
          <div className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 group">
            {/* Outline highlight ornament */}
            <div className="absolute inset-4 border border-white/20 rounded-xl z-20 pointer-events-none transition-all duration-500 group-hover:inset-3" />
            
            <img 
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 animate-zoomSlow" 
              alt="A luxurious modern living room setting featuring high-end minimalist furniture" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc_NLLgeQi4KRnn31YHOuYJDD_D0pTWhujLu4e5fQtYwLiVznYLd2udhXb_FTCVU8Fm1tVI2bNLRy24LXM0ih-eF4EIfAvyTjOq_pM48wCG5iY7EUGtbGWWsA_cBSnx_sNNGeTHR2EG-fDTp1g6ZWtuH7-grqV0St2km6RUvMlNyH6hlXGrkK7ITiAzjKV2mO395CYOXDEM7jpMKSbdaN5JqS8Jp92MeGdHzErIUkBqw4kc0V8LXK9JnQc13mNHVgn82YMRgFgOA"
            />
            
            {/* Subtle shade gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none z-10" />
            
            {/* Subtle technical corner label */}
            <div className="absolute bottom-4 left-6 z-20 font-mono text-[10px] text-white/80 uppercase tracking-widest bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded">
              Lusso Living / Ref. 047
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
