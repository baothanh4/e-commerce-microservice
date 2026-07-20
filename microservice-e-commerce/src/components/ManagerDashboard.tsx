import React, { useState, useMemo, useRef, useEffect } from 'react';

interface ProductVariant {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  stock: number;
  price: number;
  image: string; // URL or ObjectURL from upload
  description?: string;
  createdAt?: string;
  variants?: ProductVariant[];
}

interface ManagerDashboardProps {
  onNavigate: (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile' | 'dashboard') => void;
  currentUser?: { name: string; email: string; token: string; role: string } | null;
  onLogout?: () => void;
}


export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate, currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'reports' | 'settings'>('inventory');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Admin Orders Management states
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<any | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  const fetchAllOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const response = await fetch('http://localhost:8080/users/orders');
      if (response.ok) {
        const data = await response.json();
        console.log('[Admin] Đã tải đơn hàng từ server:', data);
        setOrdersList(data);
      } else {
        const errText = await response.text();
        console.error(`[Admin] Server lỗi ${response.status} khi tải đơn hàng:`, errText);
      }
    } catch (err) {
      console.error('[Admin] Không kết nối được tới user-service:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    // Optimistic UI update
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
      setSelectedAdminOrder((prev: any) => prev ? { ...prev, status } : null);
    }

    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang giao',
      'COMPLETED': 'Đã giao',
      'CANCELLED': 'Đã hủy'
    };

    try {
      const response = await fetch(`http://localhost:8080/users/orders/${orderId}/status?status=${status}`, {
        method: 'PUT'
      });
      if (response.ok) {
        setOrderToast(`Đã cập nhật trạng thái đơn hàng #${orderId} sang "${statusMap[status] || status}"!`);
        setTimeout(() => setOrderToast(null), 3000);
        fetchAllOrders();
      } else {
        const errText = await response.text();
        console.error("Cập nhật trạng thái thất bại:", errText);
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
    }
  };

  useEffect(() => {
    const fetchDashboardProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/products');
        if (response.ok) {
          const data = await response.json();
          const mapped: ProductItem[] = data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            sku: p.sku,
            category: p.category,
            subCategory: p.subCategory || '',
            stock: p.stock,
            price: p.price,
            image: p.image || '',
            description: p.description || '',
            createdAt: p.createdAt,
            variants: p.variants || []
          }));
          setProducts(mapped);
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm cho dashboard:", error);
      }
    };
    fetchDashboardProducts();
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Restock modal state
  const [restockTarget, setRestockTarget] = useState<ProductItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  // Form states and field errors
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    category: string;
    subCategory: string;
    stock: number;
    price: number;
    image: string;
    description: string;
    variants: ProductVariant[];
  }>({
    name: '',
    sku: '',
    category: 'Nội thất',
    subCategory: 'Phòng Khách',
    stock: 0,
    price: 0,
    image: '',
    description: '',
    variants: []
  });

  const [tempVariant, setTempVariant] = useState({
    color: '',
    size: 'Standard',
    price: 0,
    stock: 10,
    image: ''
  });

  const handleAddVariantToList = () => {
    if (!tempVariant.color || tempVariant.price <= 0) {
      alert("Vui lòng nhập đầy đủ màu sắc và giá của biến thể!");
      return;
    }
    
    const colorCode = (tempVariant.color || '').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
    const sizeCode = (tempVariant.size || '').slice(0, 3).toUpperCase();
    const cleanProductSku = (formData.sku || '').trim().toUpperCase();
    const variantSku = `${cleanProductSku}-${colorCode}-${sizeCode}`;

    const isDuplicate = formData.variants.some(v => 
      (v.sku || '').toUpperCase() === variantSku.toUpperCase() ||
      ((v.color || '').toLowerCase() === tempVariant.color.toLowerCase() && (v.size || '').toLowerCase() === tempVariant.size.toLowerCase())
    );
    
    if (isDuplicate) {
      alert("Biến thể với Màu sắc + Kích thước này đã tồn tại!");
      return;
    }

    const newVar: ProductVariant = {
      sku: variantSku,
      color: tempVariant.color,
      size: tempVariant.size,
      price: tempVariant.price,
      stock: tempVariant.stock,
      image: tempVariant.image || undefined
    };
    
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));
    
    // Reset tempVariant
    setTempVariant({
      color: '',
      size: 'Standard',
      price: 0,
      stock: 10,
      image: ''
    });
  };

  const handleRemoveVariantFromList = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    sku?: string;
    price?: string;
    stock?: string;
    image?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // KPI Calculations
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Unique categories for filter
  const categories = useMemo(() => {
    return ['All Categories', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Restock action
  const openRestockModal = (product: ProductItem) => {
    setRestockTarget(product);
    setRestockAmount(10);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = async () => {
    if (!restockTarget || restockAmount <= 0) return;
    const token = currentUser?.token;
    const newStock = restockTarget.stock + restockAmount;

    try {
      if (token) {
        const response = await fetch(`http://localhost:8080/products/${restockTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: restockTarget.name,
            sku: restockTarget.sku,
            category: restockTarget.category,
            stock: newStock,
            price: restockTarget.price,
            image: restockTarget.image,
            description: restockTarget.description || ''
          })
        });
        if (!response.ok) throw new Error(await response.text());
      }
      setProducts(prev => prev.map(p =>
        p.id === restockTarget.id ? { ...p, stock: newStock } : p
      ));
      setIsRestockModalOpen(false);
      setRestockTarget(null);
    } catch (err: any) {
      alert('Lỗi khi nhập thêm hàng: ' + err.message);
    }
  };

  // Form input validation logic
  const validateField = (field: string, value: any) => {
    let error = '';
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) {
          error = 'Tên sản phẩm phải có tối thiểu 3 ký tự';
        }
        break;
      case 'sku': {
        const upperSku = typeof value === 'string' ? value.toUpperCase() : value;
        if (!upperSku || !/^[A-Z0-9-]+$/.test(upperSku)) {
          error = 'Mã SKU chỉ được gồm chữ, số, dấu gạch ngang (Ví dụ: FUR-CH-123)';
        }
      }
        break;
      case 'price':
        if (value === undefined || isNaN(Number(value)) || Number(value) <= 0) {
          error = 'Giá bán phải lớn hơn 0 ₫';
        }
        break;
      case 'stock':
        if (value === undefined || isNaN(Number(value)) || Number(value) < 0 || !Number.isInteger(Number(value))) {
          error = 'Số lượng tồn kho phải là số nguyên lớn hơn hoặc bằng 0';
        }
        break;
      case 'image':
        if (!value) {
          error = 'Vui lòng chọn hình ảnh hoặc dán URL hình ảnh sản phẩm';
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error || undefined }));
    return !error;
  };

  const validateForm = (): boolean => {
    const isNameValid = validateField('name', formData.name);
    const isSkuValid = validateField('sku', formData.sku);
    const isPriceValid = validateField('price', formData.price);
    const isStockValid = validateField('stock', formData.stock);
    const isImageValid = validateField('image', formData.image);

    return isNameValid && isSkuValid && isPriceValid && isStockValid && isImageValid;
  };

  const handleInputChange = (field: string, value: any) => {
    const processedValue = field === 'sku' && typeof value === 'string' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    validateField(field, processedValue);
  };

  // Handle local file selection and convert to ObjectURL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      handleInputChange('image', imageUrl);
    }
  };

  const uploadImageIfSelected = async (file: File): Promise<string> => {
    const token = currentUser?.token;
    if (!token) throw new Error("Vui lòng đăng nhập với quyền admin");

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await fetch("http://localhost:8080/products/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: uploadFormData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Lỗi khi upload ảnh");
    }

    return await response.text();
  };

  const handleOpenAddModal = () => {
    setSelectedFile(null);
    setFormData({
      name: '',
      sku: `FUR-NEW-${Date.now().toString().slice(-4)}`,
      category: 'Nội thất',
      subCategory: 'Phòng Khách',
      stock: 10,
      price: 2500000,
      image: '',
      description: '',
      variants: []
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      let finalImageUrl = formData.image;
      if (selectedFile) {
        finalImageUrl = await uploadImageIfSelected(selectedFile);
      }

      const token = currentUser?.token;
      if (!token) {
        alert("Vui lòng đăng nhập với quyền admin");
        return;
      }

      const response = await fetch("http://localhost:8080/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku.toUpperCase(),
          category: formData.category,
          subCategory: formData.subCategory,
          stock: Number(formData.stock),
          price: Number(formData.price),
          image: finalImageUrl,
          description: formData.description,
          variants: formData.variants
        })
      });

      if (response.ok) {
        const savedProd = await response.json();
        const newProduct: ProductItem = {
          id: String(savedProd.id),
          name: savedProd.name,
          sku: savedProd.sku,
          category: savedProd.category,
          subCategory: savedProd.subCategory,
          stock: savedProd.stock,
          price: savedProd.price,
          image: savedProd.image,
          description: savedProd.description,
          createdAt: savedProd.createdAt,
          variants: savedProd.variants || []
        };
        setProducts(prev => [newProduct, ...prev]);
        setIsAddModalOpen(false);
        setSelectedFile(null);
      } else {
        const errMsg = await response.text();
        alert("Thêm sản phẩm thất bại: " + errMsg);
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setSelectedProduct(product);
    setSelectedFile(null);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      category: product.category,
      subCategory: product.subCategory || 'Phòng Khách',
      stock: product.stock,
      price: product.price,
      image: product.image,
      description: product.description || '',
      variants: product.variants || []
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedProduct) return;

    try {
      let finalImageUrl = formData.image;
      if (selectedFile && formData.image.startsWith("blob:")) {
        finalImageUrl = await uploadImageIfSelected(selectedFile);
      }

      const token = currentUser?.token;
      if (!token) {
        alert("Vui lòng đăng nhập với quyền admin");
        return;
      }

      const response = await fetch(`http://localhost:8080/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku.toUpperCase(),
          category: formData.category,
          subCategory: formData.subCategory,
          stock: Number(formData.stock),
          price: Number(formData.price),
          image: finalImageUrl,
          description: formData.description,
          variants: formData.variants
        })
      });

      if (response.ok) {
        const updatedProd = await response.json();
        setProducts(prev => prev.map(p => {
          if (p.id === String(updatedProd.id)) {
            return {
              id: String(updatedProd.id),
              name: updatedProd.name,
              sku: updatedProd.sku,
              category: updatedProd.category,
              subCategory: updatedProd.subCategory,
              stock: updatedProd.stock,
              price: updatedProd.price,
              image: updatedProd.image,
              description: updatedProd.description,
              createdAt: updatedProd.createdAt,
              variants: updatedProd.variants || []
            };
          }
          return p;
        }));
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        setSelectedFile(null);
      } else {
        const errMsg = await response.text();
        alert("Cập nhật sản phẩm thất bại: " + errMsg);
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá sản phẩm nội thất này khỏi kho hàng?')) {
      try {
        const token = currentUser?.token;
        if (!token) {
          alert("Vui lòng đăng nhập với quyền admin");
          return;
        }

        const response = await fetch(`http://localhost:8080/products/${productId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setProducts(prev => prev.filter(p => p.id !== productId));
        } else {
          const errMsg = await response.text();
          alert("Xoá sản phẩm thất bại: " + errMsg);
        }
      } catch (err: any) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Tên sản phẩm,SKU,Danh mục,Số lượng,Giá bán"].join(",") + "\n"
      + products.map(e => `"${e.name}","${e.sku}","${e.category}",${e.stock},${e.price}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LuxeCommerce_Furniture_Inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex bg-background text-on-background font-body-md antialiased min-h-screen relative">
      {/* SideNavBar */}
      <nav className="bg-[#181818] border-r border-white/5 h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-20">
        <div className="px-6 mb-8 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-white font-display-serif font-medium text-sm">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <h2 className="font-display-serif text-sm font-semibold text-white">Quản Trị Viên</h2>
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">
              {currentUser?.name || 'Manager Account'}
            </p>
          </div>
        </div>
        <ul className="space-y-1 flex-grow">
          <li>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center text-left pl-6 py-3 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-white bg-white/5 font-bold font-mono text-[10px] uppercase tracking-widest border-l-2 border-secondary'
                  : 'text-white/50 hover:text-white hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-sm">dashboard</span>
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center text-left pl-6 py-3 transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'text-white bg-white/5 font-bold font-mono text-[10px] uppercase tracking-widest border-l-2 border-secondary'
                  : 'text-white/50 hover:text-white hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-sm">inventory_2</span>
              <span>Inventory</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center text-left pl-6 py-3 transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-white bg-white/5 font-bold font-mono text-[10px] uppercase tracking-widest border-l-2 border-secondary'
                  : 'text-white/50 hover:text-white hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-sm">shopping_cart</span>
              <span>Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center text-left pl-6 py-3 transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'text-white bg-white/5 font-bold font-mono text-[10px] uppercase tracking-widest border-l-2 border-secondary'
                  : 'text-white/50 hover:text-white hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-sm">bar_chart</span>
              <span>Reports</span>
            </button>
          </li>
        </ul>
        <div className="mt-auto space-y-1 font-mono text-[10px] uppercase tracking-widest font-bold">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center text-left text-white/50 hover:text-white pl-6 py-2.5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined mr-3 text-sm">store</span>
            <span>Cửa hàng</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center text-left text-error opacity-80 hover:opacity-100 pl-6 py-2.5 hover:bg-error/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined mr-3 text-sm">logout</span>
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main content wrapper */}
      <div className="flex-grow pl-64 min-h-screen flex flex-col">
        {/* TopNavBar */}
        <header className="bg-surface fixed top-0 right-0 w-[calc(100%-16rem)] h-16 border-b border-outline-variant/15 z-10 flex justify-between items-center px-8">
          <div className="flex items-center flex-1">
            <h1 className="font-display-serif text-xl font-medium text-primary mr-8 tracking-wide cursor-pointer" onClick={() => onNavigate('home')}>
              LuxeCommerce Admin
            </h1>
            <div className="relative w-full max-w-sm hidden md:block">
              <input
                className="w-full pl-4 pr-4 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-md text-xs font-mono placeholder:text-outline-variant/60 focus:outline-none focus:border-secondary transition-all outline-none"
                placeholder="Tìm kiếm nhanh sản phẩm, SKU..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-on-surface-variant hover:text-secondary transition-colors p-2 rounded-full hover:bg-surface-container-low relative">
              <span className="material-symbols-outlined text-base">notifications</span>
              {lowStockCount > 0 && (
                <span className="absolute top-2 right-2 bg-secondary h-1.5 w-1.5 rounded-full animate-ping"></span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full border border-outline-variant/20 bg-surface-container-low text-primary flex items-center justify-center font-display-serif text-xs font-bold select-none">
              A
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-grow pt-24 px-8 pb-12 max-w-[1200px] w-full mx-auto animate-fadeIn">
          {activeTab === 'overview' && (
            <div>
              {/* Header & Quick Actions */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="font-headline-md text-headline-md text-primary mb-1">Manager Dashboard</h1>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    Tổng quan hiệu quả hoạt động kho hàng và các chỉ số tồn kho nội thất.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportReport}
                    className="bg-surface-container-lowest text-primary border border-outline-variant px-4 py-2 rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-1.5 animate-fadeIn"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Xuất báo cáo CSV
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card-static rounded-2xl p-6 relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-primary font-bold">chair</span>
                  </div>
                  <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Tổng mẫu nội thất</h3>
                  <p className="text-[36px] font-bold text-primary">{totalProducts}</p>
                  <p className="font-body-sm text-[12px] text-surface-tint mt-2 flex items-center">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 mr-1">trending_up</span>
                    <span className="text-emerald-600 font-medium mr-1">+12%</span> so với tháng trước
                  </p>
                </div>

                <div className="card-static rounded-2xl p-6 relative overflow-hidden group shadow-sm border-l-4 border-[#F57C00]">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-[#F57C00]">warning</span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold">Sắp hết hàng (Dưới 20)</h3>
                    {lowStockCount > 0 && (
                      <span className="bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">Cần chú ý</span>
                    )}
                  </div>
                  <p className="text-[36px] font-bold text-primary">{lowStockCount}</p>
                  <p className="font-body-sm text-[12px] text-surface-tint mt-2">Sản phẩm có mức báo động thấp</p>
                </div>

                <div className="card-static rounded-2xl p-6 relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-primary">account_balance_wallet</span>
                  </div>
                  <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Tổng giá trị tồn kho</h3>
                  <p className="text-[36px] font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalValue)}
                  </p>
                  <p className="font-body-sm text-[12px] text-surface-tint mt-2 flex items-center">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 mr-1">trending_up</span>
                    <span className="text-emerald-600 font-medium mr-1">+8.2%</span> so với tháng trước
                  </p>
                </div>

                <div className="card-static rounded-2xl p-6 relative overflow-hidden group shadow-sm border-l-4 border-error">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-error">remove_shopping_cart</span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold">Hết hàng tồn kho</h3>
                  </div>
                  <p className="text-[36px] font-bold text-primary">{outOfStockCount}</p>
                  <p className="font-body-sm text-[12px] text-surface-tint mt-2">Cần tái nhập hàng ngay</p>
                </div>
              </div>

              {/* Trends & Recent additions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart representation */}
                <div className="lg:col-span-2 card-static rounded-2xl p-6 h-96 flex flex-col shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-headline-sm text-headline-sm text-primary">Xu hướng xuất nhập nội thất</h2>
                    <span className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30">30 ngày qua</span>
                  </div>
                  <div className="flex-grow flex items-end space-x-2 relative mt-4">
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-outline w-8">
                      <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                    </div>
                    <div className="ml-10 flex-grow h-full border-b border-l border-outline-variant/60 flex items-end space-x-4 px-4 pt-4">
                      <div className="w-full bg-secondary-container/20 hover:bg-secondary-container/40 transition-all rounded-t-lg h-[40%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/30 hover:bg-secondary-container/50 transition-all rounded-t-lg h-[60%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/80 hover:bg-secondary-container transition-all rounded-t-lg h-[85%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/20 hover:bg-secondary-container/40 transition-all rounded-t-lg h-[50%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/40 hover:bg-secondary-container/65 transition-all rounded-t-lg h-[70%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/25 hover:bg-secondary-container/45 transition-all rounded-t-lg h-[45%] cursor-pointer" />
                      <div className="w-full bg-secondary-container/90 hover:bg-secondary-container transition-all rounded-t-lg h-[90%] cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Recently Added */}
                <div className="card-static rounded-2xl p-6 h-96 flex flex-col shadow-sm">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Mẫu mới nhập kho</h2>
                  <ul className="space-y-3 overflow-y-auto pr-1 flex-grow">
                    {products.slice(0, 4).map(p => (
                      <li key={p.id} className="flex items-center p-3 hover:bg-surface-container-low rounded-xl transition-all border border-transparent hover:border-outline-variant/30 cursor-pointer">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 mr-4" />
                        <div className="flex-grow">
                          <h4 className="font-label-md text-label-md text-primary font-semibold truncate max-w-[150px]">{p.name}</h4>
                          <p className="font-label-sm text-[11px] text-surface-tint">SKU: {p.sku}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-600">+{p.stock}</span>
                          <p className="text-[10px] text-surface-tint">Hôm nay</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              {/* Title & Quick Actions */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="font-headline-md text-headline-md text-primary mb-1">Quản Lý Tồn Kho Nội Thất</h1>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    Quản lý định mức, hình ảnh, mã sản phẩm và thực hiện các chức năng nhập xuất kho nhanh.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportReport}
                    className="bg-surface-container-lowest text-primary border border-outline-variant/60 hover:border-outline px-4 py-2.5 rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Xuất Báo Cáo
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="bg-secondary-container hover:bg-secondary-container/90 text-white px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm Sản Phẩm Mới
                  </button>
                </div>
              </div>

              {/* Table section */}
              <div className="card-static rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-outline-variant/50 flex justify-between items-center bg-surface-bright/50">
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Danh mục kho hàng</h2>
                  <div className="flex space-x-3">
                    {/* Category Filter */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">filter_list</span>
                      <select
                        className="pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant/50 hover:border-outline rounded-xl text-sm focus:outline-none focus:border-secondary-container transition-all appearance-none cursor-pointer outline-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat === 'All Categories' ? 'Tất cả danh mục' : cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/50 text-on-surface-variant border-b border-outline-variant/50">
                        <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider font-bold">Sản phẩm</th>
                        <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider font-bold">SKU</th>
                        <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider font-bold">Danh mục</th>
                        <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider font-bold">Mức tồn kho</th>
                        <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider font-bold text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 bg-surface-container-lowest">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(p => (
                          <tr key={p.id} className={`hover:bg-surface-bright/35 transition-colors group ${p.stock === 0 ? 'bg-red-500/5' : ''}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <img
                                  src={p.image || 'https://via.placeholder.com/150'}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-xl mr-4 flex-shrink-0 shadow-sm border border-outline-variant/30"
                                />
                                <div>
                                  <p className="font-label-md text-label-md text-primary font-bold">{p.name}</p>
                                  <p className="text-xs text-secondary font-bold">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-surface-tint font-mono font-semibold">{p.sku}</td>
                            <td className="py-4 px-6 text-sm text-surface-tint font-medium">{p.category}</td>
                            <td className="py-4 px-6">
                              {p.stock === 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                                  Hết hàng (0)
                                </span>
                              ) : p.stock < 20 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                                  Sắp hết (Low: {p.stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
                                  Sẵn có ({p.stock})
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right space-x-1">
                              <button
                                onClick={() => openRestockModal(p)}
                                className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-colors inline-block ${
                                  p.stock < 20
                                    ? 'text-secondary-container hover:text-secondary bg-secondary-container/10'
                                    : 'text-outline hover:text-primary hover:bg-surface-container'
                                }`}
                              >
                                {p.stock < 20 ? 'Nhập thêm' : '+Stock'}
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="text-outline hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container inline-block"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-outline hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container/20 inline-block"
                                title="Xóa sản phẩm"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-on-surface-variant opacity-60">
                            <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                            Không tìm thấy sản phẩm nội thất nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-outline-variant bg-surface-bright/30 flex justify-between items-center text-sm text-surface-tint">
                  <span>Hiển thị 1 đến {filteredProducts.length} của {totalProducts} sản phẩm</span>
                  <div className="flex space-x-1">
                    <button className="px-3 py-1.5 border border-outline-variant/60 rounded-xl hover:bg-surface-container-low disabled:opacity-50 text-xs font-semibold" disabled>Trước</button>
                    <button className="px-3 py-1.5 bg-secondary-container text-white rounded-xl text-xs font-bold shadow-sm">1</button>
                    <button className="px-3 py-1.5 border border-outline-variant/60 rounded-xl hover:bg-surface-container-low text-xs font-semibold">Sau</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Title Header */}
              <div>
                <h1 className="font-display-serif text-3xl font-medium text-primary mb-1">Quản Lý Đơn Hàng</h1>
                <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">
                  // Quản trị lịch sử mua sắm, giao vận và cập nhật trạng thái hóa đơn
                </p>
              </div>

              {orderToast && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-lg font-mono text-xs flex items-center justify-between animate-fadeIn">
                  <span>{orderToast}</span>
                  <button onClick={() => setOrderToast(null)} className="font-bold text-xs uppercase ml-4">✕</button>
                </div>
              )}

              {isOrdersLoading ? (
                <div className="card-static rounded-lg border border-outline-variant/15 p-16 text-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-outline">Đang tải danh sách đơn hàng...</span>
                </div>
              ) : (
                <div className="card-static rounded-lg border border-outline-variant/15 overflow-hidden bg-surface-container-lowest shadow-sm">
                  <div className="p-5 border-b border-outline-variant/15 flex justify-between items-center bg-surface-bright/50">
                    <h2 className="font-display-serif text-lg font-semibold text-primary">Danh sách hóa đơn mua sắm</h2>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-outline">Tổng số: {ordersList.length} đơn</span>
                      <button
                        onClick={fetchAllOrders}
                        className="font-mono text-[10px] uppercase tracking-wider text-secondary border border-secondary/30 px-3 py-1 rounded hover:bg-secondary/5 transition-colors cursor-pointer"
                      >
                        ↻ Làm mới
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant">
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Mã đơn</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Ngày đặt</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Khách hàng</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Tổng tiền</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Thanh toán</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-center">Trạng thái</th>
                          <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {ordersList.length > 0 ? (
                          ordersList.map((order) => (
                            <tr key={order.id} className="hover:bg-surface-bright/20 transition-colors">
                              <td className="py-4 px-6 font-bold text-primary">#{order.id}</td>
                              <td className="py-4 px-6 text-on-surface-variant/80">{order.createdAt ? order.createdAt.split(',')[0] : 'N/A'}</td>
                              <td className="py-4 px-6">
                                <p className="font-semibold text-primary font-body-sm">{order.receiverName}</p>
                                <p className="text-[10px] text-outline mt-0.5">{order.phoneNumber}</p>
                              </td>
                              <td className="py-4 px-6 font-bold text-primary">
                                {order.total != null ? order.total.toLocaleString('vi-VN') : '0'} ₫
                              </td>
                              <td className="py-4 px-6 font-bold">
                                <span className={`text-[10px] uppercase tracking-wider ${
                                  order.paymentMethod === 'CARD' ? 'text-emerald-600' : 'text-[#FF5F38]'
                                }`}>
                                  {order.paymentMethod === 'CARD' ? 'Thẻ' : 'COD'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  className={`font-mono text-[9px] uppercase tracking-wider font-bold rounded px-2.5 py-1 bg-surface border cursor-pointer focus:outline-none ${
                                    order.status === 'COMPLETED' ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' :
                                    order.status === 'PROCESSING' ? 'text-blue-600 border-blue-500/20 bg-blue-500/5' :
                                    order.status === 'CANCELLED' ? 'text-error border-error/20 bg-error/5' :
                                    'text-[#FF5F38] border-amber-500/20 bg-amber-500/5'
                                  }`}
                                >
                                  <option value="PENDING">Chờ xử lý</option>
                                  <option value="PROCESSING">Đang giao</option>
                                  <option value="COMPLETED">Đã giao</option>
                                  <option value="CANCELLED">Đã hủy</option>
                                </select>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedAdminOrder(order);
                                    setIsOrderDetailsOpen(true);
                                  }}
                                  className="text-secondary hover:underline font-bold text-xs uppercase tracking-wider cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-outline">
                              Bảng quản lý chưa ghi nhận hóa đơn nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Detail Modal */}
              {isOrderDetailsOpen && selectedAdminOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-surface max-w-3xl w-full border border-outline-variant/20 rounded-lg shadow-2xl p-6 relative flex flex-col max-h-[85vh] animate-fadeInUp">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4 mb-4">
                      <div>
                        <h3 className="font-display-serif text-xl font-semibold text-primary">
                          Hóa Đơn Chi Tiết #{selectedAdminOrder.id}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                          <span className="text-outline uppercase text-[10px]">Trạng thái hiện tại:</span>
                          <select
                            value={selectedAdminOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedAdminOrder.id, e.target.value)}
                            className={`font-mono text-[10px] uppercase tracking-wider font-bold rounded px-2.5 py-0.5 bg-surface border cursor-pointer focus:outline-none ${
                              selectedAdminOrder.status === 'COMPLETED' ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' :
                              selectedAdminOrder.status === 'PROCESSING' ? 'text-blue-600 border-blue-500/20 bg-blue-500/5' :
                              selectedAdminOrder.status === 'CANCELLED' ? 'text-error border-error/20 bg-error/5' :
                              'text-[#FF5F38] border-amber-500/20 bg-amber-500/5'
                            }`}
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PROCESSING">Đang giao</option>
                            <option value="COMPLETED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsOrderDetailsOpen(false);
                          setSelectedAdminOrder(null);
                        }}
                        className="text-on-surface-variant hover:text-primary transition-colors font-mono text-sm font-bold cursor-pointer"
                      >
                        [ĐÓNG]
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="overflow-y-auto space-y-6 pr-1">
                      {selectedAdminOrder.status === 'CANCELLED' && (
                        <div className="p-3 bg-error/10 border border-error/30 text-error rounded font-mono text-xs space-y-1">
                          <p className="font-bold uppercase tracking-wider text-[10px]">Đơn hàng đã hủy</p>
                          {selectedAdminOrder.cancelReason && <p><span className="font-semibold">Lý do hủy:</span> {selectedAdminOrder.cancelReason}</p>}
                          {selectedAdminOrder.cancelledAt && <p className="text-[10px] opacity-80">Thời gian hủy: {selectedAdminOrder.cancelledAt}</p>}
                        </div>
                      )}

                      {/* Recipient details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-outline-variant/10 pb-4">
                        <div className="space-y-1.5 font-mono text-xs">
                          <p className="font-bold text-primary uppercase text-[10px] tracking-wider mb-1 text-secondary">Người Nhận Hàng</p>
                          <p>Họ tên: <span className="text-primary font-bold">{selectedAdminOrder.receiverName}</span></p>
                          <p>Điện thoại: <span className="text-primary font-bold">{selectedAdminOrder.phoneNumber}</span></p>
                          <p>Địa chỉ: <span className="text-primary font-bold">{selectedAdminOrder.address}</span></p>
                        </div>
                        <div className="space-y-1.5 font-mono text-xs">
                          <p className="font-bold text-primary uppercase text-[10px] tracking-wider mb-1 text-secondary">Giao Dịch</p>
                          <p>Ngày tạo: <span className="text-primary font-bold">{selectedAdminOrder.createdAt}</span></p>
                          <p>Phương thức: <span className="text-primary font-bold">{selectedAdminOrder.paymentMethod === 'CARD' ? 'Thẻ ngân hàng' : 'COD (Tiền mặt)'}</span></p>
                          {selectedAdminOrder.paymentMethod === 'CARD' && (
                            <p>Số thẻ: <span className="text-primary font-bold">{selectedAdminOrder.cardNumber}</span></p>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        <h4 className="font-display-serif text-sm font-semibold text-primary">Sản Phẩm Đã Mua</h4>
                        <div className="border border-outline-variant/10 rounded overflow-hidden">
                          <table className="w-full text-left border-collapse font-mono text-[11px]">
                            <thead>
                              <tr className="bg-surface border-b border-outline-variant/10 text-on-surface-variant">
                                <th className="py-2.5 px-4 font-bold uppercase">Mặt hàng</th>
                                <th className="py-2.5 px-4 font-bold uppercase">SKU</th>
                                <th className="py-2.5 px-4 font-bold uppercase text-center">Giá</th>
                                <th className="py-2.5 px-4 font-bold uppercase text-center">SL</th>
                                <th className="py-2.5 px-4 font-bold uppercase text-right">Tổng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                              {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
                                selectedAdminOrder.items.map((item: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-3 px-4 flex items-center gap-3">
                                      {item.image && (
                                        <img src={item.image} alt={item.productName} className="w-8 h-8 object-cover rounded border border-outline-variant/10" />
                                      )}
                                      <div>
                                        <p className="font-bold text-primary line-clamp-1">{item.productName}</p>
                                        {(item.selectedColor || item.selectedSize) && (
                                          <p className="text-[9px] text-outline">
                                            {item.selectedColor && `Màu: ${item.selectedColor}`} {item.selectedColor && item.selectedSize && '•'} {item.selectedSize && `Size: ${item.selectedSize}`}
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-on-surface-variant/80">{item.sku || 'N/A'}</td>
                                    <td className="py-3 px-4 text-center">{item.price.toLocaleString('vi-VN')} ₫</td>
                                    <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                                    <td className="py-3 px-4 text-right font-bold text-primary">
                                      {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-outline">
                                    Đơn hàng mẫu (Không có danh mục mặt hàng cụ thể)
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pricing calculation summary */}
                      <div className="flex flex-col items-end pt-3">
                        <div className="w-full max-w-xs space-y-2 font-mono text-xs">
                          <div className="flex justify-between">
                            <span>Tạm tính:</span>
                            <span className="text-primary font-bold">{selectedAdminOrder.subtotal.toLocaleString('vi-VN')} ₫</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí vận chuyển:</span>
                            <span className="text-secondary font-bold">Miễn phí</span>
                          </div>
                          <div className="border-t border-outline-variant/15 pt-2 flex justify-between font-display-serif text-base font-bold text-primary">
                            <span>Tổng tiền:</span>
                            <span>{selectedAdminOrder.total.toLocaleString('vi-VN')} ₫</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="text-center py-16 card-static rounded-2xl shadow-sm">
              <span className="material-symbols-outlined text-[64px] text-outline/40 mb-3 block">insights</span>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Báo cáo & Phân tích chuyên sâu</h2>
              <p className="text-on-surface-variant font-body-md text-body-md max-w-md mx-auto mb-6">
                Xu hướng mua sắm nội thất, phân loại sản phẩm bán chạy nhất và tỷ lệ xoay vòng tồn kho.
              </p>
              <button onClick={handleExportReport} className="px-5 py-2.5 bg-secondary-container text-white font-label-md text-label-md rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 mx-auto">
                <span className="material-symbols-outlined">download</span> Xuất toàn bộ báo cáo CSV
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card-static rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold mb-4 border-b pb-3">Cấu hình hệ thống StockMaster</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <div>
                    <h4 className="font-label-md text-label-md text-primary font-semibold">Cảnh báo tồn kho tối thiểu</h4>
                    <p className="text-xs text-on-surface-variant">Thông báo khi sản phẩm nội thất xuống dưới 20 đơn vị.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 rounded cursor-pointer" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <div>
                    <h4 className="font-label-md text-label-md text-primary font-semibold">Ẩn sản phẩm hết hàng</h4>
                    <p className="text-xs text-on-surface-variant">Tự động ẩn sản phẩm trên website LuxeCommerce khi tồn kho bằng 0.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-secondary-container border-outline-variant focus:ring-secondary-container/20 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-[0px_20px_50px_rgba(0,0,0,0.3)] border border-outline-variant/30 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-surface-bright border-b border-outline-variant/40 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Thêm sản phẩm nội thất mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-outline hover:text-primary rounded-full hover:bg-surface-container p-1 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tên sản phẩm nội thất *</label>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: Ghế tựa thư giãn Lusso"
                  className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                    formErrors.name ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                  }`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {formErrors.name && <p className="text-xs text-error mt-1">{formErrors.name}</p>}
              </div>

              {/* SKU & Category Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mã định danh SKU *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ví dụ: FUR-LU-001"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.sku ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                  {formErrors.sku && <p className="text-xs text-error mt-1">{formErrors.sku}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Danh mục</label>
                  <select
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all cursor-pointer"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="Nội thất">Nội thất</option>
                    <option value="Đồ trang trí">Đồ trang trí</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Danh mục con</label>
                  <select
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all cursor-pointer"
                    value={formData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  >
                    <option value="Phòng Khách">Phòng Khách</option>
                    <option value="Phòng Ngủ">Phòng Ngủ</option>
                    <option value="Bàn Ghế Ăn">Bàn Ghế Ăn</option>
                    <option value="Đồ Trang Trí">Đồ Trang Trí</option>
                  </select>
                </div>
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Giá bán (VND ₫) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="8500000"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.price ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : '')}
                  />
                  {formErrors.price && <p className="text-xs text-error mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Số lượng nhập kho *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="45"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.stock ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value ? Number(e.target.value) : '')}
                  />
                  {formErrors.stock && <p className="text-xs text-error mt-1">{formErrors.stock}</p>}
                </div>
              </div>

              {/* Product Image Input */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Hình ảnh sản phẩm *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dán link hình ảnh (URL) hoặc chọn file..."
                    className={`flex-grow px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.image ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-container border border-outline-variant/60 hover:bg-surface-container-high px-4 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Tải ảnh
                  </button>
                </div>
                {formErrors.image && <p className="text-xs text-error mt-1">{formErrors.image}</p>}

                {/* Image Preview Box */}
                {formData.image && (
                  <div className="mt-3 p-2 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center justify-center relative group max-w-[200px] h-[120px] overflow-hidden mx-auto">
                    <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                    <button
                      type="button"
                      onClick={() => handleInputChange('image', '')}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả thông số, kích thước, chất liệu..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {/* Product Variants Section */}
              <div className="border-t border-outline-variant/40 pt-4 mt-2">
                <h4 className="font-bold text-sm text-primary mb-2">Biến thể sản phẩm (Variants)</h4>
                
                {/* Add new variant inputs */}
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Màu sắc *</label>
                      <select
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs cursor-pointer"
                        value={tempVariant.color}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, color: e.target.value }))}
                      >
                        <option value="">Chọn màu sắc</option>
                        <option value="Classic Navy">Classic Navy</option>
                        <option value="Matte Black">Matte Black</option>
                        <option value="Natural Oak">Natural Oak</option>
                        <option value="Tan Brown">Tan Brown</option>
                        <option value="Charcoal Black">Charcoal Black</option>
                        <option value="Đen">Đen</option>
                        <option value="Trắng">Trắng</option>
                        <option value="Xám">Xám</option>
                        <option value="Đỏ">Đỏ</option>
                        <option value="Xanh dương">Xanh dương</option>
                        <option value="Vàng">Vàng</option>
                        <option value="Xanh lá">Xanh lá</option>
                        <option value="Hồng">Hồng</option>
                        <option value="Cam">Cam</option>
                        <option value="Nâu">Nâu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Kích thước *</label>
                      <select
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs cursor-pointer"
                        value={tempVariant.size}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, size: e.target.value }))}
                      >
                        <option value="Compact">Compact</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Giá bán (VND) *</label>
                      <input
                        type="number"
                        placeholder="Giá riêng cho biến thể"
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.price || ''}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Số lượng kho *</label>
                      <input
                        type="number"
                        placeholder="Số lượng kho riêng"
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.stock}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Hình ảnh biến thể (Link URL hoặc tải lên)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Dán link hình ảnh (URL)..."
                        className="flex-grow px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.image || ''}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, image: e.target.value }))}
                      />
                      <label className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-container border border-outline-variant hover:bg-surface-container-high rounded-lg cursor-pointer text-[10px] font-semibold text-primary">
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        Tải ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              try {
                                const file = e.target.files[0];
                                const uploadedUrl = await uploadImageIfSelected(file);
                                setTempVariant(prev => ({ ...prev, image: uploadedUrl }));
                              } catch (err: any) {
                                alert("Lỗi khi tải ảnh: " + err.message);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddVariantToList}
                      className="px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Thêm biến thể
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                {formData.variants.length > 0 ? (
                  <div className="max-h-[150px] overflow-y-auto border border-outline-variant/30 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 sticky top-0">
                        <tr>
                          <th className="p-2 font-semibold">Ảnh</th>
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Màu sắc</th>
                          <th className="p-2 font-semibold">Kích cỡ</th>
                          <th className="p-2 font-semibold">Giá bán</th>
                          <th className="p-2 font-semibold text-center">Kho</th>
                          <th className="p-2 font-semibold text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                        {formData.variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low/40">
                            <td className="p-2">
                              {v.image ? (
                                <img src={v.image} alt={v.sku} className="w-8 h-8 object-cover rounded border border-outline-variant/30" />
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/40">Không có</span>
                              )}
                            </td>
                            <td className="p-2 font-mono text-[10px]">{v.sku}</td>
                            <td className="p-2">{v.color}</td>
                            <td className="p-2">{v.size}</td>
                            <td className="p-2 font-semibold text-primary">{v.price.toLocaleString('vi-VN')} ₫</td>
                            <td className="p-2 text-center">{v.stock}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantFromList(idx)}
                                className="text-outline hover:text-error transition-colors p-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/70 italic text-center py-2 bg-surface-container-low/20 rounded-xl border border-dashed border-outline-variant/30">
                    Chưa có biến thể nào được tạo.
                  </p>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-outline-variant/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-primary rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-secondary-container hover:bg-secondary-container/95 text-white rounded-xl font-label-md text-label-md shadow-sm transition-colors"
                >
                  Tạo sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-[0px_20px_50px_rgba(0,0,0,0.3)] border border-outline-variant/30 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-surface-bright border-b border-outline-variant/40 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Chỉnh sửa sản phẩm</h3>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); }} className="text-outline hover:text-primary rounded-full hover:bg-surface-container p-1 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tên sản phẩm *</label>
                <input
                  required
                  type="text"
                  className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                    formErrors.name ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                  }`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {formErrors.name && <p className="text-xs text-error mt-1">{formErrors.name}</p>}
              </div>

              {/* SKU & Category Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mã định danh SKU *</label>
                  <input
                    required
                    type="text"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.sku ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                  {formErrors.sku && <p className="text-xs text-error mt-1">{formErrors.sku}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Danh mục</label>
                  <select
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all cursor-pointer"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="Nội thất">Nội thất</option>
                    <option value="Đồ trang trí">Đồ trang trí</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Danh mục con</label>
                  <select
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all cursor-pointer"
                    value={formData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  >
                    <option value="Phòng Khách">Phòng Khách</option>
                    <option value="Phòng Ngủ">Phòng Ngủ</option>
                    <option value="Bàn Ghế Ăn">Bàn Ghế Ăn</option>
                    <option value="Đồ Trang Trí">Đồ Trang Trí</option>
                  </select>
                </div>
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Giá bán (VND ₫) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.price ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : '')}
                  />
                  {formErrors.price && <p className="text-xs text-error mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Số lượng tồn kho *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.stock ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value ? Number(e.target.value) : '')}
                  />
                  {formErrors.stock && <p className="text-xs text-error mt-1">{formErrors.stock}</p>}
                </div>
              </div>

              {/* Product Image Input */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Hình ảnh sản phẩm *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dán link hình ảnh (URL) hoặc chọn file..."
                    className={`flex-grow px-3 py-2 bg-surface-container-low border rounded-xl outline-none text-sm transition-all ${
                      formErrors.image ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:border-secondary-container'
                    }`}
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-container border border-outline-variant/60 hover:bg-surface-container-high px-4 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Tải ảnh
                  </button>
                </div>
                {formErrors.image && <p className="text-xs text-error mt-1">{formErrors.image}</p>}

                {/* Image Preview Box */}
                {formData.image && (
                  <div className="mt-3 p-2 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center justify-center relative group max-w-[200px] h-[120px] overflow-hidden mx-auto">
                    <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                    <button
                      type="button"
                      onClick={() => handleInputChange('image', '')}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 focus:border-secondary-container rounded-xl outline-none text-sm transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {/* Product Variants Section */}
              <div className="border-t border-outline-variant/40 pt-4 mt-2">
                <h4 className="font-bold text-sm text-primary mb-2">Biến thể sản phẩm (Variants)</h4>
                
                {/* Add new variant inputs */}
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Màu sắc *</label>
                      <select
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs cursor-pointer"
                        value={tempVariant.color}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, color: e.target.value }))}
                      >
                        <option value="">Chọn màu sắc</option>
                        <option value="Classic Navy">Classic Navy</option>
                        <option value="Matte Black">Matte Black</option>
                        <option value="Natural Oak">Natural Oak</option>
                        <option value="Tan Brown">Tan Brown</option>
                        <option value="Charcoal Black">Charcoal Black</option>
                        <option value="Đen">Đen</option>
                        <option value="Trắng">Trắng</option>
                        <option value="Xám">Xám</option>
                        <option value="Đỏ">Đỏ</option>
                        <option value="Xanh dương">Xanh dương</option>
                        <option value="Vàng">Vàng</option>
                        <option value="Xanh lá">Xanh lá</option>
                        <option value="Hồng">Hồng</option>
                        <option value="Cam">Cam</option>
                        <option value="Nâu">Nâu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Kích thước *</label>
                      <select
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs cursor-pointer"
                        value={tempVariant.size}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, size: e.target.value }))}
                      >
                        <option value="Compact">Compact</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Giá bán (VND) *</label>
                      <input
                        type="number"
                        placeholder="Giá riêng cho biến thể"
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.price || ''}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Số lượng kho *</label>
                      <input
                        type="number"
                        placeholder="Số lượng kho riêng"
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.stock}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Hình ảnh biến thể (Link URL hoặc tải lên)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Dán link hình ảnh (URL)..."
                        className="flex-grow px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg outline-none text-xs"
                        value={tempVariant.image || ''}
                        onChange={(e) => setTempVariant(prev => ({ ...prev, image: e.target.value }))}
                      />
                      <label className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-container border border-outline-variant hover:bg-surface-container-high rounded-lg cursor-pointer text-[10px] font-semibold text-primary">
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        Tải ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              try {
                                const file = e.target.files[0];
                                const uploadedUrl = await uploadImageIfSelected(file);
                                setTempVariant(prev => ({ ...prev, image: uploadedUrl }));
                              } catch (err: any) {
                                alert("Lỗi khi tải ảnh: " + err.message);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddVariantToList}
                      className="px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Thêm biến thể
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                {formData.variants.length > 0 ? (
                  <div className="max-h-[150px] overflow-y-auto border border-outline-variant/30 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 sticky top-0">
                        <tr>
                          <th className="p-2 font-semibold">Ảnh</th>
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Màu sắc</th>
                          <th className="p-2 font-semibold">Kích cỡ</th>
                          <th className="p-2 font-semibold">Giá bán</th>
                          <th className="p-2 font-semibold text-center">Kho</th>
                          <th className="p-2 font-semibold text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                        {formData.variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low/40">
                            <td className="p-2">
                              {v.image ? (
                                <img src={v.image} alt={v.sku} className="w-8 h-8 object-cover rounded border border-outline-variant/30" />
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/40">Không có</span>
                              )}
                            </td>
                            <td className="p-2 font-mono text-[10px]">{v.sku}</td>
                            <td className="p-2">{v.color}</td>
                            <td className="p-2">{v.size}</td>
                            <td className="p-2 font-semibold text-primary">{v.price.toLocaleString('vi-VN')} ₫</td>
                            <td className="p-2 text-center">{v.stock}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantFromList(idx)}
                                className="text-outline hover:text-error transition-colors p-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/70 italic text-center py-2 bg-surface-container-low/20 rounded-xl border border-dashed border-outline-variant/30">
                    Chưa có biến thể nào được tạo.
                  </p>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-outline-variant/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
                  className="px-4 py-2 border border-outline-variant text-primary rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-secondary-container hover:bg-secondary-container/95 text-white rounded-xl font-label-md text-label-md shadow-sm transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {isRestockModalOpen && restockTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Nhập thêm hàng</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Sản phẩm: <span className="font-semibold text-on-surface">{restockTarget.name}</span>
            </p>
            <div className="bg-surface-container-low rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Tồn kho hiện tại</span>
              <span className="font-bold text-on-surface text-lg">{restockTarget.stock}</span>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Số lượng nhập thêm</label>
              <input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-surface-container-low border-2 border-outline-variant focus:border-secondary-container rounded-xl outline-none text-lg font-bold text-center transition-all"
                autoFocus
              />
            </div>
            <div className="bg-surface-container rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Tồn kho sau khi nhập</span>
              <span className="font-bold text-secondary-container text-xl">{restockTarget.stock + restockAmount}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsRestockModalOpen(false); setRestockTarget(null); }}
                className="flex-1 px-4 py-2.5 border border-outline-variant text-primary rounded-xl font-label-md hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRestock}
                className="flex-1 px-4 py-2.5 bg-secondary-container hover:bg-secondary-container/90 text-white rounded-xl font-label-md shadow-sm transition-colors"
              >
                Xác nhận nhập hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
