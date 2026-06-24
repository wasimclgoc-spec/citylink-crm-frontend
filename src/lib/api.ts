import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

// ── API Functions ──
export const authApi = {
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
  getMe: () => api.get('/auth/me'),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const customersApi = {
  list: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  summary: (id: string) => api.get(`/customers/${id}/summary`),
}

export const invoicesApi = {
  list: (params?: any) => api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  recordPayment: (id: string, data: any) => api.post(`/invoices/${id}/payment`, data),
}

export const followupsApi = {
  list: (params?: any) => api.get('/followups', { params }),
  today: () => api.get('/followups/today'),
  create: (data: any) => api.post('/followups', data),
  update: (id: string, data: any) => api.put(`/followups/${id}`, data),
}

export const whatsappApi = {
  send: (data: any) => api.post('/whatsapp/send', data),
  logs: () => api.get('/whatsapp/logs'),
  templates: () => api.get('/whatsapp/templates'),
}

export const emailApi = {
  send: (data: any) => api.post('/email/send', data),
  sendReminder: (invoiceId: string) => api.post(`/email/reminder/${invoiceId}`),
  logs: () => api.get('/email/logs'),
}

export const reportsApi = {
  outstanding: () => api.get('/reports/outstanding'),
  aging: () => api.get('/reports/aging'),
  collection: (params?: any) => api.get('/reports/collection', { params }),
  userPerformance: () => api.get('/reports/user-performance'),
  exportOutstanding: () => api.get('/reports/export/outstanding', { responseType: 'blob' }),
}

export const usersApi = {
  list: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggle: (id: string) => api.patch(`/users/${id}/toggle`),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
