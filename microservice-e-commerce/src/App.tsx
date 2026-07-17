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
import { CheckoutPage } from './components/CheckoutPage';
import { OrderDetailPage } from './components/OrderDetailPage';
import type { Product, CartItem, Order } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  // Dynamic products state initialized with empty array
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/products');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const mappedData: Product[] = data.map((p: any) => {
            const variants = p.variants || [];
            
            // Extract unique sizes from variants
            const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];
            const sizes = uniqueSizes.length > 0 ? uniqueSizes : ["Compact", "Standard", "Deluxe"];
            
            // Extract unique colors from variants and map to hex codes
            const colorMap: Record<string, string> = {
              "Classic Navy": "#1E3A8A",
              "Matte Black": "#1F2937",
              "Natural Oak": "#D7A15C",
              "Tan Brown": "#8B5A2B",
              "Charcoal Black": "#36454F",
              "Đen": "#000000",
              "Trắng": "#FFFFFF",
              "Xám": "#808080",
              "Đỏ": "#FF0000",
              "Xanh dương": "#3B82F6",
              "Vàng": "#FBBF24",
              "Xanh lá": "#10B981",
              "Hồng": "#EC4899",
              "Cam": "#F97316",
              "Nâu": "#78350F",
            };
            
            const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
            const colors = uniqueColors.length > 0
              ? uniqueColors.map(c => ({ name: c, value: colorMap[c] || "#CCCCCC" }))
              : [
                  { name: "Classic Navy", value: "#1E3A8A" },
                  { name: "Matte Black", value: "#1F2937" }
                ];

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
              sizes,
              colors,
              specs: [
                { label: "Kích thước", value: "Standard" },
                { label: "Chất liệu", value: "Cao cấp" },
                { label: "Bảo hành", value: "12 tháng" }
              ],
              highlights: ["Chất liệu cao cấp", "Thiết kế hiện đại"],
              sku: p.sku,
              stock: p.stock,
              createdAt: p.createdAt,
              variants
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

  useEffect(() => {
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
    // Switch to user cart & favorites
    const savedCart = localStorage.getItem(`cart_${user.email}`);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    const savedFavs = localStorage.getItem(`favorites_${user.email}`);
    setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    setCurrentUser(null);
    // Switch to guest cart & favorites
    const savedCart = localStorage.getItem('cart_guest');
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    const savedFavs = localStorage.getItem('favorites_guest');
    setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
    setCurrentView('home');
  };

  // Navigation Routing States
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard' | 'checkout' | 'order-detail'>(() => {
    const savedView = localStorage.getItem('currentView');
    if (savedView) return savedView as any;
    
    // Fallback: If logged in as ADMIN, default to dashboard
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'ADMIN') return 'dashboard';
    }
    return 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('selectedProductId');
    return savedId ? Number(savedId) : null;
  });
  const [sortBy, setSortBy] = useState('Phổ biến nhất');

  // Orders State & LocalStorage Synchronization
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    const savedSelected = localStorage.getItem('selectedOrder');
    return savedSelected ? JSON.parse(savedSelected) : null;
  });
  const [userId, setUserId] = useState<number | null>(null);

  // Sync profile details and load user orders from database
  useEffect(() => {
    if (!currentUser) {
      setUserId(null);
      return;
    }

    const fetchUserProfileAndOrders = async () => {
      try {
        const profileRes = await fetch('http://localhost:8080/auth/profile', {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!profileRes.ok) return;
        const profileData = await profileRes.json();
        const id = profileData.id;
        if (!id) return;
        
        setUserId(id);

        // Fetch user orders from database
        const ordersRes = await fetch(`http://localhost:8080/users/orders/user/${id}`);
        if (ordersRes.ok) {
          const dbOrders = await ordersRes.json();
          const dbOrderIds = new Set(dbOrders.map((o: any) => o.id));

          // Retry syncing local-only orders that were not saved to DB (backend was down)
          const localRaw = localStorage.getItem('luxe_orders');
          const localOrders: Order[] = localRaw ? JSON.parse(localRaw) : [];
          const pendingSync = localOrders.filter(lo => !dbOrderIds.has(lo.id));

          for (const pending of pendingSync) {
            try {
              const payload = {
                id: pending.id,
                userId: id,
                subtotal: pending.subtotal,
                total: pending.total,
                receiverName: pending.receiverName,
                phoneNumber: pending.phoneNumber,
                address: pending.address,
                paymentMethod: pending.paymentMethod,
                cardNumber: pending.cardInfo?.cardNumber || null,
                cardName: pending.cardInfo?.cardName || null,
                expiryDate: pending.cardInfo?.expiryDate || null,
                status: pending.status,
                createdAt: pending.createdAt,
                items: pending.items.map((item) => ({
                  productId: item.product.id,
                  productName: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                  selectedColor: item.selectedColor || null,
                  selectedSize: item.selectedSize || null,
                  image: item.product.image || null,
                  sku: item.product.sku || 'N/A'
                }))
              };
              await fetch('http://localhost:8080/users/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              console.log(`Đã đồng bộ đơn hàng chờ lên server: ${pending.id}`);
            } catch (syncErr) {
              console.warn(`Không thể đồng bộ đơn hàng ${pending.id}:`, syncErr);
            }
          }

          // After retry syncs, re-fetch the updated list from DB
          const updatedRes = await fetch(`http://localhost:8080/users/orders/user/${id}`);
          const updatedOrders = updatedRes.ok ? await updatedRes.json() : dbOrders;

          // Map backend entities to frontend Order type structure
          const mappedOrders = updatedOrders.map((o: any) => ({
            id: o.id,
            items: o.items.map((item: any) => ({
              product: {
                id: item.productId,
                name: item.productName,
                price: item.price,
                image: item.image,
                sku: item.sku
              },
              quantity: item.quantity,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize
            })),
            subtotal: o.subtotal,
            total: o.total,
            receiverName: o.receiverName,
            phoneNumber: o.phoneNumber,
            address: o.address,
            paymentMethod: o.paymentMethod,
            cardInfo: o.paymentMethod === 'CARD' ? {
              cardNumber: o.cardNumber,
              cardName: o.cardName,
              expiryDate: o.expiryDate
            } : undefined,
            status: o.status,
            createdAt: o.createdAt
          }));
          setOrders(mappedOrders);
          localStorage.setItem('luxe_orders', JSON.stringify(mappedOrders));
        }
      } catch (err) {
        console.error("Lỗi đồng bộ hồ sơ và đơn hàng từ server:", err);
      }
    };

    fetchUserProfileAndOrders();
  }, [currentUser]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('luxe_orders');
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      // Filter out mock orders starting with 'NX-' to sanitize local storage
      const filtered = parsed.filter((o: any) => !o.id.startsWith('NX-'));
      setOrders(filtered);
      localStorage.setItem('luxe_orders', JSON.stringify(filtered));
    } else {
      setOrders([]);
      localStorage.setItem('luxe_orders', JSON.stringify([]));
    }
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem('selectedOrder', JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem('selectedOrder');
    }
  }, [selectedOrder]);

  const handlePlaceOrder = async (newOrder: Order) => {
    // Generate backend order model payload
    const orderPayload = {
      id: newOrder.id,
      userId: userId || 1, // Fallback to id = 1 if userId is missing
      subtotal: newOrder.subtotal,
      total: newOrder.total,
      receiverName: newOrder.receiverName,
      phoneNumber: newOrder.phoneNumber,
      address: newOrder.address,
      paymentMethod: newOrder.paymentMethod,
      cardNumber: newOrder.cardInfo?.cardNumber || null,
      cardName: newOrder.cardInfo?.cardName || null,
      expiryDate: newOrder.cardInfo?.expiryDate || null,
      status: newOrder.status,
      createdAt: newOrder.createdAt,
      items: newOrder.items.map((item) => {
        // Find matching variant if it exists to get exact price, image and sku
        const variants = item.product.variants || [];
        const variant = variants.find(v => 
          v.color.toLowerCase() === item.selectedColor?.toLowerCase() &&
          v.size.toLowerCase() === item.selectedSize?.toLowerCase()
        );
        const price = variant ? variant.price : item.product.price;
        const image = variant && variant.image ? variant.image : item.product.image;
        const sku = variant?.sku || item.product.sku || 'N/A';
        
        return {
          productId: item.product.id,
          productName: item.product.name,
          price: price,
          quantity: item.quantity,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          image: image,
          sku: sku
        };
      })
    };

    try {
      const response = await fetch('http://localhost:8080/users/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        console.log("✅ Đã lưu đơn hàng lên server thành công:", newOrder.id);
      } else {
        const errText = await response.text();
        console.warn(`⚠️ Server trả lỗi khi lưu đơn hàng (${response.status}): ${errText}. Lưu local dự phòng.`);
      }
    } catch (err) {
      console.warn("⚠️ Không kết nối được tới user-service. Đơn hàng sẽ được đồng bộ lần sau khi đăng nhập lại:", err);
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('luxe_orders', JSON.stringify(updated));
    
    // Clear cart in both state and localStorage
    setCartItems([]);
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `cart_${user.email}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify([]));

    setSelectedOrder(newOrder);
    setCurrentView('order-detail');
  };

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `cart_${user.email}` : 'cart_guest';
    const savedCart = localStorage.getItem(key);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state persisted in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `favorites_${user.email}` : 'favorites_guest';
    const savedFavs = localStorage.getItem(key);
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  // Dark Mode state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Clean up old generic keys from previous sessions to avoid cluttering
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
    }
  }, []);

  // Sync currentView with localStorage
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  // Sync selectedProductId with localStorage
  useEffect(() => {
    if (selectedProductId !== null) {
      localStorage.setItem('selectedProductId', String(selectedProductId));
    } else {
      localStorage.removeItem('selectedProductId');
    }
  }, [selectedProductId]);

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
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `cart_${user.email}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync favorites with localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `favorites_${user.email}` : 'favorites_guest';
    localStorage.setItem(key, JSON.stringify(favorites));
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

  const handleUpdateQuantity = (productId: number, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, color, size);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: number, color?: string, size?: string) => {
    setCartItems(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
    ));
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
  const handleNavigate = (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard' | 'checkout' | 'order-detail', sortByOption?: string) => {
    setCurrentView(view);
    if (sortByOption) {
      setSortBy(sortByOption);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh products to load latest variants/changes when returning to customer views
    if (view === 'home' || view === 'products' || view === 'detail') {
      fetchProducts();
    }
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
    setCurrentView('products');
  };



  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface dark:bg-primary text-on-surface dark:text-inverse-on-surface transition-colors duration-300 flex flex-col justify-between">
      
      {/* Top Navigation */}
      {currentView !== 'dashboard' && (
        <Header 
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          onProductClick={handleProductDetailNavigate}
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
              className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant/15 mb-20 scroll-mt-24"
            >
              <div className="text-center mb-16 px-4">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-secondary mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Luxury Living
                </div>
                <h2 className="font-display-serif text-3xl md:text-4xl text-primary font-medium mb-3">
                  Sản Phẩm Bán Chạy
                </h2>
                <p className="font-body-sm text-sm text-on-surface-variant max-w-[500px] mx-auto leading-relaxed">
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

              <div className="mt-16 text-center">
                <button 
                  onClick={() => handleNavigate('products')}
                  className="btn-push-outline px-8 py-3 text-xs font-mono tracking-wider inline-flex items-center gap-2"
                >
                  XEM TẤT CẢ SẢN PHẨM 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <ProfilePage 
              onNavigate={handleNavigate} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              orders={orders}
              onViewOrder={(order) => {
                setSelectedOrder(order);
                handleNavigate('order-detail');
              }}
            />
          </div>
        )}

        {currentView === 'checkout' && (
          <div className="animate-fadeIn">
            <CheckoutPage 
              cartItems={cartItems} 
              currentUser={currentUser} 
              onNavigate={handleNavigate} 
              onPlaceOrder={handlePlaceOrder} 
            />
          </div>
        )}

        {currentView === 'order-detail' && (
          <div className="animate-fadeIn">
            <OrderDetailPage 
              order={selectedOrder} 
              onNavigate={handleNavigate} 
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <ManagerDashboard onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>

      {/* Footer */}
      {currentView !== 'dashboard' && currentView !== 'checkout' && currentView !== 'order-detail' && <Footer />}

      {/* Sliding Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          if (!currentUser) {
            alert('Vui lòng đăng nhập trước khi tiến hành thanh toán.');
            handleNavigate('login');
          } else {
            handleNavigate('checkout');
          }
          setIsCartOpen(false);
        }}
      />


    </div>
  );
}

export default App;
