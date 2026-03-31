import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRexCases } from '../hooks/useRexCases';
import { useRexFilters } from '../hooks/useRexFilters';
import { RexSummaryCards } from '../components/returns-exchange/RexSummaryCards';
import { RexFiltersBar } from '../components/returns-exchange/RexFiltersBar';
import { RexTable } from '../components/returns-exchange/RexTable';
import { RexDetailsDrawer } from '../components/returns-exchange/RexDetailsDrawer';
import { RexCase } from '../types/rex';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

const translations = {
  ar: {
    title: 'المرتجعات والاستبدالات',
    subtitle: 'تابع حالات المرتجع والاستبدال، حالة الاسترداد، والخطوات التشغيلية لكل طلب',
    errorLoading: 'حدث خطأ في تحميل الحالات',
    retry: 'إعادة المحاولة',
  },
  en: {
    title: 'Returns & Exchanges',
    subtitle: 'Track return and exchange cases, refund status, and operational steps for each order',
    errorLoading: 'Error loading cases',
    retry: 'Retry',
  },
};

interface ReturnsArabicProps {
  language: 'ar' | 'en';
}

export function ReturnsArabic({ language }: ReturnsArabicProps) {
  const { profile } = useAuth();
  const { cases, loading, error, fetchCases } = useRexCases(profile?.store_id);
  const { filters, updateFilter } = useRexFilters();

  const [selectedCase, setSelectedCase] = useState<RexCase | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Apply filters
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        String(c.id).toLowerCase().includes(search) ||
        String(c.order_id).toLowerCase().includes(search) ||
        (c.order?.customer_name || '').toLowerCase().includes(search) ||
        (c.order?.customer_phone || '').includes(search);

      const matchesType = filters.type === 'all' || c.type === filters.type;
      const matchesStatus = filters.status === 'all' || c.status === filters.status;
      const matchesRefundStatus = filters.refund_status === 'all' || c.refund_status === filters.refund_status;

      let matchesDate = true;
      if (filters.date_range !== 'all' && c.created_at) {
        const caseDate = new Date(c.created_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filters.date_range === 'today') {
          matchesDate = caseDate >= startOfToday;
        } else if (filters.date_range === 'last_7_days') {
          const weekAgo = new Date(startOfToday);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = caseDate >= weekAgo;
        } else if (filters.date_range === 'this_month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = caseDate >= monthStart;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesRefundStatus && matchesDate;
    });
  }, [cases, filters]);

  const hasActiveFilters = filters.search !== '' || filters.type !== 'all' || filters.status !== 'all' || filters.refund_status !== 'all' || filters.date_range !== 'all';

  const handleRowClick = (c: RexCase) => {
    setSelectedCase(c);
    setIsDrawerOpen(true);
  };

  const handleActionSuccess = () => {
    fetchCases();
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {error ? (
        <div className="bg-card rounded-2xl border border-border flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-red-600 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCases} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.retry}
          </Button>
        </div>
      ) : (
        <>
          <RexSummaryCards cases={cases} language={language} />

          <RexFiltersBar
            filters={filters}
            updateFilter={updateFilter}
            language={language}
          />

          <RexTable
            cases={filteredCases}
            loading={loading}
            language={language}
            hasFilters={hasActiveFilters}
            onRowClick={handleRowClick}
          />
        </>
      )}

      {selectedCase && (
        <RexDetailsDrawer
          rexCase={selectedCase}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          language={language}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
