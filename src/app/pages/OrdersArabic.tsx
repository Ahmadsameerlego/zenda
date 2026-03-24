import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, FileUp, Calendar, Filter, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
import { CreateOrderDrawer } from '../components/orders/CreateOrderDrawer';
import { OrdersService, OrderRow } from '../services/orders';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';

const translations = {
  ar: {
    orders: 'الطلبات',
    description: 'إدارة وتتبع جميع طلباتك',
    importExcel: 'استيراد Excel',
    addOrder: 'إضافة طلب',
    searchPlaceholder: 'بحث برقم الطلب أو الهاتف أو العميل...',
    allStatus: 'كل الحالات',
    allTime: 'كل الأوقات',
    today: 'اليوم',
    last7: 'آخر 7 أيام',
    last30: 'آخر 30 يوم',
    custom: 'فترة مخصصة',
    orderId: 'رقم الطلب',
    customer: 'العميل',
    phone: 'الهاتف',
    items: 'القطع',
    amount: 'المبلغ',
    status: 'الحالة',
    created: 'تاريخ الإنشاء',
    noOrders: 'لا توجد طلبات',
    showing: 'عرض',
    to: 'إلى',
    of: 'من',
    ordersText: 'طلب',
    previous: 'السابق',
    next: 'التالي',
    loadingOrders: 'جاري تحميل الطلبات...',
    errorLoading: 'حدث خطأ في تحميل الطلبات',
    retry: 'إعادة المحاولة',
  },
  en: {
    orders: 'Orders',
    description: 'Manage and track all your orders',
    importExcel: 'Import Excel',
    addOrder: 'Add Order',
    searchPlaceholder: 'Search by Order ID, Phone, or Customer...',
    allStatus: 'All Status',
    allTime: 'All Time',
    today: 'Today',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    custom: 'Custom range',
    orderId: 'Order ID',
    customer: 'Customer',
    phone: 'Phone',
    items: 'Items',
    amount: 'Amount',
    status: 'Status',
    created: 'Created',
    noOrders: 'No orders found',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    ordersText: 'orders',
    previous: 'Previous',
    next: 'Next',
    loadingOrders: 'Loading orders...',
    errorLoading: 'Error loading orders',
    retry: 'Retry',
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
  Returned: 'bg-gray-50 text-gray-700 border-gray-200',
};

interface OrdersArabicProps {
  language: 'ar' | 'en';
}

export function OrdersArabic({ language }: OrdersArabicProps) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const itemsPerPage = 10;
  const t = translations[language];
  const st = statusTranslations[language];
  const isRTL = language === 'ar';

  // ─── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!profile?.store_id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await OrdersService.getOrders(profile.store_id);
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err?.message || t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [profile?.store_id, t.errorLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Handle order creation success ─────────────────────────────────────
  const handleOrderCreated = () => {
    fetchOrders();
  };

  // ─── Filter orders ─────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_phone || '').includes(searchQuery) ||
      (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== 'all' && order.created_at) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === 'today') {
        matchesDate = orderDate >= startOfToday;
      } else if (dateFilter === 'last7') {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'last30') {
        const monthAgo = new Date(startOfToday);
        monthAgo.setDate(monthAgo.getDate() - 30);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (language === 'ar') {
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'منذ يوم';
      if (diffDays < 30) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-EG');
    } else {
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US');
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.orders}</h1>
          <p className="text-gray-500 mt-1">{t.description}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">{t.importExcel}</span>
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 gap-2"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t.addOrder}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mx-2" />
              <SelectValue placeholder={t.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatus}</SelectItem>
              {Object.keys(statusColors).map((status) => (
                <SelectItem key={status} value={status}>
                  {st[status] || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <Calendar className="w-4 h-4 mx-2" />
              <SelectValue placeholder={t.created} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allTime}</SelectItem>
              <SelectItem value="today">{t.today}</SelectItem>
              <SelectItem value="last7">{t.last7}</SelectItem>
              <SelectItem value="last30">{t.last30}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-3" />
            <p>{t.loadingOrders}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-red-600 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.retry}
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    <TableHead className="font-semibold">{t.orderId}</TableHead>
                    <TableHead className="font-semibold">{t.customer}</TableHead>
                    <TableHead className="font-semibold">{t.phone}</TableHead>
                    <TableHead className="font-semibold">{t.items}</TableHead>
                    <TableHead className="font-semibold">{t.amount}</TableHead>
                    <TableHead className="font-semibold">{t.status}</TableHead>
                    <TableHead className="font-semibold">{t.created}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                        {t.noOrders}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => {
                      const itemCount = order.order_items?.length || 0;
                      const displayId = `#${String(order.id).slice(0, 6).toUpperCase()}`;

                      return (
                        <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer">
                          <TableCell className="font-semibold text-gray-900">{displayId}</TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                          </TableCell>
                          <TableCell className="text-gray-600" dir="ltr">{order.customer_phone}</TableCell>
                          <TableCell className="text-gray-600">
                            {itemCount} {language === 'ar' ? 'قطع' : 'items'}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {isRTL
                              ? `${Number(order.total).toLocaleString('ar-EG')} ج.م`
                              : `EGP ${Number(order.total).toLocaleString()}`}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}
                            >
                              {st[order.status] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {order.created_at ? formatRelativeTime(order.created_at) : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  {t.showing} {(currentPage - 1) * itemsPerPage + 1} {t.to}{' '}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)} {t.of}{' '}
                  {filteredOrders.length} {t.ordersText}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    {t.previous}
                  </Button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    {t.next}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateOrderDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={handleOrderCreated}
      />
    </div>
  );
}
