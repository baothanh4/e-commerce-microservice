import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingCart, Heart, Sun, Moon, Menu, X, User } from 'lucide-react';
import type { Product } from '../types';

interface HeaderProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  wishlistCount: number;
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard' | 'checkout' | 'order-detail', sortBy?: string) => void;
  currentView: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard' | 'checkout' | 'order-detail';
  currentSortBy: string;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onProductClick?: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
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
  onProductClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Sync local query with search query prop if changed from parent
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideDesktop = searchRef.current?.contains(target);
      const clickedInsideMobile = mobileSearchRef.current?.contains(target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions
  const suggestions = useMemo(() => {
    const trimmed = localQuery.trim().toLowerCase();
    if (!trimmed) return [];

    // If query is specifically about bedroom, prioritize bedroom products
    const isBedroomSearch = trimmed === 'phòng ngủ' || trimmed === 'phong ngu' || trimmed.includes('phòng ngủ') || trimmed.includes('phong ngu');
    if (isBedroomSearch) {
      return products.filter(p => 
        (p.subCategory && p.subCategory.toLowerCase() === 'phòng ngủ') ||
        (p.category && p.category.toLowerCase() === 'phòng ngủ') ||
        p.name.toLowerCase().includes('giường') ||
        p.description.toLowerCase().includes('phòng ngủ')
      );
    }

    // Generic match
    return products.filter(p => 
      p.name.toLowerCase().includes(trimmed) ||
      (p.category && p.category.toLowerCase().includes(trimmed)) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(trimmed)) ||
      p.description.toLowerCase().includes(trimmed)
    ).slice(0, 5); // limit to 5 suggestions
  }, [localQuery, products]);

  return (
    <header className="bg-surface-container-lowest dark:bg-tertiary-container w-full sticky top-0 z-50 shadow-[0_1px_10px_rgba(0,0,0,0.02)] border-b border-outline-variant/15 transition-all duration-300 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
      <div className="flex items-center justify-between w-full px-margin-mobile md:px-margin-desktop py-4">
        {/* Brand */}
        <button 
          onClick={() => onNavigate('home')}
          className="font-display-serif text-3xl font-medium text-primary dark:text-primary-fixed-dim tracking-tight hover:opacity-85 transition-opacity focus:outline-none"
        >
          LuxeCommerce
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-6 items-center">
          {['home', 'products-new', 'products-cat', 'promotions', 'brands'].map((item) => {
            let label = '';
            let isActive = false;
            let onClick = () => {};

            if (item === 'home') {
              label = 'Trang Chủ';
              isActive = currentView === 'home';
              onClick = () => onNavigate('home');
            } else if (item === 'products-new') {
              label = 'New Arrivals';
              isActive = currentView === 'products' && currentSortBy === 'Mới nhất';
              onClick = () => onNavigate('products', 'Mới nhất');
            } else if (item === 'products-cat') {
              label = 'Categories';
              isActive = currentView === 'products' && currentSortBy !== 'Mới nhất';
              onClick = () => onNavigate('products', 'Phổ biến nhất');
            } else if (item === 'promotions') {
              label = 'Promotions';
              isActive = false;
              onClick = () => onNavigate('products');
            } else if (item === 'brands') {
              label = 'Brands';
              isActive = false;
              onClick = () => onNavigate('products');
            }

            return (
              <button
                key={item}
                onClick={onClick}
                className={`transition-all font-mono text-[11px] uppercase tracking-widest focus:outline-none relative py-1 hover:text-secondary ${
                  isActive 
                    ? 'text-secondary font-bold font-display-serif italic text-sm normal-case tracking-normal' 
                    : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
                }`}
              >
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </button>
            );
          })}
          {currentUser && currentUser.role === 'ADMIN' && (
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`transition-all font-mono text-[11px] uppercase tracking-widest focus:outline-none relative py-1 hover:text-secondary ${
                currentView === 'dashboard' 
                  ? 'text-secondary font-bold font-display-serif italic text-sm normal-case tracking-normal' 
                  : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              <span>Dashboard</span>
              {currentView === 'dashboard' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
              )}
            </button>
          )}
        </nav>

        {/* Actions (Search & Icons) */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div ref={searchRef} className="hidden md:flex items-center relative border border-outline-variant/30 rounded-md px-3 py-1.5 bg-surface-container-lowest focus-within:border-secondary transition-colors w-[220px]">
            <Search className="text-outline w-3.5 h-3.5 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none focus:ring-0 text-xs text-on-surface placeholder:text-outline w-full p-0"
              placeholder="Tìm kiếm..."
              value={localQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(localQuery);
                  setShowSuggestions(false);
                }
              }}
            />
            {localQuery && (
              <button 
                onClick={() => {
                  setLocalQuery('');
                  setSearchQuery('');
                  setShowSuggestions(false);
                }} 
                className="text-outline hover:text-on-surface font-mono text-[9px] uppercase tracking-wider px-1"
              >
                Xóa
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-[300px] bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.06)] z-50 overflow-hidden animate-fadeInUp">
                <div className="p-2 border-b border-outline-variant/10 font-mono text-[9px] text-outline tracking-wider uppercase bg-surface-container-low/30">
                  Gợi ý sản phẩm
                </div>
                <div className="max-h-[260px] overflow-y-auto divide-y divide-outline-variant/10">
                  {suggestions.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        if (onProductClick) onProductClick(product);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-10 h-10 rounded object-cover bg-surface-container-low shrink-0 border border-outline-variant/10"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-display-serif text-sm font-medium text-on-surface truncate">
                          {product.name}
                        </h4>
                        <p className="font-mono text-xs text-secondary font-bold mt-0.5">
                          {product.price.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && localQuery.trim() !== '' && suggestions.length === 0 && (
              <div className="absolute top-full right-0 mt-2 w-[300px] bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-lg z-50 overflow-hidden p-4 text-center text-outline font-mono text-[10px] uppercase tracking-wider">
                Không tìm thấy gợi ý nào
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-primary dark:text-inverse-primary hover:text-secondary transition-all scale-95 duration-150 p-2 rounded-full hover:bg-surface-container-low active:scale-90"
            title="Chuyển chế độ sáng/tối"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Wishlist Button */}
          <button className="text-primary dark:text-inverse-primary hover:text-secondary transition-all scale-95 duration-150 p-2 rounded-full hover:bg-surface-container-low active:scale-90 relative">
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white dark:border-tertiary-container">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="text-primary dark:text-inverse-primary hover:text-secondary transition-all scale-95 duration-150 p-2 rounded-full hover:bg-surface-container-low active:scale-90 relative"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white dark:border-tertiary-container">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login/User Button */}
          {currentUser ? (
            <div className="hidden md:flex items-center gap-3">
              <div 
                onClick={() => onNavigate('profile')} 
                className="w-7 h-7 rounded-full bg-secondary text-white font-mono flex items-center justify-center cursor-pointer select-none text-[10px] shadow-sm hover:scale-105 transition-transform"
                title="Xem hồ sơ cá nhân"
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-body-sm text-xs text-on-surface dark:text-inverse-on-surface select-none">
                Hi, <strong onClick={() => onNavigate('profile')} className="text-secondary cursor-pointer hover:underline">{currentUser.name}</strong>
              </span>
              <button
                onClick={onLogout}
                className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-on-surface-variant hover:text-error hover:bg-error/5 border border-outline-variant/30 rounded-md transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all duration-200 ${
                currentView === 'login' || currentView === 'register'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-transparent border border-outline-variant/30 text-primary hover:bg-surface-container-low'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary dark:text-inverse-primary hover:text-secondary transition-colors p-2 rounded-full"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest dark:bg-tertiary-container border-t border-outline-variant/15 py-4 px-margin-mobile flex flex-col gap-4 animate-fadeIn">
          {/* Search bar mobile */}
          <div ref={mobileSearchRef} className="relative flex items-center border border-outline-variant/30 rounded-md px-3 py-2 bg-surface-container-lowest">
            <Search className="text-outline w-4 h-4 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none focus:ring-0 text-xs text-on-surface placeholder:text-outline w-full p-0"
              placeholder="Tìm kiếm..."
              value={localQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(localQuery);
                  setShowSuggestions(false);
                  setIsMobileMenuOpen(false);
                }
              }}
            />
            {localQuery && (
              <button 
                onClick={() => {
                  setLocalQuery('');
                  setSearchQuery('');
                  setShowSuggestions(false);
                }} 
                className="text-outline hover:text-on-surface font-mono text-[9px] uppercase tracking-wider px-1"
              >
                Xóa
              </button>
            )}

            {/* Mobile suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-outline-variant/10 font-mono text-[9px] text-outline tracking-wider uppercase bg-surface-container-low/30">
                  Gợi ý sản phẩm
                </div>
                <div className="max-h-[180px] overflow-y-auto divide-y divide-outline-variant/10">
                  {suggestions.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        if (onProductClick) onProductClick(product);
                        setShowSuggestions(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-10 h-10 rounded object-cover bg-surface-container-low shrink-0 border border-outline-variant/10"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-display-serif text-sm font-medium text-on-surface truncate">
                          {product.name}
                        </h4>
                        <p className="font-mono text-xs text-secondary font-bold mt-0.5">
                          {product.price.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
              className={`py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none ${
                currentView === 'home' ? 'text-secondary font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              Trang Chủ
            </button>
            <button 
              onClick={() => { onNavigate('products', 'Mới nhất'); setIsMobileMenuOpen(false); }}
              className={`py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none ${
                currentView === 'products' && currentSortBy === 'Mới nhất' ? 'text-secondary font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              New Arrivals
            </button>
            <button 
              onClick={() => { onNavigate('products', 'Phổ biến nhất'); setIsMobileMenuOpen(false); }}
              className={`py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none ${
                currentView === 'products' && currentSortBy !== 'Mới nhất' ? 'text-secondary font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
              }`}
            >
              Categories
            </button>
            <button 
              onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }}
              className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none"
            >
              Promotions
            </button>
            <button 
              onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }}
              className="text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-secondary py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none"
            >
              Brands
            </button>
            {currentUser && currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }}
                className={`py-2 text-left font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant/5 focus:outline-none ${
                  currentView === 'dashboard' ? 'text-secondary font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim'
                }`}
              >
                Dashboard
              </button>
            )}
            {currentUser ? (
              <div className="flex flex-col gap-2 mt-2 py-2 px-3 bg-surface-container-low rounded-md">
                <span className="font-body-md text-xs text-on-surface dark:text-inverse-on-surface select-none">
                  Hi, <strong onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }} className="text-secondary cursor-pointer hover:underline">{currentUser.name}</strong>
                </span>
                <button
                  onClick={() => { if (onLogout) onLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full text-center py-2 bg-error/5 hover:bg-error/10 text-error rounded-md font-mono text-[10px] uppercase tracking-wider transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                className={`py-2 text-left font-mono text-[10px] uppercase tracking-widest focus:outline-none mt-2 flex items-center gap-2 px-3 rounded-md transition-colors ${
                  currentView === 'login'
                    ? 'bg-secondary text-white font-bold'
                    : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
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
