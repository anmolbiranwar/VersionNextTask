import axios from 'axios';
import { PRODUCTS } from '../data/products';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 'mfe-token-products';
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Client'] = 'products-remote';
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const payload = {
      message: err.message || 'Network request failed',
      status: err.response?.status,
      data: err.response?.data,
    };
    return Promise.reject(payload);
  }
);

export const getProducts = async (cat = 'All', search = '') => {
  try {
    let endpoint = '/products?limit=30';
    if (cat && cat !== 'All') {
      endpoint = `/products/category/${encodeURIComponent(cat.toLowerCase())}`;
    } else if (search && search.trim()) {
      endpoint = `/products/search?q=${encodeURIComponent(search.trim())}`;
    }

    const res = await api.get(endpoint);
    if (res.data?.products?.length > 0) {
      return res.data.products.map((item) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General',
        rating: item.rating || 4.5,
        reviewsCount: item.stock || Math.floor(Math.random() * 80) + 10,
        description: item.description,
        image: item.thumbnail || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      }));
    }
    return PRODUCTS;
  } catch {
    return PRODUCTS;
  }
};

export const addProduct = async (data) => {
  try {
    const res = await api.post('/products/add', {
      title: data.name,
      price: data.price,
      category: data.category.toLowerCase(),
      description: data.description,
      thumbnail: data.image,
      rating: data.rating || 4.8,
    });

    return {
      id: res.data.id || Date.now(),
      name: res.data.title || data.name,
      price: Number(res.data.price || data.price),
      category: data.category,
      rating: Number(data.rating) || 4.8,
      reviewsCount: 1,
      description: res.data.description || data.description,
      image: res.data.thumbnail || data.image,
    };
  } catch {
    return {
      id: Date.now(),
      name: data.name,
      price: Number(data.price),
      category: data.category,
      rating: Number(data.rating) || 4.8,
      reviewsCount: 1,
      description: data.description,
      image: data.image,
    };
  }
};

export default api;
