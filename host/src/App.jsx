import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import './index.css';

const ProductsList = React.lazy(() => import('products/ProductsList'));
const CartList = React.lazy(() => import('cart/CartList'));

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />

            <Route
              path="/products"
              element={
                <ErrorBoundary
                  remoteName="Products Microfrontend"
                  remoteUrl="http://localhost:3001"
                >
                  <Suspense fallback={<LoadingFallback message="Loading Products..." />}>
                    <ProductsList />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            <Route
              path="/cart"
              element={
                <ErrorBoundary
                  remoteName="Cart Microfrontend"
                  remoteUrl="http://localhost:3002"
                >
                  <Suspense fallback={<LoadingFallback message="Loading Cart..." />}>
                    <CartList />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            <Route
              path="*"
              element={
                <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h2>
                  <p className="text-sm text-slate-500 mb-6">The requested page does not exist.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Products</span>
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-medium text-slate-500">
              NextStore &bull; React 18 &bull; Tailwind CSS &bull; Axios &bull; Yup
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Host :3000</span>
              <span>&bull;</span>
              <span>Products :3001</span>
              <span>&bull;</span>
              <span>Cart :3002</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
