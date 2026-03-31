import { useState, useEffect, useCallback } from 'react';
import { Calendar, Eye, Loader2, AlertCircle, Users, Percent, TrendingUp, Package } from 'lucide-react';
import { StatCardArabic } from '../components/StatCardArabic';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { DashboardService, DashboardMetrics } from '../services/dashboard';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    description: 'راقب أداء متجرك',
    today: 'اليوم',
    last7: 'آخر 7 أيام',
    last30: 'آخر 30 يوم',
    thisMonth: 'هذا الشهر',
    custom: 'فترة مخصصة',
    revenue: 'إجمالي المبيعات',
    deliveredOrders: 'الطلبات المسلمة',
    aov: 'متوسط قيمة الطلب',
    returningCustomers: 'العملاء المستمرون',
    atRiskCustomers: 'عملاء في خطر',
    cancellationRate: 'معدل الإلغاء',
    top20Contribution: 'مساهمة كبار العملاء',
    recentOrders: 'الطلبات الأخيرة',
    latestOrders: 'أحدث 5 طلبات',
    topCustomers: 'أهم العملاء',
    top20Info: 'مساهمة أفضل 20 عميل في المبيعات',
    orderId: 'رقم الطلب',
    customerName: 'العميل',
    phone: 'الهاتف',
    items: 'القطع',
    amount: 'المبلغ',
    status: 'الحالة',
    createdTime: 'وقت الإنشاء',
    action: 'الإجراء',
    view: 'عرض',
    loading: 'جاري تحميل البيانات...',
    error: 'حدث خطأ في تحميل البيانات',
    retry: 'إعادة المحاولة',
    contributionLabel: 'مساهمة كبار العملاء:',
    tooltips: {
      revenue: 'إجمالي فلوس الطلبات اللي اتسلمت بعد الخصم (من غير الشحن).',
      deliveredOrders: 'عدد الطلبات اللي حالتها اتسلمت.',
      aov: 'متوسط قيمة الطلب = إجمالي الإيراد ÷ عدد الطلبات اللي اتسلمت.',
      returningCustomers: 'عدد العملاء اللي اشتروا منك واتسلم لهم 2 طلب أو أكتر.',
      atRiskCustomers: 'عملاء كانوا بيشتروا منك بس بقالهم 45 يوم أو أكتر بدون طلب متسلم.',
      cancellationRate: 'نسبة الطلبات اللي اتلغت أو اتعملها مرتجع من إجمالي (اتسلمت + اتلغت + مرتجع).',
      top20Contribution: 'قد إيه أعلى 20 عميل مساهمين من إجمالي الإيراد.',
    }
  },
  en: {
    dashboard: 'Dashboard',
    description: 'Monitor your store performance',
    today: 'Today',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    thisMonth: 'This Month',
    custom: 'Custom range',
    revenue: 'Total Revenue',
    deliveredOrders: 'Delivered Orders',
    aov: 'Avg. Order Value',
    returningCustomers: 'Returning Customers',
    atRiskCustomers: 'At Risk Customers',
    cancellationRate: 'Cancellation Rate',
    top20Contribution: 'Top 20 Contribution',
    recentOrders: 'Recent Orders',
    latestOrders: 'Latest 5 orders',
    topCustomers: 'Top Customers',
    top20Info: 'Revenue contribution of top 20 customers',
    orderId: 'Order ID',
    customerName: 'Customer',
    phone: 'Phone',
    items: 'Items',
    amount: 'Amount',
    status: 'Status',
    createdTime: 'Created Time',
    action: 'Action',
    view: 'View',
    loading: 'Loading dashboard data...',
    error: 'Error loading dashboard data',
    retry: 'Retry',
    contributionLabel: 'Top 20 contribution:',
    tooltips: {
      revenue: 'Total value of delivered orders after discounts (excluding shipping).',
      deliveredOrders: 'Count of orders with "Delivered" status.',
      aov: 'Average order value = Total Revenue ÷ Delivered Orders.',
      returningCustomers: 'Count of customers with 2 or more delivered orders total.',
      atRiskCustomers: 'Customers who have not had a delivered order in 45+ days.',
      cancellationRate: 'Percentage of cancelled/returned orders out of total (Delivered + Cancelled + Returned).',
      top20Contribution: 'Contribution of top 20 customers to total revenue.',
    }
  },
};

const statusTranslations = {
  ar: {
    pending: 'قيد الانتظار',
    New: 'جديد',
    Processing: 'قيد المعالجة',
    Shipped: 'تم الشحن',
    Delivered: 'تم التوصيل',
    Cancelled: 'ملغي',
    Returned: 'مرتجع',
  } as Record<string, string>,
  en: {
    pending: 'Pending',
    New: 'New',
    Processing: 'Processing',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Returned: 'Returned',
  } as Record<string, string>,
};

const statusColors: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Returned: 'bg-muted text-gray-700 border-border',
};

interface DashboardArabicProps {
  language: 'ar' | 'en';
}

export function DashboardArabic({ language }: DashboardArabicProps) {
  const [dateFilter, setDateFilter] = useState('last30');
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];
  const st = statusTranslations[language];
  const isRTL = language === 'ar';

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fromDate: Date | undefined;
      const toDate = new Date();

      if (dateFilter === 'today') {
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'last7') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
      } else if (dateFilter === 'last30') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
      } else if (dateFilter === 'thisMonth') {
        fromDate = new Date();
        fromDate.setDate(1);
        fromDate.setHours(0, 0, 0, 0);
      }

      const res = await DashboardService.getDashboardMetrics(
        fromDate?.toISOString(),
        toDate.toISOString()
      );
      setData(res);
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
      setError(err?.message || t.error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, t.error]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Defensive Data Handling
  const metrics = data || {} as Partial<DashboardMetrics>;
  const latestOrders = data?.latest_orders || [];
  const topCustomers = data?.top_customers || [];

  // Formatting Helpers
  const formatCurrency = (val: number) => {
    return isRTL
      ? `${(val || 0).toLocaleString('ar-EG')} ج.م`
      : `EGP ${(val || 0).toLocaleString()}`;
  };

  const formatPercent = (val: number) => {
    return isRTL
      ? `%${(val || 0).toLocaleString('ar-EG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
      : `${(val || 0).toFixed(1)}%`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-lg">{t.loading}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-lg text-red-600 mb-6">{error || t.error}</p>
        <Button onClick={fetchMetrics} className="bg-green-600 hover:bg-green-700">
          {t.retry}
        </Button>
      </div>
    );
  }

  const stats = [
    {
      title: t.revenue,
      value: formatCurrency(metrics?.revenue || 0),
      isMoney: true,
      delta_pct: metrics?.deltas?.revenue?.delta_pct ?? null,
      tooltipText: t.tooltips.revenue,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      title: t.deliveredOrders,
      value: isRTL ? (metrics?.delivered_orders_count || 0).toLocaleString('ar-EG') : (metrics?.delivered_orders_count || 0).toLocaleString(),
      delta_pct: metrics?.deltas?.delivered_orders_count?.delta_pct ?? null,
      tooltipText: t.tooltips.deliveredOrders,
      isMoney: false
    },
    {
      title: t.aov,
      value: formatCurrency(metrics?.aov || 0),
      delta_pct: metrics?.deltas?.aov?.delta_pct ?? null,
      tooltipText: t.tooltips.aov,
      isMoney: true
    },
    {
      title: t.returningCustomers,
      value: isRTL ? (metrics?.returning_customers_count || 0).toLocaleString('ar-EG') : (metrics?.returning_customers_count || 0).toLocaleString(),
      tooltipText: t.tooltips.returningCustomers,
      isMoney: false,
      icon: <Users className="w-4 h-4" />
    },
    {
      title: t.atRiskCustomers,
      value: isRTL ? (metrics?.at_risk_customers_count || 0).toLocaleString('ar-EG') : (metrics?.at_risk_customers_count || 0).toLocaleString(),
      tooltipText: t.tooltips.atRiskCustomers,
      isMoney: false
    },
    {
      title: t.cancellationRate,
      value: formatPercent(metrics?.cancellation_rate || 0),
      delta_pct: metrics?.deltas?.cancellation_rate?.delta_pct ?? null,
      tooltipText: t.tooltips.cancellationRate,
      isMoney: false,
      icon: <Percent className="w-4 h-4" />
    },
    {
      title: t.top20Contribution,
      value: formatPercent(metrics?.top20_customers_contribution || 0),
      tooltipText: t.tooltips.top20Contribution,
      isMoney: false
    },
  ];

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.dashboard}</h1>
          <p className="text-muted-foreground mt-1">{t.description}</p>
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="w-4 h-4 mx-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t.today}</SelectItem>
            <SelectItem value="last7">{t.last7}</SelectItem>
            <SelectItem value="last30">{t.last30}</SelectItem>
            <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCardArabic
            key={index}
            {...stat}
            language={language}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Orders */}
        <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t.recentOrders}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.latestOrders}</p>
            </div>
            {latestOrders.length > 0 && (
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                {isRTL ? 'عرض الكل' : 'View All'}
              </Button>
            )}
          </div>

          <div className="overflow-x-auto flex-grow">
            {latestOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right whitespace-nowrap">{t.orderId}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.customerName}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.phone}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.items}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.status}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.amount}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.createdTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-muted cursor-pointer group">
                      <TableCell className="font-bold text-foreground">
                        #{String(order.id).slice(0, 6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{order.customer_name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono" dir="ltr">{order.customer_phone || '—'}</TableCell>
                      <TableCell className="text-center font-medium">
                        {isRTL ? (order.items_count || 0).toLocaleString('ar-EG') : (order.items_count || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 whitespace-nowrap", statusColors[order.status] || 'bg-muted')}>
                          {st[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground whitespace-nowrap">
                        {formatCurrency((order.subtotal || 0) - (order.discount || 0))}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[10px] whitespace-nowrap">{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isRTL ? 'لسه مفيش طلبات' : 'No orders yet'}
                </h3>
                <p className="text-muted-foreground max-w-[250px] text-sm">
                  {isRTL ? 'أول ما يبدأ يجيلك طلبات هتظهر هنا.' : 'Orders will appear here once you start receiving them.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers Table (Enhanced) */}
        <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-border shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t.topCustomers}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.top20Info}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">{t.contributionLabel}</p>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                  {formatPercent(metrics?.top20_customers_contribution || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-grow p-4">
            {topCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="text-right whitespace-nowrap">{t.customerName}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t.phone}</TableHead>
                    <TableHead className="text-center whitespace-nowrap">عدد الطلبات</TableHead>
                    <TableHead className="text-right whitespace-nowrap">آخر طلب</TableHead>
                    <TableHead className="text-left whitespace-nowrap">إجمالي المشتريات</TableHead>
                    <TableHead className="text-left whitespace-nowrap">نسبة مساهمته</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer: any, index: number) => (
                    <TableRow key={customer.customer_id || index} className="hover:bg-muted border-0 group">
                      <TableCell>
                        <div className="font-bold text-foreground whitespace-nowrap">{customer.name || '—'}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono" dir="ltr">{customer.phone}</TableCell>
                      <TableCell className="text-center font-bold">
                        {isRTL ? (customer.delivered_orders_count || 0).toLocaleString('ar-EG') : (customer.delivered_orders_count || 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[10px] whitespace-nowrap">
                        {formatDate(customer.last_delivered_at)}
                      </TableCell>
                      <TableCell className="text-left font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(customer.revenue)}
                      </TableCell>
                      <TableCell className="text-left">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {formatPercent(customer.contribution_pct)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isRTL ? 'لسه مفيش عملاء مميزين' : 'No top customers yet'}
                </h3>
                <p className="text-muted-foreground max-w-[250px] text-sm">
                  {isRTL ? 'أول ما يبدأ العملاء يكرروا الشراء هتظهر بياناتهم هنا.' : 'Customer data will appear here once they repeat purchases.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
