import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AuditLog, AuditFilters } from '@/types';
import toast from 'react-hot-toast';

export const AUDIT_QUERY_KEY = ['audit-logs'];

export function useAudit(filters: AuditFilters = {}) {
  const query = useQuery({
    queryKey: [...AUDIT_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await api.audit.getAll(filters);
      return res.data;
    },
  });

  const exportAudit = async () => {
    try {
      toast.loading('Exporting audit trail...', { id: 'export-audit' });
      const blob = await api.audit.export(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Audit trail downloaded', { id: 'export-audit' });
    } catch {
      toast.error('Export failed', { id: 'export-audit' });
    }
  };

  return {
    ...query,
    logs: query.data?.data || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    exportAudit,
  };
}
