import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  User,
  Business,
  Transaction,
  Category,
  Notification,
  TransactionFilters,
  ReportFilters,
  ReportSummary,
  OwnerDashboardStats,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bams_owner_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh or 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
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

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('bams_owner_refresh') : null;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        if (typeof window !== 'undefined') {
          localStorage.setItem('bams_owner_token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('bams_owner_refresh', newRefreshToken);
          }
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bams_owner_token');
          localStorage.removeItem('bams_owner_refresh');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // ─── Auth Endpoints ──────────────────────────────────────────────────────────
  auth: {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      return response.data.data;
    },
    getMe: async (): Promise<User> => {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    },
    forgotPassword: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
      return response.data.data;
    },
    resetPassword: async (data: { token: string; password: string }): Promise<{ message: string }> => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
      return response.data.data;
    },
    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
      return response.data.data;
    },
    logout: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Silent catch for logout
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bams_owner_token');
          localStorage.removeItem('bams_owner_refresh');
        }
      }
    },
  },

  // ─── Dashboard Endpoints ─────────────────────────────────────────────────────
  dashboard: {
    getStats: async (): Promise<OwnerDashboardStats> => {
      const response = await apiClient.get<ApiResponse<OwnerDashboardStats>>('/dashboard/owner');
      return response.data.data;
    },
  },

  // ─── Employee Management Endpoints ───────────────────────────────────────────
  employees: {
    getEmployees: async (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
      const response = await apiClient.get<PaginatedResponse<User>>('/employees', { params });
      return response.data;
    },
    getEmployee: async (id: string): Promise<User> => {
      const response = await apiClient.get<ApiResponse<User>>(`/employees/${id}`);
      return response.data.data;
    },
    createEmployee: async (data: CreateEmployeeRequest): Promise<User> => {
      const response = await apiClient.post<ApiResponse<User>>('/employees', data);
      return response.data.data;
    },
    updateEmployee: async (id: string, data: UpdateEmployeeRequest): Promise<User> => {
      const response = await apiClient.patch<ApiResponse<User>>(`/employees/${id}`, data);
      return response.data.data;
    },
    toggleEmployeeActive: async (id: string, isActive: boolean): Promise<User> => {
      const response = await apiClient.patch<ApiResponse<User>>(`/employees/${id}/status`, { isActive });
      return response.data.data;
    },
    getEmployeeStats: async (id: string, period?: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/employees/${id}/stats`, { params: { period } });
      return response.data.data;
    },
  },

  // ─── Approvals Endpoints ─────────────────────────────────────────────────────
  approvals: {
    getPendingApprovals: async (params?: { page?: number; limit?: number; userId?: string }): Promise<PaginatedResponse<Transaction>> => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions/pending', { params });
      return response.data;
    },
    approveTransaction: async (id: string): Promise<Transaction> => {
      const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/approve`);
      return response.data.data;
    },
    rejectTransaction: async (id: string, reason: string): Promise<Transaction> => {
      const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/reject`, { reason });
      return response.data.data;
    },
    bulkApprove: async (ids: string[]): Promise<{ count: number }> => {
      const response = await apiClient.post<ApiResponse<{ count: number }>>('/transactions/bulk-approve', { ids });
      return response.data.data;
    },
    getApprovalHistory: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions/history', { params });
      return response.data;
    },
  },

  // ─── Business Settings Endpoints ─────────────────────────────────────────────
  businesses: {
    getMyBusiness: async (): Promise<Business> => {
      const response = await apiClient.get<ApiResponse<Business>>('/businesses/me');
      return response.data.data;
    },
    updateBusiness: async (data: Partial<Business>): Promise<Business> => {
      const response = await apiClient.patch<ApiResponse<Business>>('/businesses/me', data);
      return response.data.data;
    },
    uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<ApiResponse<{ logoUrl: string }>>('/businesses/me/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    getBusinessStats: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/businesses/me/stats');
      return response.data.data;
    },
  },

  // ─── Transactions Endpoints ──────────────────────────────────────────────────
  transactions: {
    getTransactions: async (filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params: filters });
      return response.data;
    },
    getTransaction: async (id: string): Promise<Transaction> => {
      const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      return response.data.data;
    },
    createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
      const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', data);
      return response.data.data;
    },
    updateTransaction: async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
      const response = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}`, data);
      return response.data.data;
    },
    deleteTransaction: async (id: string): Promise<void> => {
      await apiClient.delete(`/transactions/${id}`);
    },
  },

  // ─── Reports Endpoints ───────────────────────────────────────────────────────
  reports: {
    getReportSummary: async (params: ReportFilters): Promise<ReportSummary> => {
      const response = await apiClient.get<ApiResponse<ReportSummary>>('/reports/summary', { params });
      return response.data.data;
    },
    generateReport: async (params: ReportFilters): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/reports/generate', params);
      return response.data.data;
    },
    getReportsList: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<PaginatedResponse<any>>('/reports', { params });
      return response.data;
    },
    downloadReportBlob: async (format: string, params: ReportFilters): Promise<Blob> => {
      const response = await apiClient.get(`/reports/export/${format}`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // ─── Category Endpoints ──────────────────────────────────────────────────────
  categories: {
    getCategories: async (params?: { type?: string }): Promise<Category[]> => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories', { params });
      return response.data.data;
    },
    createCategory: async (data: Partial<Category>): Promise<Category> => {
      const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
      return response.data.data;
    },
    updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
      const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
      return response.data.data;
    },
    deleteCategory: async (id: string): Promise<void> => {
      await apiClient.delete(`/categories/${id}`);
    },
  },

  // ─── Notifications Endpoints ─────────────────────────────────────────────────
  notifications: {
    getNotifications: async (): Promise<Notification[]> => {
      const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
      return response.data.data;
    },
    markAsRead: async (id: string): Promise<void> => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    markAllAsRead: async (): Promise<void> => {
      await apiClient.post('/notifications/read-all');
    },
  },

  // ─── Uploads Endpoints ───────────────────────────────────────────────────────
  upload: {
    uploadReceipt: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<ApiResponse<{ url: string }>>('/upload/receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  },
};

export default api;
