import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Star, Truck, ShieldCheck, CreditCard, 
  Package, CheckCircle2, AlertTriangle, ArrowRight, Eye, Plus, 
  Trash2, Send, Mail, MapPin, ExternalLink, RefreshCw, X, Sparkles,
  DollarSign, ChevronRight, MessageSquare, ThumbsUp, ShoppingCart, Crown, QrCode
} from 'lucide-react';
import { Product, ProductReview, ShopOrder, Customer } from '../types';

interface ReyShopViewProps {
  products: Product[];
  customers: Customer[];
  onOrderCompleted?: () => void;
}

export const ReyShopView: React.FC<ReyShopViewProps> = ({ 
  products: initialProducts = [], 
  customers = [],
  onOrderCompleted 
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'pos' | 'orders' | 'inventory'>('store');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  // Selected Product for Detail & Reviews Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [newReviewForm, setNewReviewForm] = useState({
    customer_name: '',
    rating: 5,
    title: '',
    comment: ''
  });

  // Cart & Checkout State
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust_1');
  const [shippingAddress, setShippingAddress] = useState('Paseo de la Reforma 250, Piso 14, CDMX');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'SPEI' | 'WEB3_CRYPTO' | 'CARD'>('STRIPE');
  const [carrier, setCarrier] = useState<'DHL Express' | 'FedEx' | 'Estafeta'>('DHL Express');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<ShopOrder | null>(null);

  // Selected Order for Tracking Modal
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<ShopOrder | null>(null);

  // Add Product Modal (Merchant)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Hardware & Terminales',
    price: 249,
    compare_price: 299,
    stock: 50,
    min_stock_alert: 10,
    tags: 'Hardware, POS, NFC'
  });

  // Fetch store data
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/shop/products'),
        fetch('/api/shop/orders')
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(ordData)) setOrders(ordData);
    } catch (e) {
      console.error('Failed to load store data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Fetch reviews when product is selected
  useEffect(() => {
    if (selectedProduct) {
      fetch(`/api/shop/products/${selectedProduct.id}/reviews`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setReviews(data);
        })
        .catch(console.error);
    }
  }, [selectedProduct]);

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' ? true : p.category === selectedCategory;
    const matchesStock = inStockOnly ? p.stock > 0 : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesStock && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0;
  });

  // Cart helpers
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setShowCartDrawer(true);
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item => 
        item.product.id === productId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartTax = Number((cartSubtotal * 0.16).toFixed(2));
  const cartShipping = cartSubtotal > 300 || cartSubtotal === 0 ? 0.00 : 25.00;
  const cartTotal = Number((cartSubtotal + cartTax + cartShipping).toFixed(2));
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewForm.comment) return;

    try {
      const res = await fetch(`/api/shop/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: newReviewForm.customer_name || 'Cliente Verificado',
          rating: Number(newReviewForm.rating),
          title: newReviewForm.title || 'Reseña de Producto',
          comment: newReviewForm.comment
        })
      });
      const newRev = await res.json();
      setReviews(prev => [newRev, ...prev]);
      setNewReviewForm({ customer_name: '', rating: 5, title: '', comment: '' });
      fetchStoreData();
    } catch (e) {
      console.error('Error submitting review:', e);
    }
  };

  // Atomic Checkout Execution
  const handleCheckout = async () => {
    if (!cart.length) return;
    setIsProcessingCheckout(true);

    const activeCust = customers.find(c => c.id === selectedCustomerId) || customers[0] || {
      id: 'cust_1',
      name: 'Sofía Martínez',
      email: 'smartinez@logisticaglobal.com',
      phone: '+52 55 4192 8371'
    };

    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: activeCust.id,
          customer_name: activeCust.name,
          customer_email: activeCust.email,
          customer_phone: activeCust.phone,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          carrier,
          items: cart.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
            image_url: item.product.images[0] || ''
          }))
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCheckoutSuccessOrder(data.order);
        setCart([]);
        setShowCartDrawer(false);
        fetchStoreData();
        if (onOrderCompleted) onOrderCompleted();
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Hubo un problema al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Update Shipment Status (Simulation)
  const handleUpdateShipmentStatus = async (orderId: string, status: string, location: string, note: string) => {
    try {
      const res = await fetch(`/api/shop/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location, note })
      });
      const data = await res.json();
      if (data.success) {
        fetchStoreData();
        if (selectedOrderForTracking && selectedOrderForTracking.id === orderId) {
          setSelectedOrderForTracking(data.order);
        }
      }
    } catch (e) {
      console.error('Failed to update tracking:', e);
    }
  };

  // Add Product Handler (Merchant)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = newProductForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProductForm,
          tags: tagsArray,
          images: ['https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800']
        })
      });
      setShowAddProductModal(false);
      fetchStoreData();
    } catch (e) {
      console.error('Error creating product:', e);
    }
  };

  // Categories list
  const categories = ['ALL', 'Hardware & Terminales', 'Smart Cards & Hardware', 'Infraestructura', 'Desarrollo & SDK'];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-lime-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>ReyShop</span>
                <span className="text-xs font-mono font-bold bg-lime-500 text-slate-950 px-2 py-0.5 rounded-full">
                  E-COMMERCE & POS
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plataforma de comercio con inventario en tiempo real, tracking de envíos y pagos atómicos integrados al Ledger.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Cart Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-mono">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'store' ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Catálogo & Tienda
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'pos' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:text-white'
              }`}
            >
              POS & Caja Registradora
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Pedidos ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'inventory' ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gestión de Stock
            </button>
          </div>

          <button
            onClick={() => setShowCartDrawer(true)}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrito ({totalCartItemsCount})</span>
            {cartTotal > 0 && <span className="bg-slate-950 text-lime-400 px-2 py-0.5 rounded-lg font-mono">${cartTotal.toLocaleString()}</span>}
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left: Quick Catalog / Menu */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" /> Punto de Venta (POS) Reyplace & Menú Rápido
                </h3>
                <p className="text-xs text-slate-400 font-mono">Toca los artículos para agregarlos al ticket de mostrador.</p>
              </div>
              <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold">
                MODO MOSTRADOR ACTIVO
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'p1', name: 'Torta de Asada', price: 80, sku: 'POS-TOR-01', category: 'Alimentos' },
                { id: 'p2', name: 'Refresco 600ml', price: 25, sku: 'POS-BEB-01', category: 'Bebidas' },
                { id: 'p3', name: 'Combo Especial', price: 120, sku: 'POS-CMB-01', category: 'Combos' },
                { id: 'p4', name: 'Tacos al Pastor (Ord.)', price: 90, sku: 'POS-TAC-02', category: 'Alimentos' },
                { id: 'p5', name: 'Agua Mineral 500ml', price: 20, sku: 'POS-AGU-03', category: 'Bebidas' },
                { id: 'p6', name: 'Postre del Día', price: 45, sku: 'POS-DES-04', category: 'Postres' },
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => addToCart({
                    id: item.id,
                    sku: item.sku,
                    name: item.name,
                    description: item.name,
                    category: item.category,
                    price: item.price,
                    currency: 'MXN',
                    stock: 100,
                    min_stock_alert: 5,
                    images: ['https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=400'],
                    rating: 5,
                    reviews_count: 10,
                    tags: [item.category],
                    status: 'ACTIVE',
                    organization_id: 'org_1',
                    created_at: new Date().toISOString()
                  })}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl cursor-pointer transition-all shadow-sm hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-2">{item.name}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900 font-mono">
                    <span className="text-lime-400 font-black">${item.price} MXN</span>
                    <span className="text-slate-500 text-xs">+ Agregar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Current Cart Ticket & Loyalty Points Redemption */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-lime-400" /> Ticket de Venta Actual
                </h3>
                <span className="text-xs font-mono text-slate-400">{totalCartItemsCount} artículos</span>
              </div>

              {/* Cart Items List */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">El ticket está vacío. Selecciona productos del menú.</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="truncate flex-1">
                        <span className="text-white font-bold">{item.quantity}x {item.product.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-lime-400 font-bold">${item.product.price * item.quantity} MXN</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Loyalty Identification Card */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> Cliente: Juan Pérez (Nivel ORO - 1.5x Pts)
                  </span>
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    120 Puntos Disp.
                  </span>
                </div>

                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <input type="checkbox" defaultChecked className="accent-lime-500 w-4 h-4 rounded" />
                  <span>Usar 100 Puntos Reyplace <strong className="text-lime-400">(-$10.00 MXN)</strong></span>
                </label>
              </div>

              {/* Totals Calculation */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>${cartSubtotal} MXN</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA (16%):</span>
                  <span>${cartTax} MXN</span>
                </div>
                <div className="flex justify-between text-lime-400 font-bold">
                  <span>Descuento Puntos Reyplace:</span>
                  <span>-$10.00 MXN</span>
                </div>
                <div className="flex justify-between text-white font-black text-lg pt-2 border-t border-slate-800">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-lime-400">${Math.max(0, cartTotal - 10)} MXN</span>
                </div>
              </div>
            </div>

            {/* Checkout CoDi / DiMo / QR Button */}
            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5 text-slate-950" />
              <span>COBRAR CON QR / CODI / DIMO</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'store' && (
        <div className="space-y-6">
          {/* Search, Filter & Categories Strip */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2.5 flex-1 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 w-full">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar terminales POS, tarjetas titanio, edge hubs, hardware..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort & Stock Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs font-mono">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-lime-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Sólo con Stock</span>
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none"
                >
                  <option value="featured">Destacados</option>
                  <option value="price_low">Precio: Menor a Mayor</option>
                  <option value="price_high">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Calificados (★★★★★)</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'Todos los Productos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.min_stock_alert;

              return (
                <div 
                  key={product.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group hover:-translate-y-1"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img 
                        src={product.images[0] || 'https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.compare_price && (
                          <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                            -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                          </span>
                        )}
                        {isLowStock && (
                          <span className="bg-amber-500 text-slate-950 font-mono text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                            <AlertTriangle className="w-3 h-3" />
                            ÚLTIMAS {product.stock}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="bg-slate-800 text-slate-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                            AGOTADO
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-lime-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-amber-400 font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating || 5.0}</span>
                          <span className="text-slate-500 text-[10px]">({product.reviews_count || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">{product.sku}</span>
                        <h3 
                          onClick={() => setSelectedProduct(product)}
                          className="font-bold text-white text-sm group-hover:text-lime-400 transition-colors line-clamp-2 cursor-pointer mt-0.5"
                        >
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Stock Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Disponibilidad:</span>
                          <span className={isOutOfStock ? 'text-rose-400 font-bold' : isLowStock ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {isOutOfStock ? 'Agotado' : `${product.stock} unidades en stock`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full ${
                              isOutOfStock ? 'bg-slate-700 w-0' :
                              isLowStock ? 'bg-amber-400 w-1/4' : 'bg-lime-400 w-3/4'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-white font-mono">
                            ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{product.currency}</span>
                        </div>
                        {product.compare_price && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ${product.compare_price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product, 1)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                          isOutOfStock 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-lime-500 hover:bg-lime-400 text-slate-950 shadow-lime-500/10'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Comprar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Órdenes de Compra & Despacho ReyShop</h3>
              <p className="text-xs text-slate-400">Seguimiento en tiempo real de pagos, facturas y tracking logístico con transportistas.</p>
            </div>
            <span className="text-xs font-mono text-lime-400">{orders.length} pedidos procesados</span>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay pedidos registrados aún.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Pedido / Fecha</th>
                    <th className="p-4">Cliente & Contacto</th>
                    <th className="p-4">Artículos</th>
                    <th className="p-4">Total Pagado</th>
                    <th className="p-4">Guía & Transportista</th>
                    <th className="p-4">Estado de Entrega</th>
                    <th className="p-4 text-right">Rastreo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white font-mono">{ord.order_number}</div>
                        <div className="text-slate-500 text-[10px]">{new Date(ord.created_at).toLocaleDateString('es-MX')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white font-sans">{ord.customer_name}</div>
                        <div className="text-slate-400 text-[11px]">{ord.customer_email}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="truncate max-w-xs text-[11px]">
                            {it.quantity}x {it.product_name}
                          </div>
                        ))}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-400">${Number(ord.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {ord.currency}</span>
                        <div className="text-[10px] text-slate-500">{ord.payment_method}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="font-bold text-lime-400">{ord.tracking?.carrier || 'DHL Express'}</div>
                        <div className="text-slate-400 text-[10px]">{ord.tracking?.tracking_number}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ord.fulfillment_status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          ord.fulfillment_status === 'SHIPPED' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {ord.fulfillment_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrderForTracking(ord)}
                          className="bg-slate-950 hover:bg-slate-800 text-lime-400 border border-slate-800 hover:border-lime-500/30 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Rastrear</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Inventory Management Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Inventario de Productos & Control de Stock</h3>
              <p className="text-xs text-slate-400">Administra SKU, existencias en almacén y alertas automáticas de reposición.</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto en Inventario</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">SKU / Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio Venta</th>
                  <th className="p-4">Stock Actual</th>
                  <th className="p-4">Alerta Mínima</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white font-sans">{p.name}</div>
                      <div className="text-lime-400 text-[11px] font-mono">{p.sku}</div>
                    </td>
                    <td className="p-4 text-slate-300">{p.category}</td>
                    <td className="p-4 font-bold text-white">${p.price.toFixed(2)} {p.currency}</td>
                    <td className="p-4 font-bold">
                      <span className={p.stock <= p.min_stock_alert ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.stock} unidades
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{p.min_stock_alert} u.</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-lime-400" />
                <h3 className="text-base font-bold text-white">Carrito de Compra</h3>
              </div>
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm font-semibold">Tu carrito está vacío</p>
                  <p className="text-xs">Agrega productos del catálogo para continuar.</p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div key={product.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                    <img 
                      src={product.images[0] || 'https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=200'} 
                      alt={product.name} 
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <p className="text-xs font-mono text-lime-400 mt-0.5">${product.price.toFixed(2)} USD</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">{quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => updateCartQuantity(product.id, 0)}
                          className="text-slate-500 hover:text-rose-400 ml-auto p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white uppercase font-mono tracking-wider">Datos de Entrega y Facturación</h4>
                  
                  {/* Select Customer */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Cliente / Titular</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-500 outline-none"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Dirección de Envío</label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-500 outline-none"
                    />
                  </div>

                  {/* Carrier */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Transportista</label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-500 outline-none"
                    >
                      <option value="DHL Express">DHL Express (1-2 días hábiles)</option>
                      <option value="FedEx">FedEx Priority (2-3 días)</option>
                      <option value="Estafeta">Estafeta Nacional</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Método de Pago Seguro</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'STRIPE', label: 'Stripe Card' },
                        { id: 'SPEI', label: 'SPEI / Banxico' },
                        { id: 'WEB3_CRYPTO', label: 'Web3 / Crypto' },
                        { id: 'CARD', label: 'Tarjeta Débito' }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                            paymentMethod === method.id
                              ? 'bg-lime-500/20 text-lime-300 border-lime-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-3 font-mono">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">${cartSubtotal.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span className="text-white">${cartTax.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío ({carrier}):</span>
                    <span className={cartShipping === 0 ? 'text-lime-400 font-bold' : 'text-white'}>
                      {cartShipping === 0 ? 'GRATIS (Orden > $300)' : `$${cartShipping.toFixed(2)} USD`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Total a Pagar:</span>
                    <span className="text-lime-400">${cartTotal.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  disabled={isProcessingCheckout}
                  onClick={handleCheckout}
                  className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingCheckout ? (
                    <span>Procesando Pago y Factura...</span>
                  ) : (
                    <>
                      <span>Completar Pago Seguro (${cartTotal.toFixed(2)} USD)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail & Customer Reviews Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-lime-400 font-bold bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
                  {selectedProduct.category}
                </span>
                <span className="text-xs font-mono text-slate-400">SKU: {selectedProduct.sku}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Product Hero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-64">
                  <img 
                    src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800'} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-black text-white">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold">{selectedProduct.rating || 5.0}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{reviews.length} reseñas verificadas</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-lime-400 font-mono">
                        ${selectedProduct.price.toFixed(2)} USD
                      </span>
                      {selectedProduct.compare_price && (
                        <span className="block text-xs text-slate-500 line-through font-mono">
                          Precio normal: ${selectedProduct.compare_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addToCart(selectedProduct, 1);
                        setSelectedProduct(null);
                      }}
                      className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-lime-400" />
                    <span>Opiniones & Reseñas de Clientes Verificados</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">Promedio: {selectedProduct.rating} / 5.0</span>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Aún no hay reseñas para este producto. ¡Sé el primero en opinar!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rev.customer_name}</span>
                            {rev.verified_purchase && (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Comprador Verificado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs font-bold text-slate-200">{rev.title}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 mt-4">
                  <h5 className="text-xs font-bold text-white font-mono uppercase">Escribir una Reseña</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[11px]">Tu Nombre</label>
                      <input
                        type="text"
                        placeholder="Ej: Sofía Martínez"
                        value={newReviewForm.customer_name}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, customer_name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[11px]">Calificación en Estrellas</label>
                      <select
                        value={newReviewForm.rating}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-lime-500 outline-none font-mono"
                      >
                        <option value={5}>★★★★★ (5 - Excelente)</option>
                        <option value={4}>★★★★☆ (4 - Muy Bueno)</option>
                        <option value={3}>★★★☆☆ (3 - Bueno)</option>
                        <option value={2}>★★☆☆☆ (2 - Regular)</option>
                        <option value={1}>★☆☆☆☆ (1 - Deficiente)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-slate-400 block mb-1 font-mono text-[11px]">Título de tu opinión</label>
                      <input
                        type="text"
                        placeholder="Excelente calidad y rápido procesamiento"
                        value={newReviewForm.title}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-slate-400 block mb-1 font-mono text-[11px]">Comentario detallado</label>
                      <textarea
                        rows={2}
                        placeholder="Describe tu experiencia con el producto y el tiempo de entrega..."
                        value={newReviewForm.comment}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-lime-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Publicar Reseña Verificada
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-lime-400" />
                  Rastreo de Envío en Vivo
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Orden: {selectedOrderForTracking.order_number}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderForTracking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Badge */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Transportista:</span>
                <span className="text-lime-400 font-bold">{selectedOrderForTracking.tracking?.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guía de Rastreo:</span>
                <span className="text-white font-bold">{selectedOrderForTracking.tracking?.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destino:</span>
                <span className="text-slate-300 truncate max-w-xs">{selectedOrderForTracking.shipping_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entrega Estimada:</span>
                <span className="text-cyan-400 font-bold">{selectedOrderForTracking.tracking?.estimated_delivery}</span>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase">Historial de Tránsito</h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-lime-500/40 ml-2">
                {selectedOrderForTracking.tracking?.history?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-lime-400 shadow-md shadow-lime-500/50"></div>
                    <p className="text-xs font-bold text-white">{step.status}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.location}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{step.note}</p>
                    <span className="text-[10px] font-mono text-lime-400/80 block mt-1">
                      {new Date(step.timestamp).toLocaleString('es-MX')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advance Status Controls (Simulation) */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-500">Simular Avance:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateShipmentStatus(
                    selectedOrderForTracking.id,
                    'IN_TRANSIT',
                    'En ruta con unidad repartidora',
                    'Paquete en camioneta de entrega local.'
                  )}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                >
                  En Tránsito
                </button>
                <button
                  onClick={() => handleUpdateShipmentStatus(
                    selectedOrderForTracking.id,
                    'DELIVERED',
                    'Entregado en domicilio del cliente',
                    'Firma digital de recepción registrada.'
                  )}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Entregado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Order Modal */}
      {checkoutSuccessOrder && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">¡Compra Exitosa en ReyShop!</h3>
            <p className="text-xs text-slate-300">
              Se ha procesado el pago de <strong className="text-lime-400">${checkoutSuccessOrder.total.toFixed(2)} USD</strong> y se emitieron automáticamente la factura y el comprobante oficial.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio Pedido:</span>
                <span className="text-white font-bold">{checkoutSuccessOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guía {checkoutSuccessOrder.tracking?.carrier}:</span>
                <span className="text-lime-400 font-bold">{checkoutSuccessOrder.tracking?.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Notificado:</span>
                <span className="text-slate-300 truncate">{checkoutSuccessOrder.customer_email}</span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutSuccessOrder(null)}
              className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal (Merchant) */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-lime-400" />
                Agregar Producto al Catálogo
              </h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lector NFC ReyWallet Mini"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-lime-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">SKU / Código</label>
                  <input
                    type="text"
                    placeholder="REY-POS-MINI"
                    value={newProductForm.sku}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-lime-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Categoría</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-lime-500 outline-none"
                  >
                    <option value="Hardware & Terminales">Hardware & Terminales</option>
                    <option value="Smart Cards & Hardware">Smart Cards & Hardware</option>
                    <option value="Infraestructura">Infraestructura</option>
                    <option value="Desarrollo & SDK">Desarrollo & SDK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Precio (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Descripción del Producto</label>
                <textarea
                  rows={2}
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-lime-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
