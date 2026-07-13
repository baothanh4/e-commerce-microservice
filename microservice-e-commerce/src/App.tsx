import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import { ManagerDashboard } from './components/ManagerDashboard';
import type { Product, CartItem } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  // Dynamic products state initialized with empty array
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/products');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const mappedData: Product[] = data.map((p: any) => {
              return {
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.price * 1.2,
                rating: 4.8,
                badge: p.stock === 0 ? "Hết hàng" : "",
                category: p.category,
                subCategory: p.subCategory || (p.category === "Nội thất" ? "Phòng Khách" : "Đồ Trang Trí"),
                brand: "Lusso",
                material: "Cao cấp",
                description: p.description || "",
                image: p.image || "https://via.placeholder.com/150",
                sizes: ["Compact", "Standard", "Deluxe"],
                colors: [
                  { name: "Classic Navy", value: "#1E3A8A" },
                  { name: "Matte Black", value: "#1F2937" }
                ],
                specs: [
                  { label: "Kích thước", value: "Standard" },
                  { label: "Chất liệu", value: "Cao cấp" },
                  { label: "Bảo hành", value: "12 tháng" }
                ],
                highlights: ["Chất liệu cao cấp", "Thiết kế hiện đại"],
                sku: p.sku,
                stock: p.stock,
                createdAt: p.createdAt
              };
            });

            // Xếp các sản phẩm mới thêm (trong vòng 1 tuần) lên đầu, mới hơn xếp trước
            const sortedData = [...mappedData].sort((a, b) => {
              const isNew = (dateStr?: string) => {
                if (!dateStr) return false;
                const createdDate = new Date(dateStr);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return createdDate > oneWeekAgo;
              };

              const aNew = isNew(a.createdAt);
              const bNew = isNew(b.createdAt);

              if (aNew && !bNew) return -1;
              if (!aNew && bNew) return 1;

              // Nếu cả 2 cùng mới hoặc cùng cũ, xếp theo ngày mới nhất trước, hoặc theo ID giảm dần
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
              return b.id - a.id;
            });

            setProducts(sortedData);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm từ backend:", error);
      }
    };
    fetchProducts();
  }, []);


  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; token: string; role: string } | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (user: { name: string; email: string; token: string; role: string }) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Navigation Routing States
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard'>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('Phổ biến nhất');

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state persisted in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    const savedFavs = localStorage.getItem('favorites');
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  // Dark Mode state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id && 
          item.selectedColor === color && 
          item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
    });
    
    // Auto-open cart for immediate feedback
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Toggle favorite
  const handleToggleFavorite = (productId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Click handler to open FULL detail page view
  const handleProductDetailNavigate = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // Navigation router
  const handleNavigate = (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard', sortByOption?: string) => {
    setCurrentView(view);
    if (sortByOption) {
      setSortBy(sortByOption);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category select routing
  const handleCategorySelect = (category: string) => {
    if (category === 'Tất cả') {
      setActiveCategory('Tất cả');
    } else {
      setActiveCategory(category);
    }
    setCurrentView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search submit redirects to Product List
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && currentView === 'home') {
      setCurrentView('products');
    }
  };



  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface dark:bg-primary text-on-surface dark:text-inverse-on-surface transition-colors duration-300 flex flex-col justify-between">
      
      {/* Top Navigation */}
      {currentView !== 'dashboard' && (
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          wishlistCount={favorites.length}
          onNavigate={handleNavigate}
          currentView={currentView}
          currentSortBy={sortBy}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main Views Router */}
      <div className={currentView === 'dashboard' ? '' : 'flex-grow'}>
        {currentView === 'home' && (
          <div className="animate-fadeIn">
            {/* Banner Hero */}
            <Hero onExploreClick={() => handleNavigate('products')} />

            {/* Categories Bento Grid */}
            <Categories 
              onCategoryClick={handleCategorySelect}
              activeCategory={activeCategory}
            />

            {/* Home Best Sellers grid */}
            <section 
              className="py-[80px] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-low dark:bg-tertiary-container/10 rounded-3xl mb-[80px] transition-colors duration-300 scroll-mt-24"
            >
              <div className="text-center mb-12 px-4">
                <div className="inline-flex items-center gap-1.5 bg-surface-bright dark:bg-surface-container/20 text-secondary dark:text-secondary-fixed text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-outline-variant/30 mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Luxury Living
                </div>
                <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-bold">
                  Sản Phẩm Bán Chạy
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-2 max-w-[600px] mx-auto leading-relaxed">
                  Những thiết kế nội thất bán chạy nhất, kết hợp hoàn hảo chất liệu gỗ tự nhiên và cơ học cao cấp.
                </p>
              </div>

              {/* Best sellers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter px-4 md:px-0">
                {products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod, e) => {
                      e.stopPropagation();
                      handleAddToCart(prod);
                    }}
                    onProductClick={handleProductDetailNavigate}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>

              <div className="mt-12 text-center">
                <button 
                  onClick={() => handleNavigate('products')}
                  className="bg-transparent border border-primary dark:border-primary-fixed text-primary dark:text-primary-fixed font-semibold text-label-md px-8 py-3 rounded-lg hover:bg-surface-container-highest/60 dark:hover:bg-surface-container-low transition-colors inline-flex items-center gap-2 group shadow-sm hover:shadow"
                >
                  Xem Tất Cả Sản Phẩm 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'products' && (
          <div className="animate-fadeIn">
            <ProductList 
              products={products}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onAddToCart={(p, e) => {
                e.stopPropagation();
                handleAddToCart(p);
              }}
              onProductClick={handleProductDetailNavigate}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={handleNavigate}
              searchQuery={searchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        )}

        {currentView === 'detail' && (
          <div className="animate-fadeIn">
            <ProductDetail 
              key={selectedProductId || 'detail'}
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={handleNavigate}
              onProductClick={handleProductDetailNavigate}
              allProducts={products}
            />
          </div>
        )}

        {currentView === 'login' && (
          <div className="animate-fadeIn">
            <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {currentView === 'register' && (
          <div className="animate-fadeIn">
            <RegisterPage onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />
          </div>
        )}

        {currentView === 'profile' && (
          <div className="animate-fadeIn">
            <ProfilePage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />
          </div>
        )}

        {currentView === 'dashboard' && (
          <ManagerDashboard onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>

      {/* Footer */}
      {currentView !== 'dashboard' && <Footer />}

      {/* Sliding Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          alert('Cảm ơn bạn đã trải nghiệm mua sắm! Đây là phiên bản demo tính năng thanh toán.');
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />


    </div>
  );
}

export default App;
