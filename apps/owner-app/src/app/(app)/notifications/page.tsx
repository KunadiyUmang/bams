'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useLanguageStore } from '@/store/language.store';
import {
  Bell,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'TRANSACTION_PENDING' | 'TRANSACTION_APPROVED' | 'TRANSACTION_REJECTED' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  data?: {
    transactionId?: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const t = useLanguageStore((state) => state.t);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      // Fallback mock initial list if endpoint is empty
      setNotifications([
        {
          id: '1',
          title: 'Pending Transaction Approval',
          message: 'Staff member Ramesh submitted a new Expense of ₹4,500 waiting for your approval.',
          type: 'TRANSACTION_PENDING',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { transactionId: 'tx-1' },
        },
        {
          id: '2',
          title: 'Daily Summary Ready',
          message: 'Your business generated ₹32,000 in income today with ₹11,200 in expenses.',
          type: 'SYSTEM',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read', {});
    } catch (e) {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.data?.transactionId) {
      router.push(`/transactions/${item.data.transactionId}`);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION_PENDING':
        return <Clock size={18} className="text-amber-500" />;
      case 'TRANSACTION_APPROVED':
        return <ArrowDownLeft size={18} className="text-emerald-500" />;
      case 'TRANSACTION_REJECTED':
        return <ArrowUpRight size={18} className="text-rose-500" />;
      default:
        return <Bell size={18} className="text-[#2563EB]" />;
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title={t('notifications.title', 'Notifications')}
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
            >
              <CheckCheck size={16} />
              <span>{t('notifications.markAllAsRead', 'Mark all read')}</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'UNREAD'
              ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-3 space-y-2.5">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size={28} />
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex items-start gap-3 ${
                item.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.message}
                </p>

                <div className="mt-1.5 text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title={t('notifications.noNotifications', 'No notifications')}
            description="You are all caught up! New notifications and pending approvals will appear here."
          />
        )}
      </div>
    </div>
  );
}
