'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  Building2,
  Users,
  CheckCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useLanguageStore } from '@/store/language.store';
import { Notification } from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();
  const { businesses } = useBusinesses();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.notifications.getAll();
      return res.data || [];
    },
  });

  // Modal State
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [targetType, setTargetType] = useState<'ALL' | 'BUSINESS' | 'USER'>('ALL');
  const [targetId, setTargetId] = useState('');
  const [notifType, setNotifType] = useState('INFO');
  const [titleEn, setTitleEn] = useState('');
  const [titleGu, setTitleGu] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [messageGu, setMessageGu] = useState('');

  const sendMutation = useMutation({
    mutationFn: (payload: any) => api.notifications.send(payload),
    onSuccess: () => {
      toast.success('Broadcast notification dispatched');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsSendModalOpen(false);
      resetSendForm();
    },
    onError: () => {
      toast.error('Failed to dispatch notification');
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      toast.success('All marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const resetSendForm = () => {
    setTitleEn('');
    setTitleGu('');
    setMessageEn('');
    setMessageGu('');
    setTargetType('ALL');
    setTargetId('');
    setNotifType('INFO');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !messageEn.trim()) {
      toast.error('English title and message are required');
      return;
    }

    sendMutation.mutate({
      recipientType: targetType,
      targetId: targetId || undefined,
      type: notifType,
      titleEn,
      titleGu: titleGu || titleEn,
      messageEn,
      messageGu: messageGu || messageEn,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'WARNING':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'SYSTEM':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const columns: Column<Notification>[] = [
    {
      key: 'createdAt',
      header: 'Dispatched',
      sortable: true,
      render: (n) => (
        <span className="text-slate-500 font-mono text-xs whitespace-nowrap">
          {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Classification',
      render: (n) => (
        <div className="flex items-center gap-1.5 font-medium text-xs">
          {getTypeIcon(n.type)}
          <span>{n.type}</span>
        </div>
      ),
    },
    {
      key: 'titleEn',
      header: 'Notification Subject & Content',
      render: (n) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {n.titleEn}
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{n.messageEn}</p>
          {n.titleGu && (
            <p className="text-[11px] text-slate-400 font-gujarati line-clamp-1">
              {n.titleGu} — {n.messageGu}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'isRead',
      header: 'State',
      sortable: true,
      render: (n) => (
        <Badge variant={n.isRead ? 'neutral' : 'primary'} dot={!n.isRead}>
          {n.isRead ? 'Acknowledged' : 'Unread'}
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
            {t('notifications.title', 'System Broadcasts & Alerts')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('notifications.subtitle', 'Broadcast announcements, compliance warnings, and system alerts')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            Mark All Read
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => {
              resetSendForm();
              setIsSendModalOpen(true);
            }}
            className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
          >
            Dispatch Broadcast
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={notifications}
        isLoading={isLoading}
        searchPlaceholder="Search notifications by title or text..."
        onView={(n) => {
          if (!n.isRead) {
            api.notifications.markAsRead(n.id).then(() => {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
            });
          }
        }}
      />

      {/* Broadcast Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Dispatch System Notification"
        subtitle="Broadcast an immediate alert to users across the platform in English and Gujarati"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              isLoading={sendMutation.isPending}
              className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
            >
              Dispatch Broadcast Now
            </Button>
          </>
        }
      >
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Recipient Audience"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'All Users (Owners + Employees)' },
                { value: 'BUSINESS', label: 'Specific Business Entity' },
                { value: 'USER', label: 'Specific User Account' },
              ]}
            />

            <Select
              label="Notification Severity"
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              options={[
                { value: 'INFO', label: 'Information (General)' },
                { value: 'WARNING', label: 'Warning (Action Recommended)' },
                { value: 'ALERT', label: 'Alert (Urgent Attention)' },
                { value: 'SYSTEM', label: 'System (Maintenance/Policy)' },
              ]}
            />
          </div>

          {targetType === 'BUSINESS' && (
            <Select
              label="Target Business Entity"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              options={businesses.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              placeholder="Select Business"
              required
            />
          )}

          {targetType === 'USER' && (
            <Input
              label="Target User ID / Email"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="user-uuid-or-email"
              required
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Scheduled System Maintenance"
              required
            />
            <Input
              label="Title (Gujarati)"
              value={titleGu}
              onChange={(e) => setTitleGu(e.target.value)}
              placeholder="દા.ત. સિસ્ટમ મેન્ટેનન્સ નોટિસ"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Message Body (English) *
              </label>
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={4}
                className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-750 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter message details for English users..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Message Body (Gujarati)
              </label>
              <textarea
                value={messageGu}
                onChange={(e) => setMessageGu(e.target.value)}
                rows={4}
                className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-750 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-gujarati"
                placeholder="ગુજરાતી યુઝર્સ માટે સંદેશો દાખલ કરો..."
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
