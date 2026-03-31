import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    Search, Plus, FileUp, Calendar, Filter, Loader2, AlertCircle, RefreshCw,
    MoreHorizontal, Eye, Phone, MapPin, Copy, MessageCircle, RotateCcw,
    ArrowLeftRight, X, ShoppingBag, Clock, PackageCheck, Truck, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { CreateOrderDrawer } from '../components/orders/CreateOrderDrawer';
import { OrderStatusChangeDialog } from '../components/orders/OrderStatusChangeDialog';
import { OrdersService, OrderRow } from '../services/orders';
import { getOrderStatusBadgeClasses, getOrderStatusLabel, OrderStats } from '../types/order';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

// ─── Component ──────────────────────────────────────────────────────────────

interface OrdersArabicProps {
    language: 'ar' | 'en';
}

export function OrdersArabic({ language }: OrdersArabicProps) {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const isRTL = language === 'ar';

    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Status change dialog
    const [statusChangeOrder, setStatusChangeOrder] = useState<OrderRow | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    // Create Rex from order
    const [rexOrderId, setRexOrderId] = useState<string | null>(null);
    const [rexType, setRexType] = useState<'return' | 'exchange'>('return');
    const [isRexDrawerOpen, setIsRexDrawerOpen] = useState(false);

    const itemsPerPage = 15;

    // ─── Fetch orders ──────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!profile?.store_id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await OrdersService.getOrders(profile.store_id);
            setOrders(data);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err?.message || 'حدث خطأ في تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    }, [profile?.store_id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleOrderCreated = () => { fetchOrders(); };

    // ─── Stats ──────────────────────────────────────────────────────────────
    const stats: OrderStats = useMemo(() => {
        const total = orders.length;
        const newCount = orders.filter(o => o.status === 'new' || o.status === 'pending').length;
        const processing = orders.filter(o => o.status === 'confirmed').length;
        const shipped = orders.filter(o => o.status === 'shipped').length;
        const delivered = orders.filter(o => o.status === 'delivered').length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;
        return { total, new: newCount, processing, shipped, delivered, cancelled };
    }, [orders]);

    // ─── Filtering ──────────────────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                String(order.id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.customer_phone || '').includes(searchQuery) ||
                (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            let matchesDate = true;
            if (dateFilter !== 'all' && order.created_at) {
                const orderDate = new Date(order.created_at);
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (dateFilter === 'today') matchesDate = orderDate >= startOfToday;
                else if (dateFilter === 'last7') {
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
    }, [orders, searchQuery, statusFilter, dateFilter]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, dateFilter]);

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all';

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateFilter('all');
        toast.info('تم إعادة ضبط الفلاتر');
    };

    // ─── Actions ─────────────────────────────────────────────────────────────
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`);
    };

    const openWhatsApp = (phone: string) => {
        const cleaned = phone.replace(/[^0-9]/g, '');
        const intlPhone = cleaned.startsWith('0') ? `2${cleaned}` : cleaned;
        window.open(`https://wa.me/${intlPhone}`, '_blank');
    };

    const handleStatusChange = (order: OrderRow) => {
        setStatusChangeOrder(order);
        setIsStatusDialogOpen(true);
    };

    const handleCreateRex = (orderId: string, type: 'return' | 'exchange') => {
        setRexOrderId(orderId);
        setRexType(type);
        setIsRexDrawerOpen(true);
    };

    const getDisplayId = (id: string) => `#${String(id).slice(0, 6).toUpperCase()}`;

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays === 1) return 'منذ يوم';
        if (diffDays < 30) return `منذ ${diffDays} يوم`;
        return date.toLocaleDateString('ar-EG');
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-xl">
                        إدارة وتتبع جميع طلباتك، تغيير الحالات، وإنشاء حالات مرتجع واستبدال.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <FileUp className="w-4 h-4" />
                        <span className="hidden sm:inline">استيراد Excel</span>
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6 shadow-sm"
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <Plus className="w-5 h-5" />
                        إضافة طلب
                    </Button>
                </div>
            </div>

            {/* ── Summary Stat Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4">
                            <Skeleton className="h-4 w-20 mb-3" />
                            <Skeleton className="h-7 w-12" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatMiniCard icon={<ShoppingBag className="w-4 h-4" />} label="إجمالي الطلبات" value={stats.total} color="text-foreground" bg="bg-muted" />
                        <StatMiniCard icon={<Clock className="w-4 h-4" />} label="جديد / انتظار" value={stats.new} color="text-blue-700 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
                        <StatMiniCard icon={<Loader2 className="w-4 h-4" />} label="قيد التجهيز" value={stats.processing} color="text-yellow-700 dark:text-yellow-400" bg="bg-yellow-50 dark:bg-yellow-950/40" />
                        <StatMiniCard icon={<Truck className="w-4 h-4" />} label="تم الشحن" value={stats.shipped} color="text-purple-700 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-950/40" />
                        <StatMiniCard icon={<CheckCircle2 className="w-4 h-4" />} label="تم التسليم" value={stats.delivered} color="text-green-700 dark:text-green-400" bg="bg-green-50 dark:bg-green-950/40" />
                        <StatMiniCard icon={<XCircle className="w-4 h-4" />} label="ملغي" value={stats.cancelled} color="text-red-700 dark:text-red-400" bg="bg-red-50 dark:bg-red-950/40" />
                    </>
                )}
            </div>

            {/* ── Filters + Table Card ────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="relative sm:col-span-2">
                            <div className={cn('absolute top-1/2 -translate-y-1/2 pointer-events-none z-10', isRTL ? 'right-3' : 'left-3')}>
                                <Search className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <Input
                                placeholder="بحث برقم الطلب أو الهاتف أو العميل..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn('h-10 bg-card border-border rounded-lg text-sm', isRTL ? 'pr-10 text-right' : 'pl-10')}
                                dir="rtl"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <Filter className="w-4 h-4 mx-2 text-muted-foreground" />
                                <SelectValue placeholder="حالة الطلب" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">كل الحالات</SelectItem>
                                <SelectItem value="new">جديد</SelectItem>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="confirmed">تم التأكيد</SelectItem>
                                <SelectItem value="shipped">تم الشحن</SelectItem>
                                <SelectItem value="delivered">تم التسليم</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                                <SelectItem value="returned">مرتجع</SelectItem>
                                <SelectItem value="exchanged">تم الاستبدال</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <Calendar className="w-4 h-4 mx-2 text-muted-foreground" />
                                <SelectValue placeholder="الفترة الزمنية" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">كل الأوقات</SelectItem>
                                <SelectItem value="today">اليوم</SelectItem>
                                <SelectItem value="last7">آخر 7 أيام</SelectItem>
                                <SelectItem value="last30">آخر 30 يوم</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Filters Indicator */}
                    {hasActiveFilters && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">فلاتر نشطة</span>
                            <button
                                onClick={handleResetFilters}
                                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                                <X className="w-3 h-3" />
                                إعادة ضبط
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Data Table ────────────────────────────────────────────────── */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/50">
                                <TableHead className="font-bold text-foreground">رقم الطلب</TableHead>
                                <TableHead className="font-bold text-foreground w-[200px]">العميل</TableHead>
                                <TableHead className="font-bold text-foreground text-center">المنتجات</TableHead>
                                <TableHead className="font-bold text-foreground">الإجمالي</TableHead>
                                <TableHead className="font-bold text-foreground text-center">حالة الطلب</TableHead>
                                <TableHead className="font-bold text-foreground">تاريخ الإنشاء</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-[350px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-full">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                            <p className="text-red-600 dark:text-red-400">{error}</p>
                                            <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
                                                <RefreshCw className="w-4 h-4" />
                                                إعادة المحاولة
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-[350px] text-center">
                                        {orders.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                <div className="bg-accent text-accent-foreground p-6 rounded-full">
                                                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                                <div className="max-w-[280px]">
                                                    <p className="text-lg font-semibold text-foreground">لا يوجد طلبات بعد</p>
                                                    <p className="text-sm mt-2 leading-relaxed">
                                                        ابدأ بإنشاء أول طلب لتظهر هنا في القائمة.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setIsDrawerOpen(true)}
                                                    className="mt-2 bg-green-600 hover:bg-green-700 gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    إنشاء أول طلب
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <div className="bg-accent text-accent-foreground p-4 rounded-full">
                                                    <Search className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-base font-medium text-foreground">لا توجد نتائج</p>
                                                <p className="text-sm">جرّب تغيير الفلاتر أو كلمة البحث</p>
                                                <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-1 gap-2">
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    إعادة ضبط الفلاتر
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedOrders.map((order) => {
                                    const itemCount = order.order_items?.length || 0;
                                    const displayId = getDisplayId(order.id);
                                    return (
                                        <TableRow
                                            key={order.id}
                                            className="group hover:bg-muted/80 transition-colors cursor-pointer border-b last:border-0"
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                        >
                                            {/* Order ID */}
                                            <TableCell className="py-3.5">
                                                <span className="font-semibold text-foreground text-sm">{displayId}</span>
                                            </TableCell>

                                            {/* Customer */}
                                            <TableCell className="py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-green-200/50 dark:border-green-800/30">
                                                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                                            {(order.customer_name || '?').charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-foreground truncate text-sm">
                                                            {order.customer_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">
                                                            {order.customer_phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Items Count */}
                                            <TableCell className="text-center">
                                                <span className="text-sm font-semibold text-foreground">{itemCount}</span>
                                                <span className="text-xs text-muted-foreground mr-1">قطع</span>
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell>
                                                <span className="font-bold text-foreground text-sm">
                                                    {Number(order.total).toLocaleString('ar-EG')} ج.م
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'font-medium text-xs px-2.5 py-0.5',
                                                        getOrderStatusBadgeClasses(order.status)
                                                    )}
                                                >
                                                    {getOrderStatusLabel(order.status)}
                                                </Badge>
                                            </TableCell>

                                            {/* Created */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-muted-foreground">
                                                        {order.created_at
                                                            ? new Date(order.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                                                            : '—'}
                                                    </span>
                                                    {order.created_at && (
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            {formatRelativeTime(order.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-card border hover:border-border">
                                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-[200px]">
                                                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                                            الإجراءات الأساسية
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                                                            <Eye className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(order)}>
                                                            <PackageCheck className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            تغيير الحالة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCreateRex(order.id, 'return')}>
                                                            <RotateCcw className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            إنشاء مرتجع
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCreateRex(order.id, 'exchange')}>
                                                            <ArrowLeftRight className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            إنشاء استبدال
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                                            التواصل والنسخ
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openWhatsApp(order.customer_phone)}>
                                                            <MessageCircle className="w-4 h-4 ml-2 text-green-600" />
                                                            واتساب العميل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => copyToClipboard(order.customer_phone, 'رقم الهاتف')}>
                                                            <Phone className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            نسخ رقم الهاتف
                                                        </DropdownMenuItem>
                                                        {order.customer_address && (
                                                            <DropdownMenuItem onClick={() => copyToClipboard(order.customer_address, 'العنوان')}>
                                                                <MapPin className="w-4 h-4 ml-2 text-muted-foreground" />
                                                                نسخ العنوان
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => copyToClipboard(order.id, 'رقم الطلب')}>
                                                            <Copy className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            نسخ رقم الطلب
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ── Pagination ────────────────────────────────────────────────── */}
                {!loading && filteredOrders.length > itemsPerPage && (
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            عرض {(currentPage - 1) * itemsPerPage + 1} إلى{' '}
                            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} من{' '}
                            {filteredOrders.length} طلب
                        </p>
                        <div className="flex gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="text-xs"
                            >
                                السابق
                            </Button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let page: number;
                                if (totalPages <= 5) page = i + 1;
                                else if (currentPage <= 3) page = i + 1;
                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                else page = currentPage - 2 + i;
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn('text-xs min-w-[32px]', currentPage === page && 'bg-green-600 hover:bg-green-700')}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="text-xs"
                            >
                                التالي
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals / Drawers ──────────────────────────────────────────── */}
            <CreateOrderDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleOrderCreated}
            />

            {statusChangeOrder && (
                <OrderStatusChangeDialog
                    open={isStatusDialogOpen}
                    onOpenChange={setIsStatusDialogOpen}
                    orderId={statusChangeOrder.id}
                    storeId={profile?.store_id || ''}
                    currentStatus={statusChangeOrder.status}
                    orderDisplayId={getDisplayId(statusChangeOrder.id)}
                    onSuccess={() => {
                        fetchOrders();
                        setStatusChangeOrder(null);
                    }}
                />
            )}
        </div>
    );
}

// ─── Stat Mini Card ─────────────────────────────────────────────────────────

function StatMiniCard({ icon, label, value, color, bg }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-lg', bg)}>
                    <span className={color}>{icon}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">{label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{value.toLocaleString('ar-EG')}</p>
        </div>
    );
}
