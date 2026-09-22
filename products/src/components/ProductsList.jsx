import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Star, ShoppingCart, CheckCircle2, X, PackageOpen } from 'lucide-react';
import { getProducts } from '../api/axiosClient';
import AddProductModal from './AddProductModal';
import '../index.css';

const CART_KEY = 'mfe_cart_items';

const ProductsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        if (mounted) setItems(data);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((p) => p.category)));
    return ['All', ...list];
  }, [items]);

  const visibleProducts = useMemo(() => {
    return items.filter((p) => {
      const matchCat = activeCat === 'All' || p.category?.toLowerCase() === activeCat.toLowerCase();
      const matchQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [items, activeCat, query]);

  const addToCart = (product) => {
    window.dispatchEvent(
      new CustomEvent('MFE_CART_ADD_ITEM', {
        detail: { product },
      })
    );

    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      const match = cart.find((i) => i.product.id === product.id);

      let next;
      if (match) {
        next = cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        next = [...cart, { product, quantity: 1 }];
      }

      localStorage.setItem(CART_KEY, JSON.stringify(next));

      window.dispatchEvent(
        new CustomEvent('MFE_CART_UPDATED', {
          detail: {
            items: next,
            totalCount: next.reduce((sum, i) => sum + i.quantity, 0),
          },
        })
      );
    } catch {
    }

    showToast(`Added "${product.name}" to cart`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 2600);
  };

  const handleProductAdded = (newProd) => {
    setItems((prev) => [newProd, ...prev]);
    showToast(`"${newProd.name}" added successfully`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Catalog Remote
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Products
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-xl">
              Browse gadgets and accessories with live Axios synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {categories.map((cat) => {
              const active = activeCat.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="text-xs sm:text-sm text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{visibleProducts.length}</span> items
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm animate-pulse flex flex-col h-[400px]"
            >
              <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-5 bg-slate-200 rounded w-4/5 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-full mb-4" />
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-6 bg-slate-200 rounded w-1/4" />
                <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
          <p className="text-sm text-slate-500 mb-6">
            Try adjusting your search query or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCat('All');
              setQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
            >
              <div className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-800 shadow-sm">
                  {product.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {Number(product.rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({product.reviewsCount})
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {product.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Price</span>
                    <span className="text-lg font-black text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleProductAdded}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
