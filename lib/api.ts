import axios from "axios"



// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },

  logout: async () => {
    const response = await api.get("/auth/logout")
    return response.data
  },

  getMe: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}

// Account API
export const accountAPI = {
  getAccounts: async () => {
    const response = await api.get("/accounts")
    return response.data
  },

  getAccount: async (id: string) => {
    const response = await api.get(`/accounts/${id}`)
    return response.data
  },

  getAccountSummary: async () => {
    const response = await api.get("/accounts/summary")
    return response.data
  },
}

// Transaction API
export const transactionAPI = {
  getTransactions: async (params?: any) => {
    const response = await api.get("/transactions", { params })
    return response.data
  },

  getRecentTransactions: async (limit?: number) => {
    const response = await api.get("/transactions/recent", { params: { limit } })
    return response.data
  },

  getPendingTransactions: async () => {
    const response = await api.get("/transactions/pending")
    return response.data
  },

  transferMoney: async (transferData: any) => {
    const response = await api.post("/transactions/transfer", transferData)
    return response.data
  },
}

// Notification API
export const notificationAPI = {
  getNotifications: async (params?: any) => {
    const response = await api.get("/notifications", { params })
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all")
    return response.data
  },
}

// User API
export const userAPI = {
  updateProfile: async (profileData: any) => {
    const response = await api.put("/users/profile", profileData)
    return response.data
  },

  updatePassword: async (passwordData: any) => {
    const response = await api.put("/users/password", passwordData)
    return response.data
  },

  updateNotificationPreferences: async (preferencesData: any) => {
    const response = await api.put("/users/preferences", preferencesData)
    return response.data
  },
}

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
