import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearAuth,
  isBrowser,
} from './auth';
import {
  User,
  Transaction,
  Category,
  Notification,
  DailyReport,
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  TransactionFilters,
  CreateTransactionInput,
  UpdateTransactionInput,
  DailyReportInput,
  ReportParams,
  TransactionType,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        clearAuth();
        if (isBrowser() && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<{ token: string; refreshToken?: string }>>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken: currentRefreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data.data;
        setToken(token);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        processQueue(null, token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (isBrowser() && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Service modules
export const api = {
  // Auth API
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>(
        '/api/auth/login',
        credentials
      );
      return res.data;
    },
    logout: async () => {
      try {
        await apiClient.post('/api/auth/logout');
      } finally {
        clearAuth();
      }
    },
    refreshToken: async (token: string) => {
      const res = await apiClient.post<ApiResponse<{ token: string; refreshToken?: string }>>(
        '/api/auth/refresh',
        { refreshToken: token }
      );
      return res.data;
    },
    forgotPassword: async (email: string) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', {
        email,
      });
      return res.data;
    },
    verifyOtp: async (data: { email: string; otp: string }) => {
      const res = await apiClient.post<ApiResponse<{ verified: boolean }>>('/api/auth/verify-otp', data);
      return res.data;
    },
    resetPassword: async (data: { email: string; otp: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', data);
      return res.data;
    },
    getMe: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/api/auth/me');
      return res.data;
    },
    updateMe: async (data: Partial<User>) => {
      const res = await apiClient.patch<ApiResponse<User>>('/api/auth/me', data);
      return res.data;
    },
  },

  // Transactions API
  transactions: {
    getTransactions: async (filters: TransactionFilters = {}) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
        '/api/transactions',
        { params: filters }
      );
      return res.data;
    },
    getTransaction: async (id: string) => {
      const res = await apiClient.get<ApiResponse<Transaction>>(`/api/transactions/${id}`);
      return res.data;
    },
    createTransaction: async (data: CreateTransactionInput) => {
      const res = await apiClient.post<ApiResponse<Transaction>>('/api/transactions', data);
      return res.data;
    },
    updateTransaction: async (id: string, data: UpdateTransactionInput) => {
      const res = await apiClient.patch<ApiResponse<Transaction>>(`/api/transactions/${id}`, data);
      return res.data;
    },
    deleteTransaction: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/api/transactions/${id}`);
      return res.data;
    },
    getStats: async (period?: 'today' | 'week' | 'month' | 'year') => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>('/api/transactions/stats', {
        params: { period },
      });
      return res.data;
    },
    getDashboard: async () => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>('/api/transactions/dashboard');
      return res.data;
    },
  },

  // Categories API
  categories: {
    getCategories: async (type?: TransactionType) => {
      const res = await apiClient.get<ApiResponse<Category[]>>('/api/categories', {
        params: type ? { type } : undefined,
      });
      return res.data;
    },
  },

  // Notifications API
  notifications: {
    getNotifications: async () => {
      const res = await apiClient.get<ApiResponse<Notification[]>>('/api/notifications');
      return res.data;
    },
    markAsRead: async (id: string) => {
      const res = await apiClient.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
      return res.data;
    },
    markAllRead: async () => {
      const res = await apiClient.post<ApiResponse<{ count: number }>>('/api/notifications/read-all');
      return res.data;
    },
  },

  // Reports API
  reports: {
    generateReport: async (params: ReportParams): Promise<Blob> => {
      const response = await apiClient.get('/api/reports/generate', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },
    getSummary: async (params: { startDate?: string; endDate?: string; type?: string }) => {
      const res = await apiClient.get<ApiResponse<{
        totalIncome: number;
        totalExpense: number;
        netProfit: number;
        balance: number;
        transactionCount: number;
      }>>('/api/reports/summary', { params });
      return res.data;
    },
  },

  // Daily Reports API
  dailyReports: {
    getDailyReports: async (params?: { page?: number; limit?: number }) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<DailyReport>>>('/api/daily-reports', {
        params,
      });
      return res.data;
    },
    getReport: async (id: string) => {
      const res = await apiClient.get<ApiResponse<DailyReport>>(`/api/daily-reports/${id}`);
      return res.data;
    },
    submitDailyReport: async (data: DailyReportInput) => {
      const res = await apiClient.post<ApiResponse<DailyReport>>('/api/daily-reports', data);
      return res.data;
    },
  },

  // Uploads API
  uploads: {
    uploadFile: async (file: File, type: string = 'receipt') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await apiClient.post<ApiResponse<{ url: string; filename?: string }>>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.data;
    },
  },
};

export default api;
