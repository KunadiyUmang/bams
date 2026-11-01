// Complete TypeScript definitions for BAMS Owner App

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  BANK = 'BANK',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
}

export enum Language {
  EN = 'EN',
  GU = 'GU',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  CSV = 'csv',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  name: string;
  phone?: string;
  profilePhoto?: string;
  languagePref: Language;
  isActive: boolean;
  businessId?: string;
  business?: Business;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  nameGu?: string;
  logo?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance: string | number;
  currency: string;
  isActive: boolean;
  ownerId: string;
  owner?: User;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string | number;
  description?: string;
  descriptionGu?: string;
  category: string;
  categoryId?: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  date: string;
  receiptUrl?: string;
  notes?: string;
  referenceId?: string;
  idempotencyKey?: string;
  userId: string;
  user?: User;
  businessId: string;
  business?: Business;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  originalAmount?: string | number;
  editedAt?: string;
  editedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameGu: string;
  type: TransactionType;
  businessId?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  titleEn: string;
  titleGu: string;
  messageEn: string;
  messageGu: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actor?: User;
  action: string;
  entity: string;
  entityId: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  user?: User;
  businessId: string;
  business?: Business;
  date: string;
  totalIncome: string | number;
  totalExpenses: string | number;
  totalInvestment: string | number;
  netProfit: string | number;
  transactionCount: number;
  status: ReportStatus;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DayStats {
  date: string;
  income: number;
  expenses: number;
  profit: number;
  count: number;
}

export interface MonthStats {
  month: string;
  year: number;
  income: number;
  expenses: number;
  count: number;
  businesses?: number;
}

export interface EmployeeStats {
  userId: string;
  name: string;
  employeeId?: string;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  netContribution?: number;
  isActive?: boolean;
}

export interface BusinessStats {
  businessId: string;
  name: string;
  totalIncome: number;
  totalExpenses: number;
  employeeCount: number;
  transactionCount: number;
}

export interface OwnerDashboardStats {
  todayIncome: number;
  todayExpenses: number;
  todayProfit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  openingBalance: number;
  totalInvestment: number;
  pendingApprovals: number;
  totalEmployees: number;
  activeEmployees: number;
  totalTransactions: number;
  last7Days: DayStats[];
  recentTransactions: Transaction[];
  pendingTransactions: Transaction[];
  topEmployees: EmployeeStats[];
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
  categoryId?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportFilters {
  format?: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  businessId?: string;
  type?: TransactionType;
  language?: Language;
}

export interface ReportSummary {
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  netProfit: number;
  closingBalance: number;
  transactionCount: number;
  dateFrom: string;
  dateTo: string;
  transactions?: Transaction[];
  dayWiseSummary?: DayStats[];
  categoryBreakdown?: { category: string; amount: number; percentage: number; type: TransactionType }[];
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  password: string;
  role?: UserRole;
  languagePref?: Language;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  isActive?: boolean;
  languagePref?: Language;
  password?: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  description?: string;
  category: string;
  categoryId?: string;
  paymentMethod: PaymentMethod;
  date: string;
  receiptUrl?: string;
  notes?: string;
  referenceId?: string;
  idempotencyKey?: string;
  userId?: string;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  amount?: number;
  description?: string;
  category?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  date?: string;
  receiptUrl?: string;
  notes?: string;
  referenceId?: string;
}

export interface SocketEvents {
  'transaction.created': { transaction: Transaction; businessId: string };
  'transaction.approved': { transactionId: string; transaction: Transaction };
  'transaction.rejected': { transactionId: string; reason: string };
  'notification.new': { notification: Notification };
  'report.submitted': { reportId: string; userId: string };
  'account.status_changed': { userId: string; isActive: boolean };
}
