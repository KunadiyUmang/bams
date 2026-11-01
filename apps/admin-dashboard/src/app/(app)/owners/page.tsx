'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Plus,
  Search,
  KeyRound,
  Ban,
  CheckCircle,
  Building2,
  Trash2,
  Edit,
  Mail,
  Phone,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useLanguageStore } from '@/store/language.store';
import { User, UserRole, Language } from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function OwnersPage() {
  const { t } = useLanguageStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    users: owners,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    toggleStatus,
    resetPassword,
    deleteUser,
  } = useUsers({
    role: UserRole.BUSINESS_OWNER,
    status: statusFilter,
    search: searchTerm,
  });

  const { businesses } = useBusinesses();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLanguage, setFormLanguage] = useState<Language>(Language.GU);
  const [formBusinessId, setFormBusinessId] = useState('');
  const [resetPasswordInput, setResetPasswordInput] = useState('');

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'toggle' | 'delete';
    owner?: User;
  }>({ isOpen: false, type: 'toggle' });

  const resetForm = () => {
    setSelectedOwner(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormLanguage(Language.GU);
    setFormBusinessId(businesses[0]?.id || '');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (owner: User) => {
    setSelectedOwner(owner);
    setFormName(owner.name);
    setFormEmail(owner.email);
    setFormPhone(owner.phone || '');
    setFormLanguage(owner.languagePref || Language.GU);
    setFormBusinessId(owner.businessId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      if (selectedOwner) {
        await updateUser({
          id: selectedOwner.id,
          data: {
            name: formName,
            email: formEmail,
            phone: formPhone,
            languagePref: formLanguage,
            businessId: formBusinessId || undefined,
          },
        });
      } else {
        if (!formPassword.trim()) {
          toast.error('Initial temporary password is required');
          return;
        }
        await createUser({
          name: formName,
          email: formEmail,
          phone: formPhone,
          password: formPassword,
          role: UserRole.BUSINESS_OWNER,
          languagePref: formLanguage,
          businessId: formBusinessId || undefined,
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch {
      // handled
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;
    try {
      await resetPassword({
        id: selectedOwner.id,
        password: resetPasswordInput || undefined,
      });
      setIsResetModalOpen(false);
      setResetPasswordInput('');
    } catch {
      // handled
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState.owner) return;
    const owner = confirmState.owner;

    if (confirmState.type === 'toggle') {
      await toggleStatus({ id: owner.id, isActive: !owner.isActive });
    } else if (confirmState.type === 'delete') {
      await deleteUser(owner.id);
    }
    setConfirmState({ isOpen: false, type: 'toggle' });
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Owner',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#142B4A] dark:bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {u.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">{u.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => (
        <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
          {u.phone || '—'}
        </span>
      ),
    },
    {
      key: 'business',
      header: 'Assigned Business',
      render: (u) => {
        const bizName = u.business?.name || businesses.find((b) => b.id === u.businessId)?.name;
        return bizName ? (
          <Link
            href={`/businesses/${u.businessId}`}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{bizName}</span>
          </Link>
        ) : (
          <span className="text-slate-400 text-xs">Unassigned</span>
        );
      },
    },
    {
      key: 'languagePref',
      header: 'Language',
      render: (u) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {u.languagePref === Language.GU ? 'ગુજરાતી' : 'English'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <Badge variant={u.isActive ? 'success' : 'danger'} dot>
          {u.isActive ? 'Active' : 'Suspended'}
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
            {t('owners.title', 'Business Owners')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('owners.subtitle', 'Supervise business owner accounts and authorization credentials')}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
        >
          {t('owners.addOwner', 'Register Business Owner')}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === status
                ? 'bg-[#142B4A] text-white dark:bg-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {status === 'ALL' ? 'All Owners' : status === 'ACTIVE' ? 'Active' : 'Suspended'}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={owners}
        isLoading={isLoading}
        searchPlaceholder="Search owners by name, email, or phone..."
        onEdit={(o) => handleOpenEdit(o)}
        onDelete={(o) =>
          setConfirmState({
            isOpen: true,
            type: 'delete',
            owner: o,
          })
        }
        customActions={[
          {
            label: 'Reset Password',
            icon: <KeyRound className="w-4 h-4 text-amber-500" />,
            onClick: (o) => {
              setSelectedOwner(o);
              setResetPasswordInput('');
              setIsResetModalOpen(true);
            },
          },
          {
            label: 'Toggle Access',
            icon: <Ban className="w-4 h-4 text-rose-500" />,
            onClick: (o) =>
              setConfirmState({
                isOpen: true,
                type: 'toggle',
                owner: o,
              }),
          },
        ]}
      />

      {/* Register / Edit Owner Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedOwner ? `Edit ${selectedOwner.name}` : 'Register Business Owner'}
        subtitle="Manage personal identification, language preference, and business affiliation"
        size="md"
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
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isCreating || isUpdating}
              className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
            >
              {selectedOwner ? 'Save Changes' : 'Create Owner Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Ramesh Patel"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="ramesh@pateltrading.com"
              required
            />
            <Input
              label="Phone Number"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+91 98250 12345"
            />
          </div>

          {!selectedOwner && (
            <Input
              label="Temporary Password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Language Preference"
              value={formLanguage}
              onChange={(e) => setFormLanguage(e.target.value as Language)}
              options={[
                { value: Language.GU, label: 'ગુજરાતી (Gujarati)' },
                { value: Language.EN, label: 'English' },
              ]}
            />

            <Select
              label="Assigned Business"
              value={formBusinessId}
              onChange={(e) => setFormBusinessId(e.target.value)}
              options={businesses.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              placeholder="Select Business"
            />
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password for ${selectedOwner?.name}`}
        subtitle="Specify a temporary password or leave blank to send an automated reset code"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResetPasswordSubmit}
              className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
            >
              Confirm Password Reset
            </Button>
          </>
        }
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <Input
            label="New Temporary Password (Optional)"
            type="text"
            value={resetPasswordInput}
            onChange={(e) => setResetPasswordInput(e.target.value)}
            placeholder="Auto-generated if left blank"
          />
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'toggle' ? 'Change Account Status' : 'Delete Account'}
        message={
          confirmState.type === 'toggle'
            ? `Are you sure you want to ${
                confirmState.owner?.isActive ? 'suspend' : 'activate'
              } ${confirmState.owner?.name}?`
            : `Are you sure you want to permanently delete ${confirmState.owner?.name}?`
        }
        confirmText={confirmState.type === 'toggle' ? 'Update Status' : 'Delete'}
        variant={confirmState.type === 'delete' ? 'danger' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ isOpen: false, type: 'toggle' })}
      />
    </div>
  );
}
