import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 'mfe-token-cart';
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Client'] = 'cart-remote';
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

export const placeOrder = async (orderPayload) => {
  try {
    const res = await api.post('/carts/add', {
      userId: 1,
      products: orderPayload.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      })),
    });

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const eta = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'short', day: 'numeric' }
    );

    return {
      success: true,
      orderId,
      externalId: res.data?.id || 1,
      totalAmount: orderPayload.totalAmount,
      customer: orderPayload.customer,
      itemsCount: orderPayload.items.reduce((sum, item) => sum + item.quantity, 0),
      estimatedDelivery: eta,
      timestamp: new Date().toISOString(),
    };
  } catch {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const eta = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'short', day: 'numeric' }
    );

    return {
      success: true,
      orderId,
      totalAmount: orderPayload.totalAmount,
      customer: orderPayload.customer,
      itemsCount: orderPayload.items.reduce((sum, item) => sum + item.quantity, 0),
      estimatedDelivery: eta,
      timestamp: new Date().toISOString(),
    };
  }
};

export const checkPromo = async (code) => {
  const norm = code.trim().toUpperCase();
  const promos = {
    SAVE20: { discountPercent: 20, description: '20% off total order' },
    NEXT10: { discountPercent: 10, description: '10% off total order' },
    FREESHIP: { freeShipping: true, description: 'Free shipping on order' },
  };

  try {
    await api.get('/http/200');
  } catch {
  }

  if (promos[norm]) {
    return { valid: true, ...promos[norm] };
  }
  return { valid: false, message: 'Invalid coupon code' };
};

export default api;
