// Shared and Admin-specific TypeScript types for BAMS Super Admin Dashboard

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
  openingBalance: string | number;
  currency: string;
  isActive: boolean;
  ownerId: string;
  owner?: User;
  employeeCount?: number;
  employees?: User[];
  totalIncome?: number;
  totalExpenses?: number;
  transactionCount?: number;
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
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
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
}

export interface BackupInfo {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  createdBy?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: 'GENERAL' | 'SECURITY' | 'PAYMENT' | 'NOTIFICATION';
  description?: string;
  updatedAt?: string;
}

// ─── API Request/Response Types ────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success?: boolean;
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

export interface CreateBusinessRequest {
  name: string;
  nameGu?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance?: number;
  currency?: string;
  ownerId: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  nameGu?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance?: number;
  currency?: string;
  isActive?: boolean;
  ownerId?: string;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  role: UserRole;
  businessId?: string;
  languagePref?: Language;
  employeeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  businessId?: string | null;
  languagePref?: Language;
  isActive?: boolean;
  password?: string;
  employeeId?: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  description?: string;
  descriptionGu?: string;
  category: string;
  categoryId?: string;
  paymentMethod: PaymentMethod;
  date: string;
  businessId: string;
  userId: string;
  notes?: string;
  referenceId?: string;
  receiptUrl?: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  businessId?: string;
  userId?: string;
  employeeId?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod | 'ALL';
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessFilters {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'SUSPENDED';
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: UserRole;
  businessId?: string;
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface AuditFilters {
  actorId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
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

export interface AdminDashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalOwners: number;
  totalEmployees: number;
  activeAccounts: number;
  suspendedAccounts: number;
  totalTransactions: number;
  systemIncome: number;
  systemExpenses: number;
  systemProfit: number;
  newThisMonth: number;
  recentActivity: AuditLog[];
  topBusinesses: BusinessStats[];
  recentUsers: User[];
  pendingApprovals: Transaction[];
  businessGrowth: MonthStats[];
  transactionVolume: DayStats[];
}

export interface ReportFilters {
  format?: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  businessId?: string;
  ownerId?: string;
  employeeId?: string;
  type?: TransactionType | 'ALL';
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
  businessBreakdown?: Array<{
    businessId: string;
    businessName: string;
    income: number;
    expenses: number;
    net: number;
    transactionCount: number;
  }>;
  employeeRankings?: Array<{
    userId: string;
    userName: string;
    businessName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  dayWiseSummary?: DayStats[];
}

// ─── Socket Events ─────────────────────────────────────────────────────────────

export interface SocketEvents {
  'transaction.created': { transaction: Transaction; businessId: string };
  'transaction.approved': { transactionId: string; transaction: Transaction };
  'transaction.rejected': { transactionId: string; reason: string };
  'notification.new': { notification: Notification };
  'audit.new': { log: AuditLog };
  'account.status_changed': { userId: string; isActive: boolean };
  'system.alert': { message: string; severity: 'INFO' | 'WARNING' | 'ERROR' };
}
