'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
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

export default function EmployeesPage() {
  const { t } = useLanguageStore();

  const [businessFilter, setBusinessFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    users: employees,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    toggleStatus,
    resetPassword,
    deleteUser,
  } = useUsers({
    role: UserRole.EMPLOYEE,
    businessId: businessFilter || undefined,
    status: statusFilter,
    search: searchTerm,
  });

  const { businesses } = useBusinesses();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
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
    employee?: User;
  }>({ isOpen: false, type: 'toggle' });

  const resetForm = () => {
    setSelectedEmployee(null);
    setFormName('');
    setFormEmployeeId('');
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

  const handleOpenEdit = (emp: User) => {
    setSelectedEmployee(emp);
    setFormName(emp.name);
    setFormEmployeeId(emp.employeeId || '');
    setFormEmail(emp.email);
    setFormPhone(emp.phone || '');
    setFormLanguage(emp.languagePref || Language.GU);
    setFormBusinessId(emp.businessId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!formBusinessId) {
      toast.error('Business assignment is mandatory for staff members');
      return;
    }

    try {
      if (selectedEmployee) {
        await updateUser({
          id: selectedEmployee.id,
          data: {
            name: formName,
            employeeId: formEmployeeId,
            email: formEmail,
            phone: formPhone,
            languagePref: formLanguage,
            businessId: formBusinessId,
          },
        });
      } else {
        if (!formPassword.trim()) {
          toast.error('Initial temporary password is required');
          return;
        }
        await createUser({
          name: formName,
          employeeId: formEmployeeId,
          email: formEmail,
          phone: formPhone,
          password: formPassword,
          role: UserRole.EMPLOYEE,
          languagePref: formLanguage,
          businessId: formBusinessId,
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
    if (!selectedEmployee) return;
    try {
      await resetPassword({
        id: selectedEmployee.id,
        password: resetPasswordInput || undefined,
      });
      setIsResetModalOpen(false);
      setResetPasswordInput('');
    } catch {
      // handled
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState.employee) return;
    const emp = confirmState.employee;

    if (confirmState.type === 'toggle') {
      await toggleStatus({ id: emp.id, isActive: !emp.isActive });
    } else if (confirmState.type === 'delete') {
      await deleteUser(emp.id);
    }
    setConfirmState({ isOpen: false, type: 'toggle' });
  };

  const columns: Column<User>[] = [
    {
      key: 'employeeId',
      header: 'Staff ID',
      sortable: true,
      render: (u) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {u.employeeId || '—'}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Employee Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
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
      key: 'business',
      header: 'Business',
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
          <span className="text-slate-400 text-xs">—</span>
        );
      },
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
      key: 'languagePref',
      header: 'Lang',
      render: (u) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {u.languagePref === Language.GU ? 'GU' : 'EN'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <Badge variant={u.isActive ? 'success' : 'danger'} dot>
          {u.isActive ? 'Active' : 'Inactive'}
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
            {t('employees.title', 'System Employees')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('employees.subtitle', 'Cross-business employee ledger and access permissions')}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
        >
          {t('employees.addEmployee', 'Register Employee')}
        </Button>
      </div>

      {/* Filter Row: Business Dropdown + Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter by Business:</span>
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Businesses</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#142B4A] text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchPlaceholder="Search employees by ID, name, or phone..."
        onEdit={(emp) => handleOpenEdit(emp)}
        onDelete={(emp) =>
          setConfirmState({
            isOpen: true,
            type: 'delete',
            employee: emp,
          })
        }
        customActions={[
          {
            label: 'Reset Password',
            icon: <KeyRound className="w-4 h-4 text-amber-500" />,
            onClick: (emp) => {
              setSelectedEmployee(emp);
              setResetPasswordInput('');
              setIsResetModalOpen(true);
            },
          },
          {
            label: 'Toggle Access',
            icon: <Ban className="w-4 h-4 text-rose-500" />,
            onClick: (emp) =>
              setConfirmState({
                isOpen: true,
                type: 'toggle',
                employee: emp,
              }),
          },
        ]}
      />

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedEmployee ? `Edit ${selectedEmployee.name}` : 'Register Employee'}
        subtitle="Provision an operating staff profile linked to a designated corporate entity"
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
              {selectedEmployee ? 'Save Changes' : 'Create Staff Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Suresh Parmar"
              required
            />
            <Input
              label="Staff / Employee ID"
              value={formEmployeeId}
              onChange={(e) => setFormEmployeeId(e.target.value)}
              placeholder="EMP-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="suresh@business.com"
              required
            />
            <Input
              label="Phone Number"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+91 94280 11223"
            />
          </div>

          <Select
            label="Assigned Business Entity"
            value={formBusinessId}
            onChange={(e) => setFormBusinessId(e.target.value)}
            options={businesses.map((b) => ({
              value: b.id,
              label: b.name,
            }))}
            placeholder="Select Employer Business"
            required
          />

          {!selectedEmployee && (
            <Input
              label="Initial Password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          )}

          <Select
            label="Language Preference"
            value={formLanguage}
            onChange={(e) => setFormLanguage(e.target.value as Language)}
            options={[
              { value: Language.GU, label: 'ગુજરાતી (Gujarati)' },
              { value: Language.EN, label: 'English' },
            ]}
          />
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password for ${selectedEmployee?.name}`}
        subtitle="Set a temporary password for this staff member"
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
              Confirm Reset
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
        title={confirmState.type === 'toggle' ? 'Change Employee Status' : 'Delete Account'}
        message={
          confirmState.type === 'toggle'
            ? `Are you sure you want to ${
                confirmState.employee?.isActive ? 'deactivate' : 'activate'
              } ${confirmState.employee?.name}?`
            : `Are you sure you want to permanently delete ${confirmState.employee?.name}?`
        }
        confirmText={confirmState.type === 'toggle' ? 'Update Status' : 'Delete'}
        variant={confirmState.type === 'delete' ? 'danger' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ isOpen: false, type: 'toggle' })}
      />
    </div>
  );
}
