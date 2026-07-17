import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { Star, ShoppingBag, Plus, Minus, Truck, ShieldCheck, CheckCircle } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  favorites: number[];
  onToggleFavorite: (productId: number, e: React.MouseEvent) => void;
  onNavigate: (view: 'home' | 'products' | 'detail') => void;
  onProductClick: (product: Product) => void;
  allProducts: Product[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onAddToCart,
  favorites,
  onToggleFavorite,
  onNavigate,
  onProductClick,
  allProducts,
}) => {
  const [activeImage, setActiveImage] = useState(product ? product.image : '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details');
  const [selectedColor, setSelectedColor] = useState(() => 
    product && product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState(() => 
    product && product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );

  // Find matching variant based on selected attributes
  const matchingVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => 
      v.color.toLowerCase() === selectedColor.toLowerCase() &&
      v.size.toLowerCase() === selectedSize.toLowerCase()
    );
  }, [product, selectedColor, selectedSize]);

  // Handle sync when clicking thumbnail images
  const handleThumbnailClick = (img: string) => {
    setActiveImage(img);
    if (product && product.variants) {
      const matchingVar = product.variants.find(v => v.image === img);
      if (matchingVar) {
        if (matchingVar.color) {
          setSelectedColor(matchingVar.color);
        }
        if (matchingVar.size) {
          setSelectedSize(matchingVar.size);
        }
      }
    }
  };

  // Determine current price to display
  const displayPrice = useMemo(() => {
    if (matchingVariant) return matchingVariant.price;
    return product ? product.price : 0;
  }, [matchingVariant, product]);

  // Determine variant image
  const variantImage = matchingVariant ? matchingVariant.image : null;

  // Auto-switch main image when selecting a variant that has its own image
  useEffect(() => {
    if (variantImage) {
      setActiveImage(variantImage);
    }
  }, [variantImage]);

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-body-lg font-bold text-primary">Sản phẩm không tồn tại</p>
        <button 
          onClick={() => onNavigate('products')} 
          className="mt-4 text-secondary font-bold hover:underline"
        >
          Quay lại danh mục
        </button>
      </div>
    );
  }

  // Format price in VND
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  // Find related products (same category/subcategory, excluding active product)
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.subCategory === product.subCategory))
    .slice(0, 4);

  // Generate thumbnail gallery (including product image, gallery, and variant images)
  const galleryImages = (() => {
    const images = new Set<string>();
    if (product.image) images.add(product.image);
    
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach(img => {
        if (img) images.add(img);
      });
    }
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        if (v.image) images.add(v.image);
      });
    }
    
    return Array.from(images).slice(0, 4);
  })();

  const handleBuyNow = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    onNavigate('products'); // Or navigate to cart/checkout
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng và tiến hành thanh toán.`);
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 select-none">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        paths={[
          { label: 'Trang chủ', view: 'home' },
          { label: 'Danh mục', view: 'products' },
          { label: product.name }
        ]} 
        onNavigate={onNavigate}
      />

      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low relative border border-outline-variant/30 flex items-center justify-center">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain transition-all duration-300"
            />
            {(() => {
              const isNew = (() => {
                if (!product.createdAt) return false;
                const createdDate = new Date(product.createdAt);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return createdDate > oneWeekAgo;
              })();

              if (isNew) {
                return (
                  <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full border border-red-500 shadow animate-pulse z-10">
                    <span className="font-label-sm text-label-sm text-white font-bold uppercase tracking-wider">
                      New Arrival
                    </span>
                  </div>
                );
              }

              if (product.badge) {
                return (
                  <div className="absolute top-4 left-4 bg-surface-container-highest dark:bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/40 shadow z-10">
                    <span className="font-label-sm text-label-sm text-primary dark:text-primary-fixed font-bold uppercase tracking-wider">
                      {product.badge}
                    </span>
                  </div>
                );
              }

              return null;
            })()}
          </div>
          
          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleThumbnailClick(img)}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-colors focus:outline-none ${
                  activeImage === img ? 'border-primary dark:border-secondary' : 'border-outline-variant/40 hover:border-outline-variant/80'
                }`}
              >
                <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-secondary dark:text-secondary-fixed text-xs font-bold uppercase tracking-wider mb-2 block">
              Nội thất {product.subCategory}
            </span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-[28px] md:text-display-lg text-primary dark:text-primary-fixed mb-2 font-bold leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'opacity-25'
                    }`} 
                  />
                ))}
              </div>
              <span className="font-bold text-body-sm text-on-surface dark:text-tertiary-fixed-dim underline cursor-pointer">
                {product.rating} (128 Đánh giá)
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-display-lg-mobile text-[28px] text-secondary dark:text-secondary-fixed font-bold">
                {formatPrice(displayPrice)}
              </span>
              {product.originalPrice && (
                <span className="font-body-md text-body-md text-on-surface-variant line-through opacity-70">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/80 mb-8 leading-relaxed">
              {product.description}. Được thiết kế và kiểm định chất lượng bởi chuyên gia hàng đầu châu Âu, LuxeCommerce tự tin mang lại sản phẩm tốt nhất cho không gian gia đình của bạn.
            </p>
          </div>

          {/* Custom Selection Options */}
          <div className="mb-8 space-y-6 border-t border-outline-variant/35 pt-8">
            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-3 font-semibold">
                  Màu sắc chất liệu: <span className="font-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/60 ml-2 font-normal">{selectedColor}</span>
                </h3>
                <div className="flex space-x-3">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 p-0.5 focus:outline-none transition-all flex items-center justify-center ${
                        selectedColor === color.name ? 'border-primary dark:border-secondary scale-110' : 'border-outline-variant/40 hover:scale-105'
                      }`}
                      title={color.name}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.value }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-3 font-semibold">
                  Kích thước sản phẩm:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border rounded-lg font-bold text-body-sm transition-all focus:outline-none ${
                        selectedSize === size
                          ? 'border-2 border-primary bg-surface-container-low dark:border-secondary text-primary dark:text-primary-fixed'
                          : 'border-outline-variant/50 text-on-surface-variant dark:text-tertiary-fixed-dim/70 hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Quantity */}
            <div className="flex items-center border border-outline-variant/60 rounded-lg bg-surface-container-lowest dark:bg-tertiary-container/30 h-12 w-32 justify-between px-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-on-surface-variant hover:text-primary focus:outline-none p-1"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-body-md text-body-md text-primary dark:text-primary-fixed font-bold">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="text-on-surface-variant hover:text-primary focus:outline-none p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button 
              onClick={() => {
                onAddToCart(product, quantity, selectedColor, selectedSize);
                alert(`Đã thêm ${quantity} sản phẩm ${product.name} vào giỏ hàng.`);
              }}
              className="flex-1 bg-primary dark:bg-secondary-container hover:bg-tertiary dark:hover:bg-secondary text-white h-12 rounded-lg font-semibold text-label-md flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95 transform duration-150"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>

          {/* Buy Now button */}
          <button 
            onClick={handleBuyNow}
            className="w-full bg-[#FF5F38] text-white h-12 rounded-lg font-semibold text-label-md flex items-center justify-center hover:bg-[#E64A2E] transition-all shadow-sm active:scale-95 transform duration-150 mb-8"
          >
            Mua ngay
          </button>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/35 pt-8">
            <div className="flex items-start space-x-3">
              <Truck className="text-primary dark:text-secondary-fixed w-5 h-5 mt-0.5" />
              <div>
                <p className="font-bold text-label-sm text-primary dark:text-primary-fixed">Miễn phí giao hàng</p>
                <p className="font-body-sm text-[12px] text-on-surface-variant dark:text-tertiary-fixed-dim/60">Đơn hàng trên 5.000.000 ₫</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ShieldCheck className="text-primary dark:text-secondary-fixed w-5 h-5 mt-0.5" />
              <div>
                <p className="font-bold text-label-sm text-primary dark:text-primary-fixed">Bảo hành 2 năm</p>
                <p className="font-body-sm text-[12px] text-on-surface-variant dark:text-tertiary-fixed-dim/60">Chính hãng tại nhà</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Specs Section (Bento Grid Style) */}
      <div className="mb-24">
        <div className="border-b border-outline-variant/35 mb-8 flex space-x-8">
          <button 
            onClick={() => setActiveTab('details')}
            className={`font-headline-sm text-headline-sm pb-4 font-bold focus:outline-none transition-all ${
              activeTab === 'details' 
                ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-secondary' 
                : 'text-on-surface-variant dark:text-tertiary-fixed-dim/55 hover:text-primary'
            }`}
          >
            Chi tiết sản phẩm
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`font-headline-sm text-headline-sm pb-4 font-bold focus:outline-none transition-all ${
              activeTab === 'specs' 
                ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-secondary' 
                : 'text-on-surface-variant dark:text-tertiary-fixed-dim/55 hover:text-primary'
            }`}
          >
            Thông số kỹ thuật
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-low dark:bg-tertiary-container/20 rounded-xl p-8 border border-outline-variant/35">
              <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mb-4 font-bold">
                Sự Hoàn Hảo Trong Từng Chi Tiết
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/80 mb-6 leading-relaxed">
                Tất cả các sản phẩm gỗ tại LuxeCommerce đều được tuyển chọn kỹ lưỡng từ các nguồn rừng tái sinh đạt chuẩn FSC, sấy khô nghiêm ngặt chống nứt nẻ và cong vênh do thời tiết ẩm. Lớp sơn phủ hoặc vecni thực vật thân thiện với môi trường, không hóa chất độc hại (Formaldehyde-free), an toàn cho trẻ nhỏ.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/80 leading-relaxed">
                Đối với các sản phẩm bọc đệm, chúng tôi sử dụng đệm Memory Foam mật độ cao kết hợp lò xo túi độc lập nâng đỡ êm ái, bọc ngoài bằng vải lanh tự nhiên hoặc da lộn chống nước cao cấp bền màu, dễ dàng vệ sinh.
              </p>
            </div>
            <div className="bg-surface-container-lowest dark:bg-tertiary-container/10 rounded-xl p-6 border border-outline-variant/35 shadow-sm flex flex-col justify-center">
              <h4 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-4 uppercase tracking-wider font-semibold">
                Điểm Nổi Bật
              </h4>
              <ul className="space-y-4 font-body-sm text-body-sm text-on-surface-variant dark:text-tertiary-fixed-dim/80">
                {product.highlights ? (
                  product.highlights.map((hl, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle className="text-secondary dark:text-secondary-fixed w-4 h-4" />
                      <span>{hl}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="text-secondary dark:text-secondary-fixed w-4 h-4" />
                      <span>Thiết kế độc quyền từ châu Âu</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="text-secondary dark:text-secondary-fixed w-4 h-4" />
                      <span>Gỗ sồi thịt 100% tự nhiên</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="text-secondary dark:text-secondary-fixed w-4 h-4" />
                      <span>Thân thiện môi trường, an toàn cho da</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low dark:bg-tertiary-container/20 rounded-xl p-8 border border-outline-variant/35">
            <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mb-6 font-bold">
              Bảng Thông Số Kỹ Thuật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-body-md text-body-md text-on-surface">
              {product.specs ? (
                product.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant dark:text-tertiary-fixed-dim/60">{spec.label}</span>
                    <span className="font-semibold text-primary dark:text-primary-fixed-dim">{spec.value}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant">Chất liệu chính</span>
                    <span className="font-semibold text-primary">{product.material}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant">Thương hiệu</span>
                    <span className="font-semibold text-primary">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant">Phân khúc</span>
                    <span className="font-semibold text-primary">{product.category}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-outline-variant/25 pt-16">
          <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mb-8 font-bold">
            Sản Phẩm Liên Quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {relatedProducts.map(prod => (
              <ProductCard 
                key={prod.id}
                product={prod}
                onAddToCart={(p, e) => {
                  e.stopPropagation();
                  onAddToCart(p, 1);
                }}
                onProductClick={onProductClick}
                isFavorite={favorites.includes(prod.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
