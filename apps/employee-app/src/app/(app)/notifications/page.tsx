'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  XCircle,
  FileCheck,
  Info,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLanguageStore } from '@/store/language.store';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }

    if (n.data?.transactionId) {
      router.push(`/history/${n.data.transactionId}`);
    } else if (n.data?.reportId) {
      router.push('/reports');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'TRANSACTION_APPROVED':
        return <CheckCircle2 size={20} color="var(--color-success)" />;
      case 'TRANSACTION_REJECTED':
        return <XCircle size={20} color="var(--color-danger)" />;
      case 'REPORT_REVIEWED':
        return <FileCheck size={20} color="var(--color-secondary)" />;
      default:
        return <Info size={20} color="var(--color-primary)" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title={t('notifications.notifications') || 'Notifications'}
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        onBack={() => router.back()}
        rightAction={
          notifications.length > 0 && unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.775rem',
                color: 'var(--color-secondary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCheck size={16} />
              <span>{t('notifications.mark_all_read') || 'Mark All Read'}</span>
            </button>
          ) : undefined
        }
      />

      <div style={{ padding: '16px' }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '74px', width: '100%' }} />
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <EmptyState
            icon={<Bell size={36} />}
            title={t('notifications.no_notifications') || 'No notifications yet'}
            description={t('notifications.no_notifications_desc') || 'You will be notified when your transactions or reports receive an update.'}
          />
        )}

        {!isLoading && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map((n) => {
              let timeAgo = '';
              try {
                timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
              } catch {
                timeAgo = n.createdAt;
              }

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="bams-card"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    backgroundColor: n.read ? 'var(--bg-card)' : 'var(--color-secondary-light)',
                    borderColor: n.read ? 'var(--border-color)' : 'rgba(37, 99, 235, 0.3)',
                    position: 'relative',
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: n.read ? 600 : 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {timeAgo}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.35,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-secondary)',
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
