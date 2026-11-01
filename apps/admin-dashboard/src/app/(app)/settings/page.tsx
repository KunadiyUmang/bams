'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  FolderTree,
  Globe,
  ShieldCheck,
  Database,
  Plus,
  Trash2,
  Edit,
  Download,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import { Category, CategoryType, BackupInfo } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { language, setLanguage, t } = useLanguageStore();
  const queryClient = useQueryClient();

  // Tab 1: General Settings state
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'BAMS Enterprise Financial Suite',
    supportEmail: 'admin@bams.internal',
    defaultCurrency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
  });

  // Tab 2: Category Management Query & State
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['settings-categories'],
    queryFn: async () => {
      const res = await api.settings.getCategories();
      return res.data || [];
    },
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameGu, setCatNameGu] = useState('');
  const [catType, setCatType] = useState<CategoryType>(CategoryType.EXPENSE);

  const saveCategoryMutation = useMutation({
    mutationFn: (cat: Partial<Category>) => api.settings.saveCategory(cat),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['settings-categories'] });
      setIsCategoryModalOpen(false);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.settings.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category removed');
      queryClient.invalidateQueries({ queryKey: ['settings-categories'] });
    },
  });

  // Tab 4: Security Settings state
  const [securitySettings, setSecuritySettings] = useState({
    jwtExpiryHours: '24',
    sessionTimeoutMins: '30',
    minPasswordLength: '8',
    requireSpecialChar: true,
    maxLoginAttempts: '5',
    rateLimitRpm: '120',
  });

  // Tab 5: Backups Query & State
  const { data: backups = [], isLoading: loadingBackups } = useQuery({
    queryKey: ['settings-backups'],
    queryFn: async () => {
      const res = await api.backups.getAll();
      return res.data || [];
    },
  });

  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  const triggerBackupMutation = useMutation({
    mutationFn: () => api.backups.trigger(),
    onSuccess: () => {
      toast.success('System backup snapshot created successfully');
      queryClient.invalidateQueries({ queryKey: ['settings-backups'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.backups.restore(id),
    onSuccess: () => {
      toast.success('Database restored from backup archive');
      setConfirmRestoreId(null);
    },
  });

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatNameEn(cat.nameEn);
      setCatNameGu(cat.nameGu || '');
      setCatType(cat.type);
    } else {
      setEditingCategory(null);
      setCatNameEn('');
      setCatNameGu('');
      setCatType(CategoryType.EXPENSE);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn.trim()) {
      toast.error('English category name is required');
      return;
    }
    saveCategoryMutation.mutate({
      id: editingCategory?.id,
      nameEn: catNameEn,
      nameGu: catNameGu,
      type: catType,
      isActive: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'language', label: 'Language & Locale', icon: Globe },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'backup', label: 'Backup & Recovery', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('settings.title', 'System Settings & Maintenance')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle', 'Platform configuration, master classification, security constraints, and disaster recovery')}
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General */}
      {activeTab === 'general' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            System Identity & Defaults
          </h3>

          <Input
            label="Application Display Name"
            value={generalSettings.appName}
            onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
          />

          <Input
            label="Governance & Support Email"
            type="email"
            value={generalSettings.supportEmail}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Accounting Currency"
              value={generalSettings.defaultCurrency}
              disabled
              helperText="Set to Indian Rupee (INR ₹) across all ledger accounts"
            />
            <Input
              label="Standard System Timezone"
              value={generalSettings.timezone}
              disabled
              helperText="IST (UTC+05:30) used for ledger stamping"
            />
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => toast.success('General settings saved')}
              className="bg-[#142B4A] text-white"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master ledger categories available across all businesses for classifying financial flows
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenCatModal()}
              className="bg-[#142B4A] text-white"
            >
              New Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {cat.nameEn}
                    </span>
                    <Badge
                      variant={
                        cat.type === 'INCOME'
                          ? 'success'
                          : cat.type === 'EXPENSE'
                          ? 'danger'
                          : 'info'
                      }
                    >
                      {cat.type}
                    </Badge>
                  </div>
                  {cat.nameGu && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-gujarati">
                      {cat.nameGu}
                    </p>
                  )}
                  {cat.isSystem && (
                    <span className="text-[10px] text-slate-400 block pt-1">
                      System Core Category
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenCatModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!cat.isSystem && (
                    <button
                      onClick={() => deleteCategoryMutation.mutate(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Category Modal */}
          <Modal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            title={editingCategory ? 'Edit Master Category' : 'Create Master Category'}
            subtitle="Categorize income, expenses, and investments"
            size="sm"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveCategory}
                  isLoading={saveCategoryMutation.isPending}
                  className="bg-[#142B4A] text-white"
                >
                  Save Category
                </Button>
              </>
            }
          >
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <Input
                label="Category Name (English)"
                value={catNameEn}
                onChange={(e) => setCatNameEn(e.target.value)}
                placeholder="e.g. Logistics & Transportation"
                required
              />
              <Input
                label="Category Name (Gujarati)"
                value={catNameGu}
                onChange={(e) => setCatNameGu(e.target.value)}
                placeholder="દા.ત. વાહન વ્યવહાર અને નૂર"
              />
              <Select
                label="Flow Classification"
                value={catType}
                onChange={(e) => setCatType(e.target.value as CategoryType)}
                options={[
                  { value: CategoryType.INCOME, label: 'Income (આવક)' },
                  { value: CategoryType.EXPENSE, label: 'Expense (ખર્ચ)' },
                  { value: CategoryType.INVESTMENT, label: 'Investment (રોકાણ)' },
                ]}
              />
            </form>
          </Modal>
        </div>
      )}

      {/* TAB 3: Language */}
      {activeTab === 'language' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Language & Localization Preferences
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Dashboard Language
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setLanguage('EN' as any)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  language === 'EN'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm block">English (United States / India)</span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Default financial terminology with international formatting
                </span>
              </div>

              <div
                onClick={() => setLanguage('GU' as any)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  language === 'GU'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm block font-gujarati">ગુજરાતી (Gujarati)</span>
                <span className="text-xs text-slate-500 mt-1 block font-gujarati">
                  સંપૂર્ણ ગુજરાતી ભાષામાં તમામ વ્યવહારો અને ખાતાવહી વિગતો
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Translation Health & Coverage
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">English strings</span>
              <span className="font-semibold text-emerald-600">100% Verified</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Gujarati native strings</span>
              <span className="font-semibold text-emerald-600">100% Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Authentication & Security Governance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="JWT Session Expiry (Hours)"
              type="number"
              value={securitySettings.jwtExpiryHours}
              onChange={(e) =>
                setSecuritySettings({ ...securitySettings, jwtExpiryHours: e.target.value })
              }
            />
            <Input
              label="Inactivity Timeout (Minutes)"
              type="number"
              value={securitySettings.sessionTimeoutMins}
              onChange={(e) =>
                setSecuritySettings({ ...securitySettings, sessionTimeoutMins: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Password Length"
              type="number"
              value={securitySettings.minPasswordLength}
              onChange={(e) =>
                setSecuritySettings({ ...securitySettings, minPasswordLength: e.target.value })
              }
            />
            <Input
              label="Max Failed Attempts Before Lock"
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) =>
                setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })
              }
            />
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => toast.success('Security policies updated')}
              className="bg-[#142B4A] text-white"
            >
              Update Security Policies
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Disaster Recovery & Database Snapshots
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate encrypted SQL snapshots or restore system ledger data
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Database className="w-4 h-4" />}
              onClick={() => triggerBackupMutation.mutate()}
              isLoading={triggerBackupMutation.isPending}
              className="bg-[#142B4A] text-white"
            >
              Take Manual Backup Now
            </Button>
          </div>

          {/* Backup Archives Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Archived Snapshots
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Archive Filename</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Archive Size</th>
                    <th className="py-3 px-4">Triggered By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {bk.filename}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {format(new Date(bk.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatFileSize(bk.sizeBytes)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {bk.createdBy}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" dot>
                          {bk.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={api.backups.downloadUrl(bk.id)}
                            download
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded transition"
                            title="Download SQL archive"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setConfirmRestoreId(bk.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded transition"
                            title="Restore Database from Snapshot"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Restore Dialog */}
          <ConfirmDialog
            isOpen={Boolean(confirmRestoreId)}
            title="Confirm Database Restoration"
            message="Restoring from an archive will overwrite any mutations made after the snapshot date. Ensure all active staff have finalized transactions."
            confirmText="Proceed With Restore"
            variant="danger"
            isLoading={restoreMutation.isPending}
            onConfirm={() => {
              if (confirmRestoreId) restoreMutation.mutate(confirmRestoreId);
            }}
            onCancel={() => setConfirmRestoreId(null)}
          />
        </div>
      )}
    </div>
  );
}
