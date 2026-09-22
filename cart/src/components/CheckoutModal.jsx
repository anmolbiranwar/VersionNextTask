import React, { useState } from 'react';
import { CreditCard, Zap, Banknote, CheckCircle2, X, Loader2, ShieldCheck } from 'lucide-react';
import { checkoutSchema } from '../validation/checkoutSchema';
import { placeOrder } from '../api/axiosClient';

const INITIAL_STATE = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  paymentMethod: 'card',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  upiId: '',
  termsAccepted: false,
};

const CheckoutModal = ({ open, onClose, items, total, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errs, setErrs] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!open) return null;

  const validateField = async (name, val) => {
    try {
      await checkoutSchema.validateAt(name, { ...form, [name]: val });
      setErrs((prev) => ({ ...prev, [name]: undefined }));
    } catch (e) {
      setErrs((prev) => ({ ...prev, [name]: e.message }));
    }
  };

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));

    if (touched[name]) {
      validateField(name, val);
    }
  };

  const onBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, val);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const markAll = Object.keys(form).reduce((acc, k) => {
      acc[k] = true;
      return acc;
    }, {});
    setTouched(markAll);

    try {
      const valid = await checkoutSchema.validate(form, { abortEarly: false });
      const orderRes = await placeOrder({
        customer: valid,
        items,
        totalAmount: total,
      });

      setReceipt(orderRes);
      onSuccess();
    } catch (e) {
      if (e.inner) {
        const fieldErrors = {};
        e.inner.forEach((error) => {
          if (error.path) {
            fieldErrors[error.path] = error.message;
          }
        });
        setErrs(fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Order Confirmed!
          </h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            We received your order and are preparing it for shipment.
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 mb-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Order ID
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {receipt.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total</span>
              <span className="font-extrabold text-slate-900">
                ${receipt.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Estimated Delivery</span>
              <span className="font-semibold text-emerald-600">
                {receipt.estimatedDelivery}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Recipient</span>
              <span className="font-medium text-slate-800">
                {receipt.customer.fullName}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Destination</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">
                {receipt.customer.city}, {receipt.customer.state}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Checkout</h2>
              <p className="text-xs text-purple-100 mt-0.5">Enter delivery and payment details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="John Doe"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.fullName && touched.fullName
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.fullName && touched.fullName && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="john@example.com"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.email && touched.email
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.email && touched.email && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="1234567890"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.phone && touched.phone
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.phone && touched.phone && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="123 Main Street"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.address && touched.address
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.address && touched.address && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.address}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="New York"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.city && touched.city
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.city && touched.city && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="NY"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.state && touched.state
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.state && touched.state && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.state}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ZIP / Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="10001"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.zipCode && touched.zipCode
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.zipCode && touched.zipCode && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'card' }))}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  form.paymentMethod === 'card'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'upi' }))}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  form.paymentMethod === 'upi'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-xs">UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  form.paymentMethod === 'cod'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
              </button>
            </div>

            {form.paymentMethod === 'card' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number (16 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="16"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={updateField}
                    onBlur={onBlur}
                    placeholder="4532890123456789"
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                      errs.cardNumber && touched.cardNumber
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                        : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                    }`}
                  />
                  {errs.cardNumber && touched.cardNumber && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errs.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry (MM/YY) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength="5"
                      name="cardExpiry"
                      value={form.cardExpiry}
                      onChange={updateField}
                      onBlur={onBlur}
                      placeholder="12/28"
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                        errs.cardExpiry && touched.cardExpiry
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                      }`}
                    />
                    {errs.cardExpiry && touched.cardExpiry && (
                      <p className="text-xs text-red-500 font-medium mt-1">{errs.cardExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength="4"
                      name="cardCvv"
                      value={form.cardCvv}
                      onChange={updateField}
                      onBlur={onBlur}
                      placeholder="123"
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                        errs.cardCvv && touched.cardCvv
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                      }`}
                    />
                    {errs.cardCvv && touched.cardCvv && (
                      <p className="text-xs text-red-500 font-medium mt-1">{errs.cardCvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {form.paymentMethod === 'upi' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={form.upiId}
                  onChange={updateField}
                  onBlur={onBlur}
                  placeholder="username@bank"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errs.upiId && touched.upiId
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {errs.upiId && touched.upiId && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errs.upiId}</p>
                )}
              </div>
            )}

            {form.paymentMethod === 'cod' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Pay in cash or card upon delivery.</span>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={form.termsAccepted}
                onChange={updateField}
                onBlur={onBlur}
                className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-normal">
                I agree to the terms and authorize payment of <strong>${total.toFixed(2)}</strong>.
              </span>
            </label>
            {errs.termsAccepted && touched.termsAccepted && (
              <p className="text-xs text-red-500 font-medium mt-1">{errs.termsAccepted}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total</span>
              <span className="text-xl font-extrabold text-slate-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
