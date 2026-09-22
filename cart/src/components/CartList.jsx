import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import CheckoutModal from "./CheckoutModal";
import { checkPromo } from "../api/axiosClient";
import "../index.css";

const CART_KEY = "mfe_cart_items";

const CartList = () => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const updateCart = (nextItems) => {
    setCart(nextItems);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    } catch {}

    const totalCount = nextItems.reduce((acc, item) => acc + item.quantity, 0);
    window.dispatchEvent(
      new CustomEvent("MFE_CART_UPDATED", {
        detail: {
          items: nextItems,
          totalCount,
        },
      }),
    );
  };

  useEffect(() => {
    const onAdd = (e) => {
      if (e.detail?.product) {
        const p = e.detail.product;
        setCart((prev) => {
          const match = prev.find((item) => item.product.id === p.id);
          let next;
          if (match) {
            next = prev.map((item) =>
              item.product.id === p.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          } else {
            next = [...prev, { product: p, quantity: 1 }];
          }
          localStorage.setItem(CART_KEY, JSON.stringify(next));
          return next;
        });
      }
    };

    const onUpdate = (e) => {
      if (e.detail?.items) {
        setCart(e.detail.items);
      }
    };

    window.addEventListener("MFE_CART_ADD_ITEM", onAdd);
    window.addEventListener("MFE_CART_UPDATED", onUpdate);

    return () => {
      window.removeEventListener("MFE_CART_ADD_ITEM", onAdd);
      window.removeEventListener("MFE_CART_UPDATED", onUpdate);
    };
  }, []);

  const removeItem = (id) => {
    const next = cart.filter((item) => item.product.id !== id);
    updateCart(next);
  };

  const changeQty = (id, delta) => {
    const next = cart
      .map((item) => {
        if (item.product.id === id) {
          const q = item.quantity + delta;
          return q > 0 ? { ...item, quantity: q } : null;
        }
        return item;
      })
      .filter(Boolean);

    updateCart(next);
  };

  const clearCart = () => {
    if (window.confirm("Empty your shopping cart?")) {
      updateCart([]);
      setCoupon(null);
    }
  };

  const applyPromo = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setCheckingCode(true);
    setCouponErr(null);

    try {
      const res = await checkPromo(code);
      if (res.valid) {
        setCoupon(res);
        setCouponErr(null);
      } else {
        setCoupon(null);
        setCouponErr(res.message || "Invalid coupon");
      }
    } catch {
      setCouponErr("Unable to verify promo code");
    } finally {
      setCheckingCode(false);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discount = coupon?.discountPercent
    ? (subtotal * coupon.discountPercent) / 100
    : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.08;
  const isFreeShip = coupon?.freeShipping || subtotal > 150 || subtotal === 0;
  const shipping = isFreeShip ? 0 : 9.99;
  const grandTotal = taxable + tax + shipping;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            You don't have any items in your cart yet. Explore our latest items!
          </p>
          <a
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
          >
            Explore Catalog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Cart Remote
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-800">{itemCount}</span>{" "}
              items in your order
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
              <span>Items ({cart.length})</span>
              <span className="text-xs font-normal text-slate-400">USD</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                        {item.product.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => changeQty(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-base font-extrabold text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      title="Remove item"
                      className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Promo Code</span>
            </h3>
            <form onSubmit={applyPromo} className="flex gap-3">
              <input
                type="text"
                placeholder="SAVE20 or FREESHIP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={checkingCode || !code.trim()}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {checkingCode ? "Validating..." : "Apply"}
              </button>
            </form>

            {coupon && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Promo applied: <strong>{coupon.description}</strong>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {couponErr && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {couponErr}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 lg:sticky lg:top-24 space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  ${tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Shipping</span>
                {isFreeShip ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
                    FREE
                  </span>
                ) : (
                  <span className="font-semibold text-slate-900">
                    ${shipping.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">
                  Total
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Secure 256-bit checkout</span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart}
        total={grandTotal}
        onSuccess={() => {
          updateCart([]);
          setCoupon(null);
        }}
      />
    </div>
  );
};

export default CartList;
