'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Ban,
  Trash2,
  Edit,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useUsers } from '@/hooks/useUsers';
import { useLanguageStore } from '@/store/language.store';
import { Business, UserRole } from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function BusinessesPage() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    businesses,
    isLoading,
    createBusiness,
    isCreating,
    updateBusiness,
    isUpdating,
    toggleStatus,
    deleteBusiness,
  } = useBusinesses({
    status: statusFilter,
    search: searchTerm,
  });

  // Fetch owners for assigning
  const { users: owners } = useUsers({ role: UserRole.BUSINESS_OWNER });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNameGu, setFormNameGu] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState('0');
  const [formOwnerId, setFormOwnerId] = useState('');

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'delete';
    business?: Business;
  }>({ isOpen: false, type: 'suspend' });

  const resetForm = () => {
    setEditingBusiness(null);
    setFormName('');
    setFormNameGu('');
    setFormDescription('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormOpeningBalance('0');
    setFormOwnerId(owners[0]?.id || '');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (biz: Business) => {
    setEditingBusiness(biz);
    setFormName(biz.name);
    setFormNameGu(biz.nameGu || '');
    setFormDescription(biz.description || '');
    setFormPhone(biz.phone || '');
    setFormEmail(biz.email || '');
    setFormAddress(biz.address || '');
    setFormOpeningBalance(String(biz.openingBalance || '0'));
    setFormOwnerId(biz.ownerId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Business name is required');
      return;
    }

    try {
      if (editingBusiness) {
        await updateBusiness({
          id: editingBusiness.id,
          data: {
            name: formName,
            nameGu: formNameGu,
            description: formDescription,
            phone: formPhone,
            email: formEmail,
            address: formAddress,
            openingBalance: Number(formOpeningBalance) || 0,
            ownerId: formOwnerId || undefined,
          },
        });
      } else {
        await createBusiness({
          name: formName,
          nameGu: formNameGu,
          description: formDescription,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          openingBalance: Number(formOpeningBalance) || 0,
          ownerId: formOwnerId || (owners[0]?.id || 'owner-default'),
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch {
      // handled in mutation
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState.business) return;
    const biz = confirmState.business;

    if (confirmState.type === 'suspend') {
      await toggleStatus({ id: biz.id, isActive: false });
    } else if (confirmState.type === 'activate') {
      await toggleStatus({ id: biz.id, isActive: true });
    } else if (confirmState.type === 'delete') {
      await deleteBusiness(biz.id);
    }
    setConfirmState({ isOpen: false, type: 'suspend' });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Business>[] = [
    {
      key: 'name',
      header: 'Business Entity',
      sortable: true,
      render: (biz) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm shrink-0">
            {biz.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/businesses/${biz.id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
            >
              {biz.name}
            </Link>
            {biz.nameGu && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-gujarati">
                {biz.nameGu}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (biz) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200 block">
            {biz.owner?.name || 'Unassigned'}
          </span>
          <span className="text-xs text-slate-400 block">{biz.owner?.email || '—'}</span>
        </div>
      ),
    },
    {
      key: 'employeeCount',
      header: 'Staff',
      sortable: true,
      render: (biz) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          {biz.employeeCount || 0}
        </span>
      ),
    },
    {
      key: 'totalIncome',
      header: 'Income',
      sortable: true,
      render: (biz) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(biz.totalIncome)}
        </span>
      ),
    },
    {
      key: 'totalExpenses',
      header: 'Expenses',
      sortable: true,
      render: (biz) => (
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          {formatCurrency(biz.totalExpenses)}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (biz) => (
        <Badge variant={biz.isActive ? 'success' : 'danger'} dot>
          {biz.isActive
            ? t('businesses.active', 'Active')
            : t('businesses.suspended', 'Suspended')}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('businesses.title', 'Business Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('businesses.subtitle', 'Manage all registered businesses and ledger profiles')}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
          className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
        >
          {t('businesses.addBusiness', 'Register New Business')}
        </Button>
      </div>

      {/* Filter / Status bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === status
                ? 'bg-[#142B4A] text-white dark:bg-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            {status === 'ALL'
              ? t('businesses.all', 'All Entities')
              : status === 'ACTIVE'
              ? t('businesses.active', 'Active')
              : t('businesses.suspended', 'Suspended')}
          </button>
        ))}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={businesses}
        isLoading={isLoading}
        searchPlaceholder={t('businesses.searchPlaceholder', 'Search businesses...')}
        onView={(biz) => router.push(`/businesses/${biz.id}`)}
        onEdit={(biz) => handleOpenEditModal(biz)}
        onDelete={(biz) =>
          setConfirmState({
            isOpen: true,
            type: 'delete',
            business: biz,
          })
        }
        customActions={[
          {
            label: 'Suspend Business',
            icon: <Ban className="w-4 h-4 text-rose-500" />,
            show: (b) => b.isActive,
            onClick: (b) =>
              setConfirmState({
                isOpen: true,
                type: 'suspend',
                business: b,
              }),
          },
          {
            label: 'Activate Business',
            icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
            show: (b) => !b.isActive,
            onClick: (b) =>
              setConfirmState({
                isOpen: true,
                type: 'activate',
                business: b,
              }),
          },
        ]}
      />

      {/* Add / Edit Business Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={
          editingBusiness
            ? `Edit ${editingBusiness.name}`
            : t('businesses.addBusiness', 'Register New Business')
        }
        subtitle="Configure corporate identification, owner assignment, and initial ledger state"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isCreating || isUpdating}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isCreating || isUpdating}
              className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
            >
              {editingBusiness ? t('common.save', 'Save Changes') : t('businesses.addBusiness', 'Create Business')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('businesses.name', 'Business Name')}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Patel Trading Co."
              required
            />
            <Input
              label={t('businesses.nameGu', 'Gujarati Name')}
              value={formNameGu}
              onChange={(e) => setFormNameGu(e.target.value)}
              placeholder="દા.ત. પટેલ ટ્રેડિંગ કંપની"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('businesses.email', 'Business Email')}
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="info@business.com"
            />
            <Input
              label={t('businesses.phone', 'Contact Phone')}
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+91 98250 00000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('businesses.assignOwner', 'Assign Owner')}
              value={formOwnerId}
              onChange={(e) => setFormOwnerId(e.target.value)}
              options={owners.map((o) => ({
                value: o.id,
                label: `${o.name} (${o.email})`,
              }))}
              placeholder="Select registered owner"
            />
            <Input
              label={t('businesses.openingBalance', 'Opening Balance (₹)')}
              type="number"
              value={formOpeningBalance}
              onChange={(e) => setFormOpeningBalance(e.target.value)}
              placeholder="0"
            />
          </div>

          <Input
            label={t('businesses.address', 'Physical Address')}
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            placeholder="Street address, city, state, postal code"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('businesses.description', 'Description / Notes')}
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-750 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Brief details about trading activities, goods, or operational parameters..."
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === 'suspend'
            ? 'Suspend Business'
            : confirmState.type === 'activate'
            ? 'Activate Business'
            : 'Delete Business'
        }
        message={
          confirmState.type === 'suspend'
            ? t('businesses.suspendConfirm', 'Are you sure you want to suspend this business? Staff and owners will be blocked from transacting.')
            : confirmState.type === 'activate'
            ? t('businesses.activateConfirm', 'Are you sure you want to activate this business?')
            : t('businesses.deleteConfirm', 'Are you sure you want to delete this business? All associated records will be permanently removed.')
        }
        confirmText={
          confirmState.type === 'suspend'
            ? 'Suspend'
            : confirmState.type === 'activate'
            ? 'Activate'
            : 'Delete'
        }
        variant={confirmState.type === 'activate' ? 'info' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ isOpen: false, type: 'suspend' })}
      />
    </div>
  );
}
