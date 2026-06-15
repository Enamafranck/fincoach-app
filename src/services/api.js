const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async getAuthToken() {
    const token = localStorage.getItem('auth_token')
    return token
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken()
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `Erreur ${response.status}`)
    }

    return response.json()
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new APIClient(API_BASE_URL)

// Transaction endpoints
export const transactionAPI = {
  getAll: () => apiClient.get('/transactions'),
  getById: (id) => apiClient.get(`/transactions/${id}`),
  create: (data) => apiClient.post('/transactions', data),
  update: (id, data) => apiClient.put(`/transactions/${id}`, data),
  delete: (id) => apiClient.delete(`/transactions/${id}`),
}

// Budget endpoints
export const budgetAPI = {
  getAll: () => apiClient.get('/budgets'),
  getById: (id) => apiClient.get(`/budgets/${id}`),
  create: (data) => apiClient.post('/budgets', data),
  update: (id, data) => apiClient.put(`/budgets/${id}`, data),
  delete: (id) => apiClient.delete(`/budgets/${id}`),
}

// Dashboard endpoints
export const dashboardAPI = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getAnalytics: (params) => apiClient.get('/dashboard/analytics', { query: params }),
}

export default apiClient
