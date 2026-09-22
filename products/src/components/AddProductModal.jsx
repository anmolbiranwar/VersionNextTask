import React, { useState } from 'react';
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { productSchema } from '../validation/productSchema';
import { addProduct } from '../api/axiosClient';

const CATEGORIES = [
  'Audio',
  'Peripherals',
  'Displays',
  'Accessories',
  'Wearables',
  'Gaming',
];

const INITIAL_FORM = {
  name: '',
  category: 'Audio',
  price: '',
  rating: 4.8,
  description: '',
  image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60',
};

const AddProductModal = ({ open, onClose, onCreated }) => {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validateField = async (name, value) => {
    try {
      await productSchema.validateAt(name, { ...values, [name]: value });
      setErrs((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      setErrs((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'price' || name === 'rating' ? (value === '' ? '' : Number(value)) : value;
    setValues((prev) => ({ ...prev, [name]: val }));

    if (touched[name]) {
      validateField(name, val);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTouched({
      name: true,
      category: true,
      price: true,
      rating: true,
      description: true,
      image: true,
    });

    try {
      const valid = await productSchema.validate(values, { abortEarly: false });
      const created = await addProduct(valid);
      onCreated(created);
      setValues(INITIAL_FORM);
      onClose();
    } catch (err) {
      if (err.inner) {
        const fieldErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            fieldErrors[error.path] = error.message;
          }
        });
        setErrs(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Add Product</h2>
              <p className="text-xs text-blue-100 mt-0.5">Enter product specifications</p>
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

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Mechanical Keyboard"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errs.name && touched.name
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errs.name && touched.name && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errs.name}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Price ($ USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="99.99"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errs.price && touched.price
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errs.price && touched.price && (
                <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errs.price}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Rating (1.0 to 5.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              name="rating"
              value={values.rating}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Product description and features..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errs.description && touched.description
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errs.description && touched.description && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errs.description}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="image"
              value={values.image}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errs.image && touched.image
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errs.image && touched.image && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errs.image}</span>
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
