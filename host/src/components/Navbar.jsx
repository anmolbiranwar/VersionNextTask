import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, ShoppingCart, Menu, X, Activity } from 'lucide-react';
import '../index.css';

const CART_KEY = 'mfe_cart_items';

const Navbar = () => {
  const [count, setCount] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return parsed.reduce((total, item) => total + (item.quantity || 1), 0);
    } catch {
      return 0;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onCartUpdate = (e) => {
      if (typeof e.detail?.totalCount === 'number') {
        setCount(e.detail.totalCount);
      } else if (e.detail?.items) {
        const total = e.detail.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCount(total);
      }
    };

    window.addEventListener('MFE_CART_UPDATED', onCartUpdate);
    return () => window.removeEventListener('MFE_CART_UPDATED', onCartUpdate);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <NavLink to="/products" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                NextStore
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide uppercase">
                MFE
              </span>
            </div>
          </NavLink>

          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Layers className="w-4 h-4" />
              <span>Products</span>
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {count > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold shadow-sm shadow-purple-500/30">
                  {count}
                </span>
              )}
            </NavLink>

            <div className="h-5 w-px bg-slate-200 mx-2" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-700">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <NavLink
              to="/cart"
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              <ShoppingCart className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                  {count}
                </span>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2">
          <NavLink
            to="/products"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Layers className="w-5 h-5" />
            <span>Products Catalog</span>
          </NavLink>

          <NavLink
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive ? 'bg-purple-50 text-purple-600' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping Cart</span>
            </div>
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">
                {count}
              </span>
            )}
          </NavLink>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4 py-2">
            <span>Federation Status</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
