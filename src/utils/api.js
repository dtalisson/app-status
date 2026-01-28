const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('userToken') || localStorage.getItem('adminToken');
};

const setAuthToken = (token) => {
  localStorage.setItem('userToken', token);
  // Manter compatibilidade
  localStorage.setItem('adminToken', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Erro na requisição';
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro de conexão com o servidor');
  }
};

// Auth
export const authAPI = {
  login: async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },
  verify: async () => {
    return await apiRequest('/auth/verify');
  },
  logout: () => {
    removeAuthToken();
  },
};

// Users
export const usersAPI = {
  getProfile: async () => {
    return await apiRequest('/users/me');
  },
  getPurchases: async () => {
    return await apiRequest('/users/me/purchases');
  },
};

// Products
export const productsAPI = {
  getAll: async () => await apiRequest('/products'),
  getAdmin: async () => await apiRequest('/products/admin'),
  getById: async (id) => await apiRequest(`/products/${id}`),
  create: async (product) => await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: async (id, product) => await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: async (id) => await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Plans
export const plansAPI = {
  getAll: async () => await apiRequest('/plans'),
  getByProduct: async (productId) => await apiRequest(`/plans/product/${productId}`),
  getById: async (id) => await apiRequest(`/plans/${id}`),
  create: async (plan) => await apiRequest('/plans', {
    method: 'POST',
    body: JSON.stringify(plan),
  }),
  update: async (id, plan) => await apiRequest(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  }),
  delete: async (id) => await apiRequest(`/plans/${id}`, {
    method: 'DELETE',
  }),
};

// Sales
export const salesAPI = {
  getAll: async () => await apiRequest('/sales'),
  getById: async (id) => await apiRequest(`/sales/${id}`),
  create: async (sale) => await apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
  getDashboardStats: async () => await apiRequest('/sales/stats/dashboard'),
};

// Admin
export const adminAPI = {
  check: async () => await apiRequest('/admin/check'),
  getStats: async () => await apiRequest('/admin/stats'),
  getUsers: async () => await apiRequest('/admin/users'),
  getSales: async () => await apiRequest('/admin/sales'),
};

// Upload
export const uploadAPI = {
  uploadProductImage: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/upload/product-image`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer upload da imagem');
    }
    
    return data;
  },
};

// Coupons
export const couponsAPI = {
  getAll: async () => {
    return apiRequest('/coupons/admin');
  },
  create: async (couponData) => {
    return apiRequest('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },
  update: async (id, couponData) => {
    return apiRequest(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  },
  delete: async (id) => {
    return apiRequest(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },
  validate: async (code) => {
    return apiRequest(`/coupons/validate/${code}`);
  },
};

// Checkout
export const checkoutAPI = {
  checkout: async (items, couponCode) => {
    return apiRequest('/checkout', {
      method: 'POST',
      body: JSON.stringify({ items, couponCode }),
    });
  },
};

// Stock
export const stockAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.product) params.append('product', filters.product);
    if (filters.plan) params.append('plan', filters.plan);
    if (filters.used !== undefined) params.append('used', filters.used);
    const query = params.toString();
    return apiRequest(`/stock${query ? `?${query}` : ''}`);
  },
  getStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.product) params.append('product', filters.product);
    if (filters.plan) params.append('plan', filters.plan);
    const query = params.toString();
    return apiRequest(`/stock/stats${query ? `?${query}` : ''}`);
  },
  add: async (keys, product, plan) => {
    return apiRequest('/stock', {
      method: 'POST',
      body: JSON.stringify({ keys, product, plan }),
    });
  },
  delete: async (id) => {
    return apiRequest(`/stock/${id}`, {
      method: 'DELETE',
    });
  },
  update: async (id, key) => {
    return apiRequest(`/stock/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ key }),
    });
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };


