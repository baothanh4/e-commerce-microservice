import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, Sun, Moon, Menu, X, User } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  wishlistCount: number;
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard', sortBy?: string) => void;
  currentView: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard';
  currentSortBy: string;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  cartCount,
  onCartClick,
  isDarkMode,
  toggleDarkMode,
  wishlistCount,
  onNavigate,
  currentView,
  currentSortBy,
  currentUser,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface-container-lowest dark:bg-tertiary-container w-full sticky top-0 z-50 shadow-sm border-b border-outline-variant/30 transition-all duration-300">
      <div className="flex items-center justify-between w-full px-margin-mobile md:px-margin-desktop py-4">
        {/* Brand */}
        <button 
          onClick={() => onNavigate('home')}
          className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight hover:opacity-90 transition-opacity focus:outline-none"
        >
          LuxeCommerce
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-gutter items-center">
          <button 
            onClick={() => onNavigate('home')}
            className={`transition-colors font-body-md text-body-md focus:outline-none ${
              currentView === 'home' ? 'text-secondary dark:text-secondary-fixed font-bold border-b-2 border-secondary dark:border-secondary-fixed pb-1' : 'text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary'
            }`}
          >
            Trang Chủ
          </button>
          <button 
            onClick={() => onNavigate('products', 'Mới nhất')}
            className={`transition-colors font-body-md text-body-md focus:outline-none ${
              currentView === 'products' && currentSortBy === 'Mới nhất' ? 'text-secondary dark:text-secondary-fixed font-bold border-b-2 border-secondary dark:border-secondary-fixed pb-1' : 'text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary'
            }`}
          >
            New Arrivals
          </button>
          <button 
            onClick={() => onNavigate('products', 'Phổ biến nhất')}
            className={`transition-colors font-body-md text-body-md focus:outline-none ${
              currentView === 'products' && currentSortBy !== 'Mới nhất' ? 'text-secondary dark:text-secondary-fixed font-bold border-b-2 border-secondary dark:border-secondary-fixed pb-1' : 'text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary'
            }`}
          >
            Categories
          </button>
          <button 
            onClick={() => onNavigate('products')}
            className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary dark:hover:text-secondary-fixed transition-colors font-body-md text-body-md focus:outline-none"
          >
            Promotions
          </button>
          <button 
            onClick={() => onNavigate('products')}
            className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary dark:hover:text-secondary-fixed transition-colors font-body-md text-body-md focus:outline-none"
          >
            Brands
          </button>
          {currentUser && currentUser.role === 'ADMIN' && (
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors font-body-md text-body-md focus:outline-none ${
                currentView === 'dashboard' ? 'text-secondary dark:text-secondary-fixed font-bold border-b-2 border-secondary dark:border-secondary-fixed pb-1' : 'text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Actions (Search & Icons) */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="hidden md:flex items-center border border-outline-variant/60 rounded-lg px-3 py-2 bg-surface-bright dark:bg-surface-container/30 focus-within:border-secondary transition-colors w-[240px]">
            <Search className="text-outline w-4 h-4 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none focus:ring-0 text-body-sm font-body-sm text-on-surface placeholder:text-outline w-full p-0"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="text-outline hover:text-on-surface text-xs font-semibold px-1"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-primary dark:text-inverse-primary hover:text-secondary dark:hover:text-secondary-fixed transition-all scale-95 duration-150 ease-in-out p-2 rounded-full hover:bg-surface-container-highest dark:hover:bg-surface-container-low"
            title="Chuyển chế độ sáng/tối"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Wishlist Button */}
          <button className="text-primary dark:text-inverse-primary hover:text-secondary dark:hover:text-secondary-fixed transition-all scale-95 duration-150 ease-in-out p-2 rounded-full hover:bg-surface-container-highest dark:hover:bg-surface-container-low relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="text-primary dark:text-inverse-primary hover:text-secondary dark:hover:text-secondary-fixed transition-all scale-95 duration-150 ease-in-out p-2 rounded-full hover:bg-surface-container-highest dark:hover:bg-surface-container-low relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login/User Button */}
          {currentUser ? (
            <div className="hidden md:flex items-center gap-3">
              <div 
                onClick={() => onNavigate('profile')} 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container dark:from-primary-fixed-dim dark:to-primary-container text-white font-bold flex items-center justify-center cursor-pointer select-none text-[12px] shadow-sm hover:scale-105 transition-transform"
                title="Xem hồ sơ cá nhân"
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface dark:text-inverse-on-surface select-none">
                Hi, <strong onClick={() => onNavigate('profile')} className="text-secondary dark:text-secondary-fixed-dim cursor-pointer hover:underline">{currentUser.name}</strong>
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-surface-container dark:bg-surface-container/20 text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-error dark:hover:text-error-container hover:bg-error/10 dark:hover:bg-error-container/10 border border-outline-variant/40 dark:border-outline-variant/15 rounded-lg font-label-sm text-[12px] transition-all duration-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className={`hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-sm text-label-sm transition-all duration-200 active:scale-95 ${
                currentView === 'login' || currentView === 'register'
                  ? 'bg-primary dark:bg-primary-fixed text-on-primary dark:text-primary shadow-md'
                  : 'bg-surface-container dark:bg-surface-container/20 text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container/30 border border-outline-variant/40 dark:border-outline-variant/15'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary dark:text-inverse-primary hover:text-secondary transition-colors p-2 rounded-full hover:bg-surface-container-highest"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest dark:bg-tertiary-container border-t border-outline-variant/30 py-4 px-margin-mobile flex flex-col gap-4 animate-fadeIn">
          {/* Search bar mobile */}
          <div className="flex items-center border border-outline-variant/60 rounded-lg px-3 py-2 bg-surface-bright dark:bg-surface-container/30">
            <Search className="text-outline w-4 h-4 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none focus:ring-0 text-body-sm font-body-sm text-on-surface placeholder:text-outline w-full p-0"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
              className={`py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none ${
                currentView === 'home' ? 'text-secondary dark:text-secondary-fixed font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              Trang Chủ
            </button>
            <button 
              onClick={() => { onNavigate('products', 'Mới nhất'); setIsMobileMenuOpen(false); }}
              className={`py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none ${
                currentView === 'products' && currentSortBy === 'Mới nhất' ? 'text-secondary dark:text-secondary-fixed font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              New Arrivals
            </button>
            <button 
              onClick={() => { onNavigate('products', 'Phổ biến nhất'); setIsMobileMenuOpen(false); }}
              className={`py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none ${
                currentView === 'products' && currentSortBy !== 'Mới nhất' ? 'text-secondary dark:text-secondary-fixed font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              Categories
            </button>
            <button 
              onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }}
              className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none"
            >
              Promotions
            </button>
            <button 
              onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }}
              className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none"
            >
              Brands
            </button>
            {currentUser && currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }}
                className={`py-2 font-body-md text-body-md border-b border-outline-variant/10 text-left focus:outline-none ${
                  currentView === 'dashboard' ? 'text-secondary dark:text-secondary-fixed font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
                }`}
              >
                Dashboard
              </button>
            )}
            {currentUser ? (
              <div className="flex flex-col gap-2 mt-2 py-2 px-4 bg-surface-container/50 dark:bg-surface-container/10 rounded-lg">
                <span className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface select-none">
                  Hi, <strong onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }} className="text-secondary dark:text-secondary-fixed-dim cursor-pointer hover:underline">{currentUser.name}</strong>
                </span>
                <button
                  onClick={() => { if (onLogout) onLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full text-center py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-md text-label-md transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                className={`py-2 font-body-md text-body-md text-left focus:outline-none mt-2 flex items-center gap-2 px-4 rounded-lg transition-colors ${
                  currentView === 'login'
                    ? 'bg-primary dark:bg-primary-fixed text-on-primary dark:text-primary font-bold'
                    : 'bg-surface-container dark:bg-surface-container/20 text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high'
                }`}
              >
                <User className="w-4 h-4" />
                Đăng Nhập
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
