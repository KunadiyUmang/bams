// Shared TypeScript types for BAMS platform

// ─── Enums ────────────────────────────────────────────────────────────────────

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

// ─── Core Entities ─────────────────────────────────────────────────────────────

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
  openingBalance: string; // Decimal as string
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
  amount: string; // Decimal as string
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
  originalAmount?: string;
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
  totalIncome: string;
  totalExpenses: string;
  totalInvestment: string;
  netProfit: string;
  transactionCount: number;
  status: ReportStatus;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

// ─── API Request/Response Types ────────────────────────────────────────────────

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

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  businessId?: string;
  languagePref?: Language;
}

export interface CreateBusinessRequest {
  name: string;
  nameGu?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance?: number;
  ownerId: string;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────────

export interface EmployeeDashboardStats {
  todayIncome: number;
  todayExpenses: number;
  todayProfit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  currentBalance: number;
  openingBalance: number;
  pendingTransactions: number;
  totalTransactions: number;
  last7Days: DayStats[];
  recentTransactions: Transaction[];
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

export interface AdminDashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalOwners: number;
  totalEmployees: number;
  activeAccounts: number;
  totalTransactions: number;
  systemIncome: number;
  systemExpenses: number;
  systemProfit: number;
  newThisMonth: number;
  recentActivity: AuditLog[];
  topBusinesses: BusinessStats[];
  businessGrowth: MonthStats[];
  transactionVolume: DayStats[];
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
}

export interface BusinessStats {
  businessId: string;
  name: string;
  totalIncome: number;
  totalExpenses: number;
  employeeCount: number;
  transactionCount: number;
}

// ─── Report Types ──────────────────────────────────────────────────────────────

export interface ReportFilters {
  format: ReportFormat;
  dateFrom: string;
  dateTo: string;
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
  transactions: Transaction[];
  dayWiseSummary: DayStats[];
}

// ─── Socket Events ─────────────────────────────────────────────────────────────

export interface SocketEvents {
  'transaction.created': { transaction: Transaction; businessId: string };
  'transaction.approved': { transactionId: string; transaction: Transaction };
  'transaction.rejected': { transactionId: string; reason: string };
  'notification.new': { notification: Notification };
  'report.submitted': { reportId: string; userId: string };
  'account.status_changed': { userId: string; isActive: boolean };
}
