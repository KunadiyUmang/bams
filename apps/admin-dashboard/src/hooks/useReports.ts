import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ReportFilters, ReportSummary, ReportFormat } from '@/types';
import toast from 'react-hot-toast';

export const REPORTS_QUERY_KEY = ['reports-summary'];

export function useReports(filters: ReportFilters = {}) {
  const query = useQuery({
    queryKey: [...REPORTS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await api.reports.getSummary(filters);
      return res.data;
    },
  });

  const downloadReport = async (format: ReportFormat) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} report...`, { id: 'report-gen' });
      const blob = await api.reports.generateFile({ ...filters, format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Report ready and downloaded', { id: 'report-gen' });
    } catch {
      toast.error('Failed to generate report file', { id: 'report-gen' });
    }
  };

  return {
    ...query,
    summary: query.data,
    downloadReport,
  };
}
