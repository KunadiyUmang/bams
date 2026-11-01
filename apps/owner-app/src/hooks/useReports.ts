import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ReportFilters } from '@/types';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

export function useReportSummary(params: ReportFilters) {
  return useQuery({
    queryKey: ['reportSummary', params],
    queryFn: () => api.reports.getReportSummary(params),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

export function useDownloadReport() {
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: async ({ format, params }: { format: string; params: ReportFilters }) => {
      const blob = await api.reports.downloadReportBlob(format, params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format.toLowerCase();
      link.setAttribute(
        'download',
        `bams_report_${params.dateFrom || 'all'}_to_${params.dateTo || 'all'}.${ext}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success(t('reports.downloadSuccess', 'Report downloaded successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to generate report file');
      toast.error(msg);
    },
  });
}
