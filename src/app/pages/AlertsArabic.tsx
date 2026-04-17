import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../components/ui/accordion';
import { AlertCard } from '../components/AlertCard';
import { SummaryShimmer, AlertsListShimmer } from '../components/AlertShimmer';
import { useAlerts } from '../context/AlertContext';
import { AlertCategory } from '../types/alerts';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const translations = {
  ar: {
    alerts: 'نظام التنبيهات',
    description: 'رؤى وتوصيات ذكية لمتجرك',
    risks: 'المخاطر',
    opportunities: 'الفرص',
    info: 'المعلومات',
    type: 'النوع',
    category: 'الفئة',
    date: 'التاريخ',
    status: 'الحالة',
    allTypes: 'كل الأنواع',
    allCategories: 'كل الفئات',
    allStatuses: 'كل الحالات',
    read: 'مقروء',
    unread: 'غير مقروء',
    products: 'المنتجات',
    customers: 'العملاء',
    orders: 'الطلبات',
    emptyState: 'كل شيء على ما يرام. لم يتم اكتشاف أي مشاكل.',
    loading: 'جاري تحميل التنبيهات...',
  },
  en: {
    alerts: 'Alerts System',
    description: 'Smart insights and recommendations for your store',
    risks: 'Risks',
    opportunities: 'Opportunities',
    info: 'Info',
    type: 'Type',
    category: 'Category',
    date: 'Date',
    status: 'Status',
    allTypes: 'All Types',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    read: 'Read',
    unread: 'Unread',
    products: 'Products',
    customers: 'Customers',
    orders: 'Orders',
    emptyState: 'All good. No issues detected.',
    loading: 'Loading alerts...',
  }
};

interface AlertsArabicProps {
  language?: 'ar' | 'en';
}

export default function AlertsArabic({ language = 'ar' }: AlertsArabicProps) {
  const isRTL = language === 'ar';
  const t = translations[language];
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('id');

  const { alerts, loading, hasMore, loadMore, summary } = useAlerts();

  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    date: undefined as Date | undefined,
    status: 'all'
  });

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.type !== 'all' && alert.type !== filters.type) return false;
      if (filters.category !== 'all' && alert.category !== filters.category) return false;
      if (filters.status !== 'all') {
        const isRead = filters.status === 'read';
        if (alert.is_read !== isRead) return false;
      }
      return true;
    });
  }, [alerts, filters]);

  const groupedAlerts = useMemo(() => {
    const groups: Record<AlertCategory, typeof alerts> = {
      products: [],
      customers: [],
      orders: []
    };
    filteredAlerts.forEach(alert => {
      groups[alert.category].push(alert);
    });
    return groups;
  }, [filteredAlerts]);

  // Categories with risks open by default
  const defaultOpenCategories = useMemo(() => {
    return (Object.keys(groupedAlerts) as AlertCategory[]).filter(cat => 
      groupedAlerts[cat].some(alert => alert.type === 'risk')
    );
  }, [groupedAlerts]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-10 space-y-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.alerts}</h1>
        <p className="text-muted-foreground mt-2">{t.description}</p>
      </div>

      {/* 1. SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border-b-4 border-red-500 shadow-sm transition-all hover:shadow-md">
          <p className="text-sm font-medium text-muted-foreground mb-2">{t.risks}</p>
          <h2 className="text-4xl font-black text-red-600">
            {isRTL ? summary.risk.toLocaleString('ar-EG') : summary.risk}
          </h2>
        </div>
        <div className="bg-card p-6 rounded-2xl border-b-4 border-green-500 shadow-sm transition-all hover:shadow-md">
          <p className="text-sm font-medium text-muted-foreground mb-2">{t.opportunities}</p>
          <h2 className="text-4xl font-black text-green-600">
            {isRTL ? summary.opportunity.toLocaleString('ar-EG') : summary.opportunity}
          </h2>
        </div>
        <div className="bg-card p-6 rounded-2xl border-b-4 border-gray-500 shadow-sm transition-all hover:shadow-md">
          <p className="text-sm font-medium text-muted-foreground mb-2">{t.info}</p>
          <h2 className="text-4xl font-black text-gray-600">
            {isRTL ? summary.info.toLocaleString('ar-EG') : summary.info}
          </h2>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-wrap gap-4 items-center sticky top-20 z-10">
        <div className="flex items-center gap-2 text-muted-foreground px-2">
          <Filter className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-[160px]">
          <Select value={filters.type} onValueChange={(val) => setFilters({...filters, type: val})}>
            <SelectTrigger className="rounded-xl border-border bg-background">
              <SelectValue placeholder={t.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allTypes}</SelectItem>
              <SelectItem value="risk">{t.risks}</SelectItem>
              <SelectItem value="opportunity">{t.opportunities}</SelectItem>
              <SelectItem value="info">{t.info}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Select value={filters.category} onValueChange={(val) => setFilters({...filters, category: val})}>
            <SelectTrigger className="rounded-xl border-border bg-background">
              <SelectValue placeholder={t.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="products">{t.products}</SelectItem>
              <SelectItem value="customers">{t.customers}</SelectItem>
              <SelectItem value="orders">{t.orders}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-right font-normal rounded-xl border-border bg-background", !filters.date && "text-muted-foreground")}>
                <CalendarIcon className="ml-2 h-4 w-4" />
                {filters.date ? format(filters.date, "PPP", { locale: isRTL ? ar : enUS }) : t.date}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-border">
              <Calendar mode="single" selected={filters.date} onSelect={(val) => setFilters({...filters, date: val})} initialFocus locale={isRTL ? ar : enUS} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
            <SelectTrigger className="rounded-xl border-border bg-background">
              <SelectValue placeholder={t.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="read">{t.read}</SelectItem>
              <SelectItem value="unread">{t.unread}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. ACCORDION ALERTS LIST */}
      <div className="space-y-12">
        {filteredAlerts.length > 0 ? (
          <Accordion type="multiple" defaultValue={defaultOpenCategories} className="space-y-8">
            {(Object.keys(groupedAlerts) as AlertCategory[]).map(category => (
              groupedAlerts[category].length > 0 && (
                <AccordionItem key={category} value={category} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0 mb-6">
                    <div className="flex items-center gap-3 border-r-4 border-primary pr-4">
                      <h3 className="text-2xl font-black text-foreground">
                        {t[category]} 
                        <span className="mr-3 text-muted-foreground font-medium text-xl">
                          ({isRTL ? groupedAlerts[category].length.toLocaleString('ar-EG') : groupedAlerts[category].length})
                        </span>
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="overflow-visible">
                    <div className="grid grid-cols-1 gap-6 pt-2 pb-8">
                      {groupedAlerts[category].map(alert => (
                        <AlertCard 
                          key={alert.id} 
                          alert={alert} 
                          language={language} 
                          isHighlighted={highlightedId === alert.id}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            ))}
          </Accordion>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-3xl border border-dashed border-border">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{t.emptyState}</h3>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={lastElementRef} className="h-10 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">{t.loading}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
