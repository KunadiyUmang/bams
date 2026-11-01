'use client';

import React, { useState } from 'react';
import {
  Shield,
  Download,
  Filter,
  Eye,
  Clock,
  User as UserIcon,
  Layers,
  FileCode,
  Activity,
} from 'lucide-react';
import { useAudit } from '@/hooks/useAudit';
import { useLanguageStore } from '@/store/language.store';
import { AuditLog, AuditAction, AuditEntity } from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';

export default function AuditPage() {
  const { t } = useLanguageStore();

  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const { logs, isLoading, exportAudit } = useAudit({
    action: (actionFilter as AuditAction) || undefined,
    entity: (entityFilter as AuditEntity) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionBadgeVariant = (action: string): BadgeVariant => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'APPROVE':
        return 'success';
      case 'REJECT':
        return 'warning';
      case 'LOGIN':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
          {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (log) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
            {log.actor?.name || 'System'}
          </span>
          <span className="text-[11px] text-slate-400 block">
            {log.actor?.role || 'SYSTEM_DAEMON'}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (log) => (
        <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Entity / Target ID',
      render: (log) => (
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300 block text-xs">
            {log.entity}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block">
            ID: {log.entityId}
          </span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Source IP',
      render: (log) => (
        <span className="text-slate-500 font-mono text-xs">
          {log.ipAddress || '127.0.0.1'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('audit.title', 'System Audit Trail')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('audit.subtitle', 'Immutable security compliance logs & change history')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle View */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Timeline View
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportAudit}
          >
            Export Trail
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filters:</span>
        </div>

        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="APPROVE">APPROVE</option>
          <option value="REJECT">REJECT</option>
          <option value="EXPORT">EXPORT</option>
        </select>

        {/* Entity filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Entities</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="USER">USER</option>
          <option value="TRANSACTION">TRANSACTION</option>
          <option value="CATEGORY">CATEGORY</option>
          <option value="SESSION">SESSION</option>
        </select>

        {/* Date Inputs */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>

        {(actionFilter || entityFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setActionFilter('');
              setEntityFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main content: Table vs Timeline */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={logs}
          isLoading={isLoading}
          searchPlaceholder="Search audit events by actor, entity ID, or IP..."
          onView={(log) => setSelectedLog(log)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit records match filters.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Dot */}
                  <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {log.actor?.name || 'System Daemon'} ({log.actor?.role || 'SERVICE'})
                        </span>
                        <span className="text-slate-400 text-xs">applied to</span>
                        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {log.entity} #{log.entityId}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-4">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(log.createdAt), 'PPP p')}
                        </span>
                        <span>IP: {log.ipAddress || 'Internal'}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect Diff
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Detail Modal (Diff Viewer) */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Inspection"
        subtitle={`Event ID: ${selectedLog?.id}`}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setSelectedLog(null)}>
            Close
          </Button>
        }
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400">Action:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedLog.action}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Entity:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedLog.entity}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Actor:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedLog.actor?.name || 'System'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">IP Origin:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {selectedLog.ipAddress || 'Internal'}
                </p>
              </div>
            </div>

            {/* Before / After JSON Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before state */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  State Before Change
                </span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                  {selectedLog.beforeData
                    ? JSON.stringify(selectedLog.beforeData, null, 2)
                    : '// No prior state recorded'}
                </pre>
              </div>

              {/* After state */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  State After Change
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                  {selectedLog.afterData
                    ? JSON.stringify(selectedLog.afterData, null, 2)
                    : '// Record deleted or no mutation data'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
