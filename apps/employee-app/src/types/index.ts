export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'ACCOUNTANT';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentMethod = 'CASH' | 'ONLINE' | 'BANK' | 'CHEQUE' | 'UPI';

export type Language = 'en' | 'gu';

export type ThemeMode = 'light' | 'dark';

export interface Business {
  id: string;
  name: string;
  code?: string;
  currency?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  employeeId?: string;
  businessId?: string;
  business?: Business;
  avatarUrl?: string;
  language?: Language;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameGu?: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  businessId?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  category?: Category;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  customer?: string;
  attachmentUrl?: string;
  status: TransactionStatus;
  userId: string;
  user?: User;
  businessId: string;
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TRANSACTION_APPROVED' | 'TRANSACTION_REJECTED' | 'REPORT_REVIEWED' | 'GENERAL';
  read: boolean;
  data?: {
    transactionId?: string;
    reportId?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface DailyReport {
  id: string;
  date: string;
  summary: string;
  notes?: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED';
  userId: string;
  user?: User;
  businessId: string;
  submittedAt?: string;
  reviewedById?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  todayIncome: number;
  todayExpense: number;
  todayProfit: number;
  todayIncomeTrend?: number;
  todayExpenseTrend?: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyIncomeTrend?: number;
  monthlyExpenseTrend?: number;
  balance: number;
  pendingCount: number;
  chartData: {
    date: string;
    day: string;
    income: number;
    expense: number;
  }[];
  recentTransactions: Transaction[];
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  categoryId?: string;
  search?: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  customer?: string;
  attachmentUrl?: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  status?: TransactionStatus;
}

export interface DailyReportInput {
  date: string;
  summary: string;
  notes?: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

export interface ReportParams {
  type: 'daily' | 'monthly' | 'custom';
  format: 'pdf' | 'word' | 'excel' | 'csv';
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
}
