import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface CategoriesProps {
  onCategoryClick: (category: string) => void;
  activeCategory: string;
}

export const Categories: React.FC<CategoriesProps> = ({ onCategoryClick, activeCategory }) => {
  return (
    <section className="py-[80px] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto animate-fadeInUp">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-6">
        <div>
          <h2 className="font-display-serif text-[32px] md:text-display-lg text-primary font-medium">
            Danh Mục Nổi Bật
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-2 font-mono uppercase tracking-widest text-xs">
            // Tuyển tập những dòng sản phẩm được yêu thích nhất
          </p>
        </div>
        <button 
          onClick={() => onCategoryClick('Tất cả')}
          className="hidden md:flex items-center text-primary dark:text-primary-fixed-dim font-semibold text-label-md hover:text-secondary dark:hover:text-secondary-fixed transition-colors group font-mono text-xs tracking-wider"
        >
          XEM TẤT CẢ 
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform text-secondary" />
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[250px]">
        {/* Large Item: Bedroom Furniture */}
        <button
          onClick={() => onCategoryClick('Phòng Ngủ')}
          className={`md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-left block w-full h-full border transition-all duration-500 ${
            activeCategory === 'Phòng Ngủ' 
              ? 'border-secondary ring-1 ring-secondary/50' 
              : 'border-outline-variant/35 hover:border-outline-variant/80'
          }`}
        >
          {/* Subtle inner overlay frame */}
          <div className="absolute inset-4 border border-white/10 rounded-xl z-20 pointer-events-none group-hover:inset-3 transition-all duration-500" />
          
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" 
            alt="Contemporary bedroom set" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqb6HaIhqYSFINioZgapMiKzDkwxsCinNl0TojZGkQwQbJkTIV9IhmdEEr9UeTw5iS6o8Ycqdnnhmj7kQRAfZgjHBBD9MwK_CV_5o8nM51u-wmDD7X4VDbEJUNqGrdzKoJXP_BEDCDjczYhp1CcN5dVpM3-yPl7dmWIryFGRXSmYwHbGrvlmZrVLRDLI4mvIe8hoJlRzirpUae10S4WsL5O-cF77Z8eLl6jFUrWJcf-Wl0eI0wgz7emZ9MbeytROLIz56uytpPvA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 p-8 z-20">
            <span className="inline-block bg-secondary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-md mb-4 border border-secondary-container shadow-md font-mono">
              ĐANG GIẢM GIÁ
            </span>
            <h3 className="font-display-serif text-[28px] md:text-[38px] text-white mb-2 font-medium leading-none">
              Nội Thất Phòng Ngủ
            </h3>
            <p className="text-white/80 font-mono text-xs uppercase tracking-widest flex items-center group-hover:text-white transition-colors">
              MUA SẮM NGAY <ChevronRight className="w-4 h-4 ml-0.5 text-secondary" />
            </p>
          </div>
        </button>

        {/* Small Item 1: Dining Sets */}
        <button
          onClick={() => onCategoryClick('Bàn Ghế Ăn')}
          className={`relative rounded-2xl overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-left block w-full h-full border transition-all duration-500 ${
            activeCategory === 'Bàn Ghế Ăn' 
              ? 'border-secondary ring-1 ring-secondary/50' 
              : 'border-outline-variant/35 hover:border-outline-variant/80'
          }`}
        >
          {/* Subtle inner overlay frame */}
          <div className="absolute inset-3 border border-white/10 rounded-xl z-20 pointer-events-none group-hover:inset-2.5 transition-all duration-500" />
          
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" 
            alt="Elegant dining table setting" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCL68nTTiEgfC0ocTEDEbvx17h00UWYfPI-5kwOAHVOgmlz2uZ85SpL8SDnNbCFIDlfvL1ZewrBL6xtok6NPLe3_Oj5GXH46zQeP5ZydJEqUK08vn2dEE2WxtUFIhsn_ccU8kgRiA7R03dH6vHnXyonieNSmDCDpjUUhaYJDuje8Y1hBFphvPLraamS2VDsRA0G-1gcS-qCuxFRvp_hn8Xy8vjr1kWBSgogJBai97vAVRz3vUMJi11AkVFnzSQhPPMYaFSU0j47Q"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 p-6 z-20">
            <h3 className="font-display-serif text-[24px] text-white mb-1 font-medium">
              Bàn Ghế Ăn
            </h3>
            <p className="text-white/70 font-mono text-[10px] uppercase tracking-widest">
              // 240+ Sản phẩm
            </p>
          </div>
        </button>

        {/* Small Item 2: Decor Accessories */}
        <button
          onClick={() => onCategoryClick('Đồ Trang Trí')}
          className={`relative rounded-2xl overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-left block w-full h-full border transition-all duration-500 ${
            activeCategory === 'Đồ Trang Trí' 
              ? 'border-secondary ring-1 ring-secondary/50' 
              : 'border-outline-variant/35 hover:border-outline-variant/80'
          }`}
        >
          {/* Subtle inner overlay frame */}
          <div className="absolute inset-3 border border-white/10 rounded-xl z-20 pointer-events-none group-hover:inset-2.5 transition-all duration-500" />
          
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" 
            alt="Modern home decoration accessories" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgGOlqTjU7nwoZ9EHyefHCtxTF6fSoB1rb-u4igN5HptoQxydbDtSEPcmJ2jtkSO68CK4Stlc1_1RZ7LnyzjGqkNjxMVHKisWvEetDyTHcu7Ks_l9q2-48g-J60_IUMILjEG_-dxio8Iw4iklUfoAh49T0SlsOEWeOPHwMdyO9mcmzQamM_wA4o-foMDMSkAHe7YbndYTS8F37UX797SLyN_SMaHidk2LuH3P2G4WqpMf2rv-2K0rH1ktuOq_zDkW0ihrfhogcag"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 p-6 z-20">
            <h3 className="font-display-serif text-[24px] text-white mb-1 font-medium">
              Đồ Trang Trí
            </h3>
            <p className="text-white/70 font-mono text-[10px] uppercase tracking-widest">
              // Mới cập nhật
            </p>
          </div>
        </button>
      </div>
    </section>
  );
};
