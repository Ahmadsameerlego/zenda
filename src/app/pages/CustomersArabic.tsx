import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    Search, RefreshCw, AlertCircle, Plus, MoreHorizontal, Eye,
    Copy, MapPin, Phone, Users, UserPlus, UserCheck, ShieldAlert,
    TrendingUp, TrendingDown, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '../components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { CustomerListItem } from '../types';
import { CustomersService } from '../services/customers';
import {
    getSegmentLabel, getSegmentColor, getSegmentIcon,
    getRiskLabel, getRiskColor, getScoreColor,
    formatEGP, formatRelativeDays,
} from '../services/customerHelpers';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

// ─── Segment Tab Definitions ────────────────────────────────────────────────

interface SegmentTab {
    key: string;
    label: string;
    filter: (c: CustomerListItem) => boolean;
}

const segmentTabs: SegmentTab[] = [
    { key: 'all', label: 'الكل', filter: () => true },
    { key: 'new', label: 'جدد', filter: (c) => c.segment === 'new' },
    { key: 'returning', label: 'متكررين', filter: (c) => c.segment === 'returning' },
    { key: 'loyal', label: 'أوفياء', filter: (c) => c.segment === 'loyal' },
    { key: 'vip', label: 'VIP', filter: (c) => c.segment === 'vip' },
    { key: 'at_risk', label: 'معرضين للفقد', filter: (c) => c.segment === 'at_risk' || c.risk_level === 'high' },
    { key: 'high_cancel', label: 'إلغاء مرتفع', filter: (c) => (c.total_orders_count > 0 ? (c.cancelled_orders_count / c.total_orders_count) * 100 : 0) > 30 },
    { key: 'high_return', label: 'مرتجع مرتفع', filter: (c) => (c.total_orders_count > 0 ? (c.returned_orders_count / c.total_orders_count) * 100 : 0) > 30 },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface CustomersArabicProps {
    language: 'ar' | 'en';
}

export function CustomersArabic({ language }: CustomersArabicProps) {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const isRTL = language === 'ar';

    // Data state
    const [customers, setCustomers] = useState<CustomerListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSegmentTab, setActiveSegmentTab] = useState('all');
    const [segmentFilter, setSegmentFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [spendingSort, setSpendingSort] = useState('all');
    const [lastOrderSort, setLastOrderSort] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // ─── Fetch ──────────────────────────────────────────────────────────────

    const fetchCustomers = async () => {
        if (!profile?.store_id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await CustomersService.getCustomersList(profile.store_id);
            setCustomers(data);
        } catch (err: any) {
            console.error('Error fetching customers:', err);
            setError('حدث خطأ أثناء تحميل بيانات العملاء. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.store_id) fetchCustomers();
    }, [profile?.store_id]);

    // ─── Derived Stats ────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const total = customers.length;
        const newCount = customers.filter(c => c.segment === 'new').length;
        const returning = customers.filter(c => c.segment === 'returning' || c.segment === 'loyal' || c.segment === 'vip').length;
        const atRisk = customers.filter(c => c.segment === 'at_risk' || c.risk_level === 'high').length;
        const highRisk = customers.filter(c => c.risk_level === 'high').length;
        return { total, newCount, returning, atRisk, highRisk };
    }, [customers]);

    // ─── Filtering & Sorting ──────────────────────────────────────────────

    const filteredCustomers = useMemo(() => {
        const activeTab = segmentTabs.find(t => t.key === activeSegmentTab);
        let result = activeTab ? customers.filter(activeTab.filter) : customers;

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.phone.includes(q)
            );
        }

        // Segment dropdown
        if (segmentFilter !== 'all') {
            result = result.filter(c => c.segment === segmentFilter);
        }

        // Risk dropdown
        if (riskFilter !== 'all') {
            result = result.filter(c => c.risk_level === riskFilter);
        }

        // Sorting
        if (spendingSort === 'highest') {
            result = [...result].sort((a, b) => b.total_spent - a.total_spent);
        } else if (spendingSort === 'lowest') {
            result = [...result].sort((a, b) => a.total_spent - b.total_spent);
        }

        if (lastOrderSort === 'newest') {
            result = [...result].sort((a, b) => {
                if (!a.last_order_at) return 1;
                if (!b.last_order_at) return -1;
                return new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime();
            });
        } else if (lastOrderSort === 'oldest') {
            result = [...result].sort((a, b) => {
                if (!a.last_order_at) return 1;
                if (!b.last_order_at) return -1;
                return new Date(a.last_order_at).getTime() - new Date(b.last_order_at).getTime();
            });
        }

        return result;
    }, [customers, searchQuery, activeSegmentTab, segmentFilter, riskFilter, spendingSort, lastOrderSort]);

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeSegmentTab, segmentFilter, riskFilter, spendingSort, lastOrderSort]);

    const hasActiveFilters = searchQuery || segmentFilter !== 'all' || riskFilter !== 'all' || spendingSort !== 'all' || lastOrderSort !== 'all';

    const handleResetFilters = () => {
        setSearchQuery('');
        setActiveSegmentTab('all');
        setSegmentFilter('all');
        setRiskFilter('all');
        setSpendingSort('all');
        setLastOrderSort('all');
        toast.info('تم إعادة ضبط الفلاتر');
    };

    // ─── Actions ──────────────────────────────────────────────────────────

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`);
    };

    const handleCreateOrder = (customer: CustomerListItem) => {
        // TODO: Pass customer context when order creation flow supports prefill
        navigate('/orders');
        toast.info(`سيتم إنشاء طلب جديد لـ ${customer.name}`);
    };

    // ─── Render ───────────────────────────────────────────────────────────

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{error}</h3>
                <Button onClick={fetchCustomers} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    إعادة المحاولة
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">العملاء</h1>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-xl">
                        تابع أهم عملاءك، اعرف مين بيرجع يشتري، ومين محتاج متابعة قبل ما تخسر البيع.
                    </p>
                </div>
            </div>

            {/* ── Summary Stat Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4">
                            <Skeleton className="h-4 w-20 mb-3" />
                            <Skeleton className="h-7 w-12" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatMiniCard icon={<Users className="w-4 h-4" />} label="إجمالي العملاء" value={stats.total} color="text-gray-700" bg="bg-muted" />
                        <StatMiniCard icon={<UserPlus className="w-4 h-4" />} label="العملاء الجدد" value={stats.newCount} color="text-blue-700" bg="bg-blue-50" />
                        <StatMiniCard icon={<TrendingUp className="w-4 h-4" />} label="العملاء المتكررين" value={stats.returning} color="text-indigo-700" bg="bg-indigo-50" />
                        <StatMiniCard icon={<ShieldAlert className="w-4 h-4" />} label="معرضين للفقد" value={stats.atRisk} color="text-orange-700" bg="bg-orange-50" />
                        <StatMiniCard icon={<TrendingDown className="w-4 h-4" />} label="عاليي الخطورة" value={stats.highRisk} color="text-red-700" bg="bg-red-50" />
                    </>
                )}
            </div>

            {/* ── Segment Tabs ────────────────────────────────────────────────── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {segmentTabs.map((tab) => {
                    const count = tab.key === 'all' ? customers.length : customers.filter(tab.filter).length;
                    const isActive = activeSegmentTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSegmentTab(tab.key)}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                                isActive
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:border-border'
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                                isActive ? 'bg-card/20 text-white' : 'bg-accent text-accent-foreground text-muted-foreground'
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Filters Bar ─────────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {/* Search */}
                        <div className="relative sm:col-span-2">
                            <div className={cn('absolute top-1/2 -translate-y-1/2 pointer-events-none z-10', isRTL ? 'right-3' : 'left-3')}>
                                <Search className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <Input
                                placeholder="ابحث بالاسم أو رقم الهاتف"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn('h-10 bg-card border-border rounded-lg text-sm', isRTL ? 'pr-10 text-right' : 'pl-10')}
                                dir="rtl"
                            />
                        </div>

                        {/* Segment Dropdown */}
                        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <SelectValue placeholder="الفئة" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">كل الفئات</SelectItem>
                                <SelectItem value="new">جديد</SelectItem>
                                <SelectItem value="returning">متكرر</SelectItem>
                                <SelectItem value="loyal">وفي</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Risk Dropdown */}
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <SelectValue placeholder="الخطورة" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">كل المستويات</SelectItem>
                                <SelectItem value="low">منخفض</SelectItem>
                                <SelectItem value="medium">متوسط</SelectItem>
                                <SelectItem value="high">مرتفع</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Spending Sort */}
                        <Select value={spendingSort} onValueChange={setSpendingSort}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <SelectValue placeholder="ترتيب الإنفاق" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">بدون ترتيب</SelectItem>
                                <SelectItem value="highest">الأعلى إنفاقًا</SelectItem>
                                <SelectItem value="lowest">الأقل إنفاقًا</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Last Order Sort */}
                        <Select value={lastOrderSort} onValueChange={setLastOrderSort}>
                            <SelectTrigger className="h-10 bg-card border-border rounded-lg text-sm" dir="rtl">
                                <SelectValue placeholder="آخر طلب" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">بدون ترتيب</SelectItem>
                                <SelectItem value="newest">الأحدث طلبًا</SelectItem>
                                <SelectItem value="oldest">الأقدم طلبًا</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active filters indicator */}
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

                {/* ── Data Table ──────────────────────────────────────────────────── */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/50">
                                <TableHead className="font-bold text-gray-700 w-[220px]">العميل</TableHead>
                                <TableHead className="font-bold text-gray-700">المدينة</TableHead>
                                <TableHead className="font-bold text-gray-700 text-center">الطلبات</TableHead>
                                <TableHead className="font-bold text-gray-700">الإنفاق</TableHead>
                                <TableHead className="font-bold text-gray-700">آخر طلب</TableHead>
                                <TableHead className="font-bold text-gray-700 text-center">التقييم</TableHead>
                                <TableHead className="font-bold text-gray-700 text-center">الفئة</TableHead>
                                <TableHead className="font-bold text-gray-700 text-center">الخطورة</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-12 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-14 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-14 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-[350px] text-center">
                                        {customers.length === 0 ? (
                                            /* Empty state — no customers at all */
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                <div className="bg-accent text-accent-foreground p-6 rounded-full">
                                                    <Users className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                                <div className="max-w-[280px]">
                                                    <p className="text-lg font-semibold text-foreground">لا يوجد عملاء بعد</p>
                                                    <p className="text-sm mt-2 leading-relaxed">
                                                        العملاء بيتضافوا تلقائيًا لما تعمل أول طلب. ابدأ بإنشاء طلب جديد وهيظهروا هنا.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => navigate('/orders')}
                                                    className="mt-2 bg-green-600 hover:bg-green-700 gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    إنشاء أول طلب
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Filtered empty state */
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
                                paginatedCustomers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className="group hover:bg-muted/80 transition-colors cursor-pointer border-b last:border-0"
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                    >
                                        {/* Customer cell */}
                                        <TableCell className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center flex-shrink-0 border border-green-200/50">
                                                    <span className="text-sm font-bold text-green-700">
                                                        {customer.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-foreground truncate text-sm">
                                                        {customer.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">
                                                        {customer.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* City */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            {customer.city || '—'}
                                        </TableCell>

                                        {/* Orders count */}
                                        <TableCell className="text-center">
                                            <span className="text-sm font-semibold text-foreground">{customer.total_orders_count}</span>
                                        </TableCell>

                                        {/* Spending */}
                                        <TableCell>
                                            <span className="text-sm font-semibold text-foreground">{formatEGP(customer.total_spent)}</span>
                                        </TableCell>

                                        {/* Last order */}
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-muted-foreground">
                                                    {customer.last_order_at
                                                        ? new Date(customer.last_order_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                                                        : '—'}
                                                </span>
                                                {customer.days_since_last_delivered !== null && (
                                                    <span className="text-xs text-muted-foreground mt-0.5">
                                                        {formatRelativeDays(customer.days_since_last_delivered)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Score */}
                                        <TableCell className="text-center">
                                            {customer.score !== undefined && customer.score !== null ? (
                                                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', getScoreColor(customer.score))}>
                                                    {customer.score}/100
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>

                                        {/* Segment badge */}
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={cn('font-medium text-xs px-2.5 py-0.5', getSegmentColor(customer.segment))}>
                                                <span className="ml-1">{getSegmentIcon(customer.segment)}</span>
                                                {getSegmentLabel(customer.segment)}
                                            </Badge>
                                        </TableCell>

                                        {/* Risk badge */}
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={cn('font-medium text-xs px-2.5 py-0.5', getRiskColor(customer.risk_level))}>
                                                {getRiskLabel(customer.risk_level)}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-card border hover:border-border">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-[180px]">
                                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">الإجراءات</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                                                        <Eye className="w-4 h-4 ml-2 text-muted-foreground" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCreateOrder(customer)}>
                                                        <Plus className="w-4 h-4 ml-2 text-muted-foreground" />
                                                        إنشاء طلب جديد
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => copyToClipboard(customer.phone, 'رقم الهاتف')}>
                                                        <Phone className="w-4 h-4 ml-2 text-muted-foreground" />
                                                        نسخ رقم الهاتف
                                                    </DropdownMenuItem>
                                                    {customer.address && (
                                                        <DropdownMenuItem onClick={() => copyToClipboard(customer.address!, 'العنوان')}>
                                                            <MapPin className="w-4 h-4 ml-2 text-muted-foreground" />
                                                            نسخ العنوان
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ── Pagination ─────────────────────────────────────────────────── */}
                {!loading && filteredCustomers.length > itemsPerPage && (
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            عرض {(currentPage - 1) * itemsPerPage + 1} إلى{' '}
                            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} من{' '}
                            {filteredCustomers.length} عميل
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
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
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
