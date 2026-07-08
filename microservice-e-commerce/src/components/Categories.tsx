import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface CategoriesProps {
  onCategoryClick: (category: string) => void;
  activeCategory: string;
}

export const Categories: React.FC<CategoriesProps> = ({ onCategoryClick, activeCategory }) => {
  return (
    <section className="py-[80px] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">
            Danh Mục Nổi Bật
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-2">
            Tuyển tập những dòng sản phẩm được yêu thích nhất.
          </p>
        </div>
        <button 
          onClick={() => onCategoryClick('Tất cả')}
          className="hidden md:flex items-center text-primary dark:text-primary-fixed-dim font-semibold text-label-md hover:text-secondary dark:hover:text-secondary-fixed transition-colors group"
        >
          Xem Tất Cả 
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[250px]">
        {/* Large Item: Bedroom Furniture */}
        <button
          onClick={() => onCategoryClick('Phòng Ngủ')}
          className={`md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-left block w-full h-full border ${
            activeCategory === 'Phòng Ngủ' ? 'border-secondary ring-2 ring-secondary/50' : 'border-outline-variant/35'
          }`}
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Contemporary bedroom set" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqb6HaIhqYSFINioZgapMiKzDkwxsCinNl0TojZGkQwQbJkTIV9IhmdEEr9UeTw5iS6o8Ycqdnnhmj7kQRAfZgjHBBD9MwK_CV_5o8nM51u-wmDD7X4VDbEJUNqGrdzKoJXP_BEDCDjczYhp1CcN5dVpM3-yPl7dmWIryFGRXSmYwHbGrvlmZrVLRDLI4mvIe8hoJlRzirpUae10S4WsL5O-cF77Z8eLl6jFUrWJcf-Wl0eI0wgz7emZ9MbeytROLIz56uytpPvA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="inline-block bg-secondary text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">
              Đang giảm giá
            </span>
            <h3 className="font-headline-md text-[20px] md:text-headline-md text-white mb-2 font-bold">
              Nội Thất Phòng Ngủ
            </h3>
            <p className="text-white/80 font-body-sm text-body-sm flex items-center group-hover:text-white transition-colors">
              Mua sắm ngay <ChevronRight className="w-4 h-4 ml-0.5" />
            </p>
          </div>
        </button>

        {/* Small Item 1: Dining Sets */}
        <button
          onClick={() => onCategoryClick('Bàn Ghế Ăn')}
          className={`relative rounded-xl overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-left block w-full h-full border ${
            activeCategory === 'Bàn Ghế Ăn' ? 'border-secondary ring-2 ring-secondary/50' : 'border-outline-variant/35'
          }`}
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Elegant dining table setting" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCL68nTTiEgfC0ocTEDEbvx17h00UWYfPI-5kwOAHVOgmlz2uZ85SpL8SDnNbCFIDlfvL1ZewrBL6xtok6NPLe3_Oj5GXH46zQeP5ZydJEqUK08vn2dEE2WxtUFIhsn_ccU8kgRiA7R03dH6vHnXyonieNSmDCDpjUUhaYJDuje8Y1hBFphvPLraamS2VDsRA0G-1gcS-qCuxFRvp_hn8Xy8vjr1kWBSgogJBai97vAVRz3vUMJi11AkVFnzSQhPPMYaFSU0j47Q"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="font-headline-sm text-headline-sm text-white mb-1 font-semibold">
              Bàn Ghế Ăn
            </h3>
            <p className="text-white/70 font-body-sm text-body-sm">
              240+ Sản phẩm
            </p>
          </div>
        </button>

        {/* Small Item 2: Decor Accessories */}
        <button
          onClick={() => onCategoryClick('Đồ Trang Trí')}
          className={`relative rounded-xl overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-left block w-full h-full border ${
            activeCategory === 'Đồ Trang Trí' ? 'border-secondary ring-2 ring-secondary/50' : 'border-outline-variant/35'
          }`}
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Modern home decoration accessories" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgGOlqTjU7nwoZ9EHyefHCtxTF6fSoB1rb-u4igN5HptoQxydbDtSEPcmJ2jtkSO68CK4Stlc1_1RZ7LnyzjGqkNjxMVHKisWvEetDyTHcu7Ks_l9q2-48g-J60_IUMILjEG_-dxio8Iw4iklUfoAh49T0SlsOEWeOPHwMdyO9mcmzQamM_wA4o-foMDMSkAHe7YbndYTS8F37UX797SLyN_SMaHidk2LuH3P2G4WqpMf2rv-2K0rH1ktuOq_zDkW0ihrfhogcag"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="font-headline-sm text-headline-sm text-white mb-1 font-semibold">
              Đồ Trang Trí
            </h3>
            <p className="text-white/70 font-body-sm text-body-sm">
              Mới cập nhật
            </p>
          </div>
        </button>
      </div>
    </section>
  );
};
