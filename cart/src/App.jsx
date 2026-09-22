import React from 'react';
import { ShoppingBag } from 'lucide-react';
import CartList from './components/CartList';
import './index.css';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 sm:px-8 py-4 border-b border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tight">NextStore</span>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Cart Remote :3002
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Standalone Dev Mode &bull; Yup Validation Active
        </div>
      </header>

      <main>
        <CartList />
      </main>
    </div>
  );
};

export default App;
