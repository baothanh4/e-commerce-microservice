import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Breadcrumbs } from './Breadcrumbs';
import { Star, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onProductClick: (product: Product) => void;
  favorites: number[];
  onToggleFavorite: (productId: number, e: React.MouseEvent) => void;
  onNavigate: (view: 'home' | 'products' | 'detail', sortBy?: string) => void;
  searchQuery: string;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  activeCategory,
  onCategoryChange,
  onAddToCart,
  onProductClick,
  favorites,
  onToggleFavorite,
  onNavigate,
  searchQuery,
  sortBy,
  setSortBy,
}) => {
  // Local Filter States
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available brands to filter
  const brands = ['LussoDesign', 'OakaHome', 'ClassicHome', 'UrbanWood'];

  // Handle brand checkbox changes
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  // Handle price application
  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice ? parseFloat(minPrice) : null);
    setAppliedMaxPrice(maxPrice ? parseFloat(maxPrice) : null);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setSelectedBrands([]);
    setMinRating(null);
    setSelectedSize(null);
    onCategoryChange('Tất cả');
    setCurrentPage(1);
  };

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply Category/Functional Space Filter
    if (activeCategory && activeCategory !== 'Tất cả') {
      result = result.filter(p => p.subCategory === activeCategory || p.category === activeCategory);
    }

    // Apply Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.material.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(query))
      );
    }

    // Apply Price Filter
    if (appliedMinPrice !== null) {
      result = result.filter(p => p.price >= appliedMinPrice);
    }
    if (appliedMaxPrice !== null) {
      result = result.filter(p => p.price <= appliedMaxPrice);
    }

    // Apply Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Apply Rating Filter
    if (minRating !== null) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Apply Size Filter
    if (selectedSize !== null) {
      result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
    }

    // Apply Sort
    if (sortBy === 'Giá: Thấp đến Cao') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Giá: Cao đến Thấp') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Mới nhất') {
      // Simulate newness using ID desc
      result.sort((a, b) => b.id - a.id);
    } else {
      // Popularity (highest ratings first)
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, appliedMinPrice, appliedMaxPrice, selectedBrands, minRating, selectedSize, sortBy, searchQuery, activeCategory]);

  // Pagination logic (4 items per page for catalog simulation)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const startItemIndex = (currentPage - 1) * itemsPerPage + 1;
  const endItemIndex = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length);

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 animate-fadeInUp">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        paths={[
          { label: 'Trang chủ', view: 'home' },
          { label: 'Danh mục sản phẩm', view: 'products' }
        ]} 
        onNavigate={onNavigate}
      />

      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Sidebar / Filters (Desktop) */}
        <aside className="hidden md:block w-1/4 lg:w-1/5 shrink-0 flex flex-col gap-8 select-none border-r border-outline-variant/15 pr-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <h2 className="font-display-serif text-2xl text-primary font-medium">
              Bộ Lọc
            </h2>
            <button 
              onClick={handleResetFilters}
              className="font-mono text-[10px] text-secondary hover:text-accent-hover uppercase tracking-widest font-semibold transition-colors"
            >
              Đặt lại
            </button>
          </div>

          {/* Lọc không gian chức năng */}
          <div className="mb-2">
            <h3 className="font-mono text-[11px] text-primary/80 dark:text-primary-fixed uppercase tracking-widest font-bold mb-4 pb-2 border-b border-outline-variant/10">
              Không gian
            </h3>
            <div className="space-y-3">
              {['Tất cả', 'Phòng Khách', 'Phòng Ngủ', 'Bàn Ghế Ăn', 'Đồ Trang Trí'].map(space => (
                <button
                  key={space}
                  onClick={() => { onCategoryChange(space); setCurrentPage(1); }}
                  className={`flex items-center justify-between text-left transition-colors w-full focus:outline-none group`}
                >
                  <span className={`font-body-sm text-sm transition-all ${
                    activeCategory === space 
                      ? 'text-secondary font-semibold font-display-serif italic text-base' 
                      : 'text-on-surface-variant dark:text-tertiary-fixed-dim/80 group-hover:text-secondary'
                  }`}>
                    {space}
                  </span>
                  {activeCategory === space && (
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc khoảng giá */}
          <div className="mb-2">
            <h3 className="font-mono text-[11px] text-primary/80 dark:text-primary-fixed uppercase tracking-widest font-bold mb-4 pb-2 border-b border-outline-variant/10">
              Khoảng giá (VND)
            </h3>
            <form onSubmit={handleApplyPrice} className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  className="w-full bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-md px-3 py-1.5 font-mono text-xs text-on-surface placeholder:text-outline focus:border-secondary outline-none transition-all" 
                  placeholder="Từ" 
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-on-surface-variant/50 font-mono text-xs">-</span>
                <input 
                  className="w-full bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-md px-3 py-1.5 font-mono text-xs text-on-surface placeholder:text-outline focus:border-secondary outline-none transition-all" 
                  placeholder="Đến" 
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="btn-push-outline w-full py-2 text-xs font-mono tracking-wider"
              >
                ÁP DỤNG
              </button>
            </form>
          </div>

          {/* Lọc thương hiệu */}
          <div className="mb-2">
            <h3 className="font-mono text-[11px] text-primary/80 dark:text-primary-fixed uppercase tracking-widest font-bold mb-4 pb-2 border-b border-outline-variant/10">
              Thương hiệu
            </h3>
            <div className="space-y-3">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group select-none">
                  <input 
                    className="w-4 h-4 rounded border-outline-variant/40 text-secondary focus:ring-secondary/20 bg-transparent cursor-pointer" 
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="font-body-sm text-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80 group-hover:text-secondary transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Lọc đánh giá */}
          <div className="mb-2">
            <h3 className="font-mono text-[11px] text-primary/80 dark:text-primary-fixed uppercase tracking-widest font-bold mb-4 pb-2 border-b border-outline-variant/10">
              Đánh giá
            </h3>
            <div className="space-y-3">
              {[5, 4, 3].map(rating => (
                <button
                  key={rating}
                  onClick={() => { setMinRating(rating); setCurrentPage(1); }}
                  className={`flex items-center justify-between text-left hover:text-secondary transition-colors w-full focus:outline-none ${
                    minRating === rating ? 'text-secondary font-semibold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim/80'
                  }`}
                >
                  <div className="flex text-[#F59E0B] space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < rating ? 'fill-current' : 'opacity-15'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                    {rating === 5 ? 'Tuyệt đối' : '& Trở lên'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lọc kích thước */}
          <div>
            <h3 className="font-mono text-[11px] text-primary/80 dark:text-primary-fixed uppercase tracking-widest font-bold mb-4 pb-2 border-b border-outline-variant/10">
              Quy mô
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Compact', 'Standard', 'Deluxe', 'King'].map(size => (
                <button
                  key={size}
                  onClick={() => { 
                    setSelectedSize(selectedSize === size ? null : size); 
                    setCurrentPage(1); 
                  }}
                  className={`px-3 py-1.5 border rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all focus:outline-none ${
                    selectedSize === size
                      ? 'bg-secondary text-white border-secondary shadow-sm'
                      : 'bg-transparent border-outline-variant/30 text-on-surface hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Sheet Button */}
        <div className="md:hidden flex gap-4 items-center justify-between mb-6 px-1">
          <button 
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/40 bg-surface-container-lowest rounded-lg font-mono text-xs uppercase tracking-wider focus:outline-none"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
            <span>BỘ LỌC &amp; SẮP XẾP</span>
          </button>
          
          <button 
            onClick={handleResetFilters}
            className="font-mono text-[10px] text-secondary hover:underline font-semibold uppercase tracking-widest"
          >
            Đặt lại
          </button>
        </div>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {/* Grid Controls */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 pb-4 border-b border-outline-variant/15 gap-4">
            <span className="font-mono text-[11px] text-on-surface-variant dark:text-tertiary-fixed-dim/70 uppercase tracking-widest">
              Hiển thị <span className="text-primary font-bold">{filteredAndSortedProducts.length === 0 ? 0 : startItemIndex}-{endItemIndex}</span> trong số <span className="text-primary font-bold">{filteredAndSortedProducts.length}</span> thiết kế
            </span>
            <div className="flex items-center gap-3">
              <label className="font-mono text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim/70 uppercase tracking-widest hidden sm:block">
                Sắp xếp:
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/30 rounded-md px-3 py-1.5 font-mono text-xs text-primary focus:border-secondary outline-none cursor-pointer"
              >
                <option value="Phổ biến nhất">Phổ biến nhất</option>
                <option value="Giá: Thấp đến Cao">Giá: Thấp đến Cao</option>
                <option value="Giá: Cao đến Thấp">Giá: Cao đến Thấp</option>
                <option value="Mới nhất">Mới nhất</option>
              </select>
            </div>
          </div>

          {/* Catalog products grid */}
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low dark:bg-tertiary-container/5 rounded-2xl p-8 border border-outline-variant/15">
              <p className="font-display-serif text-2xl font-medium text-primary mb-2">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="text-body-sm text-on-surface-variant/80 mt-1">
                Hãy thử nới lỏng bộ lọc giá hoặc chọn các từ khóa tìm kiếm chung hơn.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 btn-push text-label-md px-6 py-2.5"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-gutter mb-12">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Pagination triggers */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-12 select-none border-t border-outline-variant/10 pt-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg border border-outline-variant/30 flex items-center justify-center text-outline hover:border-secondary hover:text-secondary disabled:opacity-20 disabled:cursor-not-allowed transition-colors focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button 
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-9 h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-colors focus:outline-none ${
                      currentPage === pageNumber
                        ? 'bg-secondary text-white border border-secondary shadow-sm'
                        : 'border border-outline-variant/30 text-on-surface hover:border-secondary'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg border border-outline-variant/30 flex items-center justify-center text-outline hover:border-secondary hover:text-secondary disabled:opacity-20 disabled:cursor-not-allowed transition-colors focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end md:hidden">
          <div className="w-[80%] max-w-[320px] h-full bg-surface dark:bg-tertiary-container p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl animate-slideLeft">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-display-serif text-xl font-medium text-primary">
                Lọc Sản Phẩm
              </h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-outline font-mono text-xs uppercase tracking-wider p-1 rounded hover:bg-surface-container"
              >
                Đóng
              </button>
            </div>

            {/* Lọc không gian chức năng */}
            <div>
              <h3 className="font-mono text-[10px] text-primary/80 dark:text-primary-fixed-dim mb-3 uppercase tracking-widest font-bold">
                Không gian
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Tất cả', 'Phòng Khách', 'Phòng Ngủ', 'Bàn Ghế Ăn', 'Đồ Trang Trí'].map(space => (
                  <button
                    key={space}
                    onClick={() => { onCategoryChange(space); setCurrentPage(1); setIsMobileFilterOpen(false); }}
                    className={`px-3 py-1.5 border rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all focus:outline-none ${
                      activeCategory === space
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-transparent border-outline-variant/40 text-on-surface hover:border-secondary'
                    }`}
                  >
                    {space}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div>
              <h3 className="font-mono text-[10px] text-primary/80 dark:text-primary-fixed-dim mb-3 uppercase tracking-widest font-bold">
                Khoảng giá (VND)
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-2.5 py-1.5 font-mono text-xs text-on-surface" 
                  placeholder="Từ" 
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-on-surface-variant/40 font-mono text-xs">-</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-2.5 py-1.5 font-mono text-xs text-on-surface" 
                  placeholder="Đến" 
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button 
                onClick={(e) => { handleApplyPrice(e); setIsMobileFilterOpen(false); }}
                className="w-full btn-push py-2 text-xs font-mono tracking-wider"
              >
                ÁP DỤNG
              </button>
            </div>

            {/* Brand checkboxes */}
            <div>
              <h3 className="font-mono text-[10px] text-primary/80 dark:text-primary-fixed-dim mb-3 uppercase tracking-widest font-bold">
                Thương hiệu
              </h3>
              <div className="space-y-3">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary/20" 
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <span className="font-body-sm text-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating options */}
            <div>
              <h3 className="font-mono text-[10px] text-primary/80 dark:text-primary-fixed-dim mb-3 uppercase tracking-widest font-bold">
                Đánh giá
              </h3>
              <div className="space-y-3">
                {[5, 4, 3].map(rating => (
                  <button
                    key={rating}
                    onClick={() => { setMinRating(rating); setIsMobileFilterOpen(false); setCurrentPage(1); }}
                    className={`flex items-center justify-between text-left w-full focus:outline-none ${
                      minRating === rating ? 'text-secondary font-bold' : 'text-on-surface-variant dark:text-tertiary-fixed-dim/80'
                    }`}
                  >
                    <div className="flex text-[#F59E0B] space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < rating ? 'fill-current' : 'opacity-15'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/70">
                      {rating === 5 ? 'Tuyệt đối' : '& Trở lên'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size filters */}
            <div>
              <h3 className="font-mono text-[10px] text-primary/80 dark:text-primary-fixed-dim mb-3 uppercase tracking-widest font-bold">
                Kích thước
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Compact', 'Standard', 'Deluxe', 'King'].map(size => (
                  <button
                    key={size}
                    onClick={() => { 
                      setSelectedSize(selectedSize === size ? null : size); 
                      setIsMobileFilterOpen(false);
                      setCurrentPage(1); 
                    }}
                    className={`px-3 py-1.5 border rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all focus:outline-none ${
                      selectedSize === size
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-transparent border-outline-variant text-on-surface hover:border-secondary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
              className="mt-auto w-full bg-surface-container border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-body-sm font-mono text-xs uppercase tracking-wider"
            >
              Xóa tất cả lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
