import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowRight, Phone, MapPin, Plus, Copy, AlertCircle,
    RefreshCw, ShoppingBag, TrendingUp, Clock, DollarSign,
    CheckCircle, XCircle, RotateCcw, User, Lightbulb, FileText,
    Loader2, Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { CustomerProfile, CustomerOrder } from '../types';
import { CustomersService } from '../services/customers';
import {
    getSegmentLabel, getSegmentColor, getSegmentIcon,
    getRiskLabel, getRiskColor, getScoreColor,
    formatEGP, formatRelativeDays, formatDate,
    generateInsights, generateRecommendations,
    orderStatusLabels, orderStatusColors,
} from '../services/customerHelpers';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

interface CustomerDetailsArabicProps {
    language: 'ar' | 'en';
}

export function CustomerDetailsArabic({ language }: CustomerDetailsArabicProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isRTL = language === 'ar';

    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ─── Fetch Data ───────────────────────────────────────────────────────

    const fetchCustomer = async () => {
        if (!profile?.store_id || !id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await CustomersService.getCustomerProfile(id, profile.store_id);
            if (!data) {
                setError('لم يتم العثور على هذا العميل');
            }
            setCustomer(data);
        } catch (err: any) {
            console.error('Error fetching customer:', err);
            setError('حدث خطأ أثناء تحميل بيانات العميل');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!profile?.store_id || !id) return;
        try {
            setOrdersLoading(true);
            const data = await CustomersService.getCustomerOrders(id, profile.store_id);
            setOrders(data);
        } catch (err: any) {
            console.error('Error fetching customer orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.store_id && id) {
            fetchCustomer();
            fetchOrders();
        }
    }, [profile?.store_id, id]);

    // ─── Helpers ──────────────────────────────────────────────────────────

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`);
    };

    const handleCreateOrder = () => {
        // TODO: Pass customer context when order creation flow supports prefill
        navigate('/orders');
        toast.info(`سيتم إنشاء طلب جديد لـ ${customer?.name}`);
    };

    // ─── Loading State ────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="space-y-6" dir="rtl">
                {/* Back button skeleton */}
                <Skeleton className="h-9 w-32" />

                {/* Header skeleton */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4">
                            <Skeleton className="h-4 w-20 mb-3" />
                            <Skeleton className="h-7 w-16" />
                        </div>
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error / Not Found State ──────────────────────────────────────────

    if (error || !customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{error || 'لم يتم العثور على العميل'}</h3>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/customers')} variant="outline" className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        رجوع للعملاء
                    </Button>
                    <Button onClick={fetchCustomer} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        );
    }

    const insights = generateInsights(customer);
    const recommendations = generateRecommendations(customer);

    // ─── Insight & Recommendation Color Maps ──────────────────────────────

    const insightTypeColors: Record<string, string> = {
        positive: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
    };

    const recTypeColors: Record<string, string> = {
        reactivation: 'bg-orange-50 border-orange-200 text-orange-800',
        caution: 'bg-red-50 border-red-200 text-red-800',
        reward: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        nurture: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Back Navigation ─────────────────────────────────────────────── */}
            <button
                onClick={() => navigate('/customers')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                رجوع للعملاء
            </button>

            {/* ── Header Card ─────────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center flex-shrink-0 border-2 border-green-200/50">
                        <span className="text-2xl font-bold text-green-700">
                            {customer.name.charAt(0)}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h1 className="text-xl font-bold text-foreground truncate">{customer.name}</h1>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className={cn('font-medium text-xs px-2.5 py-0.5', getSegmentColor(customer.segment))}>
                                    <span className="ml-1">{getSegmentIcon(customer.segment)}</span>
                                    {getSegmentLabel(customer.segment)}
                                </Badge>
                                <Badge variant="outline" className={cn('font-medium text-xs px-2.5 py-0.5', getRiskColor(customer.risk_level))}>
                                    {getRiskLabel(customer.risk_level)}
                                </Badge>
                                {customer.score > 0 && (
                                    <Badge variant="outline" className={cn('font-medium text-xs px-2.5 py-0.5', getScoreColor(customer.score))}>
                                        تقييم: {customer.score}/100
                                    </Badge>
                                )}
                                {(customer.segment === 'at_risk' || customer.risk_level === 'high') && (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-medium text-xs px-2.5 py-0.5">
                                        معرض للفقد
                                    </Badge>
                                )}
                                {((customer.total_orders_count > 0 ? (customer.cancelled_orders_count / customer.total_orders_count) * 100 : 0) > 30 || customer.bad_orders_count >= 2) && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium text-xs px-2.5 py-0.5">
                                        إلغاء مرتفع
                                    </Badge>
                                )}
                                {((customer.total_orders_count > 0 ? (customer.returned_orders_count / customer.total_orders_count) * 100 : 0) > 30) && (
                                    <Badge variant="outline" className="bg-accent text-accent-foreground text-gray-700 border-border font-medium text-xs px-2.5 py-0.5">
                                        مرتجع مرتفع
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5" dir="ltr">
                                <Phone className="w-3.5 h-3.5" />
                                {customer.phone}
                            </span>
                            {customer.city && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {customer.city}
                                </span>
                            )}
                            {customer.address && (
                                <span className="flex items-center gap-1.5 truncate max-w-[250px]">
                                    {customer.address}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                        <Button onClick={handleCreateOrder} size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 h-9 text-xs">
                            <Plus className="w-3.5 h-3.5" />
                            طلب جديد
                        </Button>
                        <Button onClick={() => copyToClipboard(customer.phone, 'رقم الهاتف')} variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
                            <Phone className="w-3.5 h-3.5" />
                            نسخ الهاتف
                        </Button>
                        {customer.address && (
                            <Button onClick={() => copyToClipboard(customer.address!, 'العنوان')} variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
                                <Copy className="w-3.5 h-3.5" />
                                نسخ العنوان
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard icon={<ShoppingBag className="w-4 h-4" />} label="إجمالي الطلبات" value={String(customer.total_orders_count)} color="text-gray-700" bg="bg-muted" />
                <KpiCard icon={<CheckCircle className="w-4 h-4" />} label="الطلبات المكتملة" value={String(customer.delivered_orders_count)} color="text-green-700" bg="bg-green-50" />
                <KpiCard icon={<XCircle className="w-4 h-4" />} label="الطلبات الملغية" value={String(customer.cancelled_orders_count)} color="text-red-700" bg="bg-red-50" />
                <KpiCard icon={<RotateCcw className="w-4 h-4" />} label="الطلبات المرتجعة" value={String(customer.returned_orders_count)} color="text-orange-700" bg="bg-orange-50" />
                <KpiCard icon={<DollarSign className="w-4 h-4" />} label="إجمالي الإنفاق" value={formatEGP(customer.total_spent)} color="text-emerald-700" bg="bg-emerald-50" isMoney />
                <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="متوسط قيمة الطلب" value={formatEGP(customer.avg_order_value)} color="text-indigo-700" bg="bg-indigo-50" isMoney />
                <KpiCard icon={<Clock className="w-4 h-4" />} label="آخر طلب منذ" value={formatRelativeDays(customer.days_since_last_delivered)} color="text-amber-700" bg="bg-amber-50" />
                <KpiCard icon={<User className="w-4 h-4" />} label="حالة العميل" value={getSegmentLabel(customer.segment)} color="text-blue-700" bg="bg-blue-50" />
            </div>

            {/* ── Insights & Recommendations ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Insights */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                        <h3 className="font-bold text-foreground text-sm">ملاحظات ذكية</h3>
                    </div>
                    {insights.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">لا توجد ملاحظات حالياً</p>
                    ) : (
                        <div className="space-y-2.5">
                            {insights.map((insight, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-xl border text-sm leading-relaxed',
                                        insightTypeColors[insight.type]
                                    )}
                                >
                                    <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
                                    <span>{insight.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4.5 h-4.5 text-blue-500" />
                        <h3 className="font-bold text-foreground text-sm">إجراءات مقترحة</h3>
                    </div>
                    {recommendations.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">لا توجد إجراءات مقترحة حالياً</p>
                    ) : (
                        <div className="space-y-2.5">
                            {recommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-xl border text-sm leading-relaxed',
                                        recTypeColors[rec.type]
                                    )}
                                >
                                    <span className="text-base flex-shrink-0 mt-0.5">{rec.icon}</span>
                                    <span>{rec.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Orders History ──────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
                        <h3 className="font-bold text-foreground text-sm">سجل الطلبات</h3>
                        <span className="text-xs text-muted-foreground mr-1">({orders.length})</span>
                    </div>
                </div>

                {ordersLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="bg-accent text-accent-foreground p-4 rounded-full mb-3">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">لا يوجد طلبات لهذا العميل</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-muted/50">
                                    <TableHead className="font-bold text-gray-700 text-xs">رقم الطلب</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-xs">التاريخ</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-xs text-center">الحالة</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-xs">الإجمالي</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-xs">ملاحظات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const displayId = `#${String(order.id).slice(0, 6).toUpperCase()}`;
                                    return (
                                        <TableRow key={order.id} className="hover:bg-muted/80 transition-colors">
                                            <TableCell className="font-semibold text-foreground text-sm">{displayId}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'font-medium text-xs',
                                                        orderStatusColors[order.status] || 'bg-muted text-gray-700 border-border'
                                                    )}
                                                >
                                                    {orderStatusLabels[order.status] || order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground text-sm">
                                                {formatEGP(order.total)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {order.notes || '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* ── Notes Section ──────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4.5 h-4.5 text-muted-foreground" />
                    <h3 className="font-bold text-foreground text-sm">ملاحظات</h3>
                </div>
                {customer.notes ? (
                    <div className="bg-muted rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-border">
                        {customer.notes}
                    </div>
                ) : (
                    <div className="bg-muted rounded-xl p-6 text-center border border-border">
                        <p className="text-sm text-muted-foreground">لا توجد ملاحظات على هذا العميل حتى الآن</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── KPI Card Component ─────────────────────────────────────────────────────

function KpiCard({ icon, label, value, color, bg, isMoney }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    bg: string;
    isMoney?: boolean;
}) {
    return (
        <div className={cn(
            'bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow',
            isMoney && 'border-emerald-100'
        )}>
            <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-lg', bg)}>
                    <span className={color}>{icon}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">{label}</span>
            </div>
            <p className={cn('font-bold text-foreground truncate', isMoney ? 'text-lg' : 'text-xl')}>
                {value}
            </p>
        </div>
    );
}
