import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowRight, Phone, MapPin, Copy, MessageCircle, AlertCircle,
    RefreshCw, ShoppingBag, Clock, DollarSign, Loader2, Package,
    PackageCheck, RotateCcw, ArrowLeftRight, FileText, Truck,
    CreditCard, StickyNote, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { OrdersService } from '../services/orders';
import { OrderStatusChangeDialog } from '../components/orders/OrderStatusChangeDialog';
import { CreateRexFromOrderDrawer } from '../components/orders/CreateRexFromOrderDrawer';
import {
    OrderDetails, OrderItemWithProduct,
    getOrderStatusBadgeClasses, getOrderStatusLabel, getOrderStatusOption,
    STATUS_PROGRESSION,
} from '../types/order';
import { RexCase } from '../types/rex';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

interface OrderDetailsArabicProps {
    language: 'ar' | 'en';
}

export function OrderDetailsArabic({ language }: OrderDetailsArabicProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isRTL = language === 'ar';

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [rexCases, setRexCases] = useState<RexCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [rexLoading, setRexLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialogs
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isRexDrawerOpen, setIsRexDrawerOpen] = useState(false);
    const [rexType, setRexType] = useState<'return' | 'exchange'>('return');

    // ─── Fetch ───────────────────────────────────────────────────────────
    const fetchOrder = useCallback(async () => {
        if (!profile?.store_id || !id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await OrdersService.getOrderById(id, profile.store_id);
            setOrder(data);
        } catch (err: any) {
            console.error('Error fetching order:', err);
            setError('حدث خطأ أثناء تحميل بيانات الطلب');
        } finally {
            setLoading(false);
        }
    }, [id, profile?.store_id]);

    const fetchRexCases = useCallback(async () => {
        if (!profile?.store_id || !id) return;
        try {
            setRexLoading(true);
            const data = await OrdersService.getLinkedRexCases(id, profile.store_id);
            setRexCases(data);
        } catch {
            // silently fail — not critical
        } finally {
            setRexLoading(false);
        }
    }, [id, profile?.store_id]);

    useEffect(() => {
        fetchOrder();
        fetchRexCases();
    }, [fetchOrder, fetchRexCases]);

    // ─── Helpers ──────────────────────────────────────────────────────────
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`);
    };

    const openWhatsApp = (phone: string) => {
        const cleaned = phone.replace(/[^0-9]/g, '');
        const intlPhone = cleaned.startsWith('0') ? `2${cleaned}` : cleaned;
        window.open(`https://wa.me/${intlPhone}`, '_blank');
    };

    const getDisplayId = (orderId: string) => `#${String(orderId).slice(0, 6).toUpperCase()}`;

    const handleOpenRex = (type: 'return' | 'exchange') => {
        setRexType(type);
        setIsRexDrawerOpen(true);
    };

    // ─── Loading State ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-6" dir="rtl">
                <Skeleton className="h-9 w-32" />
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-16 rounded-full" /></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4">
                            <Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-7 w-16" />
                        </div>
                    ))}
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                    <Skeleton className="h-5 w-32" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
                </div>
            </div>
        );
    }

    // ─── Error / Not Found ────────────────────────────────────────────────
    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{error || 'لم يتم العثور على الطلب'}</h3>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/orders')} variant="outline" className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        رجوع للطلبات
                    </Button>
                    <Button onClick={fetchOrder} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        );
    }

    const displayId = getDisplayId(order.id);
    const statusOption = getOrderStatusOption(order.status);

    // Status progression index
    const currentStepIndex = STATUS_PROGRESSION.indexOf(order.status as any);
    const isCancelledOrReturned = order.status === 'cancelled' || order.status === 'returned';

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Back Navigation ─────────────────────────────────────────────── */}
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                رجوع للطلبات
            </button>

            {/* ── Header Card ─────────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h1 className="text-xl font-bold text-foreground">
                                طلب {displayId}
                            </h1>
                            <Badge
                                variant="outline"
                                className={cn('font-medium text-xs px-2.5 py-0.5 w-fit', getOrderStatusBadgeClasses(order.status))}
                            >
                                {statusOption.icon} {statusOption.label}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                                {order.customer_name}
                            </span>
                            <span className="flex items-center gap-1.5" dir="ltr">
                                <Phone className="w-3.5 h-3.5" />
                                {order.customer_phone}
                            </span>
                            {order.customer_address && (
                                <span className="flex items-center gap-1.5 truncate max-w-[250px]">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {order.customer_address}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <div className="mt-3">
                            <span className="text-2xl font-bold text-foreground">
                                {Number(order.total).toLocaleString('ar-EG')} ج.م
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                        <Button onClick={() => setIsStatusDialogOpen(true)} size="sm" variant="outline" className="gap-1.5 h-9 text-xs">
                            <PackageCheck className="w-3.5 h-3.5" />
                            تغيير الحالة
                        </Button>
                        <Button onClick={() => openWhatsApp(order.customer_phone)} size="sm" variant="outline" className="gap-1.5 h-9 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30">
                            <MessageCircle className="w-3.5 h-3.5" />
                            واتساب
                        </Button>
                        <Button onClick={() => handleOpenRex('return')} size="sm" variant="outline" className="gap-1.5 h-9 text-xs">
                            <RotateCcw className="w-3.5 h-3.5" />
                            مرتجع
                        </Button>
                        <Button onClick={() => handleOpenRex('exchange')} size="sm" variant="outline" className="gap-1.5 h-9 text-xs">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            استبدال
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Status Progression ─────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    تقدم الطلب
                </h3>
                {isCancelledOrReturned ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                        <span className="text-xl">{statusOption.icon}</span>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">{statusOption.label}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-0">
                        {STATUS_PROGRESSION.map((step, i) => {
                            const isActive = i <= currentStepIndex;
                            const isCurrent = step === order.status;
                            const stepLabel = getOrderStatusLabel(step);
                            return (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                                            isCurrent
                                                ? 'bg-green-600 text-white border-green-600 ring-4 ring-green-100 dark:ring-green-900/30'
                                                : isActive
                                                    ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                                                    : 'bg-muted text-muted-foreground border-border'
                                        )}>
                                            {isActive ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                        </div>
                                        <span className={cn(
                                            'text-xs mt-1.5 text-center',
                                            isCurrent ? 'font-bold text-green-700 dark:text-green-400' : isActive ?  'text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {stepLabel}
                                        </span>
                                    </div>
                                    {i < STATUS_PROGRESSION.length - 1 && (
                                        <div className={cn(
                                            'h-0.5 flex-1 -mt-4',
                                            i < currentStepIndex ? 'bg-green-300 dark:bg-green-700' : 'bg-border'
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* ── Items + Financial (2/3 width) ──────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Items */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <h3 className="font-bold text-foreground text-sm">المنتجات</h3>
                                <span className="text-xs text-muted-foreground mr-1">({order.order_items?.length || 0})</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-muted/50">
                                        <TableHead className="font-bold text-foreground text-xs">المنتج</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs text-center">الكمية</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs">سعر القطعة</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs">الإجمالي</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(order.order_items || []).map((item: OrderItemWithProduct) => (
                                        <TableRow key={item.id} className="hover:bg-muted/80 transition-colors">
                                            <TableCell className="py-3">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-foreground text-sm truncate">
                                                        {item.product_name || 'منتج'}
                                                    </span>
                                                    {(item.variant_size || item.variant_color) && (
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            {[item.variant_size, item.variant_color].filter(Boolean).join(' - ')}
                                                        </span>
                                                    )}
                                                    {item.variant_sku && (
                                                        <span className="text-xs text-muted-foreground">SKU: {item.variant_sku}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-foreground">{item.quantity}</TableCell>
                                            <TableCell className="text-foreground">{Number(item.unit_price).toLocaleString('ar-EG')} ج.م</TableCell>
                                            <TableCell className="font-bold text-foreground">{Number(item.line_total).toLocaleString('ar-EG')} ج.م</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Linked Rex Cases */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                                <h3 className="font-bold text-foreground text-sm">حالات المرتجع والاستبدال</h3>
                                <span className="text-xs text-muted-foreground mr-1">({rexCases.length})</span>
                            </div>
                        </div>
                        {rexLoading ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                            </div>
                        ) : rexCases.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="bg-accent text-accent-foreground p-4 rounded-full mb-3">
                                    <RotateCcw className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">لا توجد حالات مرتجع أو استبدال</p>
                                <p className="text-xs text-muted-foreground mb-4">يمكنك إنشاء حالة جديدة من هنا</p>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleOpenRex('return')} variant="outline" size="sm" className="gap-1.5 text-xs">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        إنشاء مرتجع
                                    </Button>
                                    <Button onClick={() => handleOpenRex('exchange')} variant="outline" size="sm" className="gap-1.5 text-xs">
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                        إنشاء استبدال
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent bg-muted/50">
                                            <TableHead className="font-bold text-foreground text-xs">رقم الحالة</TableHead>
                                            <TableHead className="font-bold text-foreground text-xs text-center">النوع</TableHead>
                                            <TableHead className="font-bold text-foreground text-xs text-center">الحالة</TableHead>
                                            <TableHead className="font-bold text-foreground text-xs text-center">الاسترداد</TableHead>
                                            <TableHead className="font-bold text-foreground text-xs">التاريخ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rexCases.map((rc) => (
                                            <TableRow key={rc.id} className="hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => navigate('/returns')}>
                                                <TableCell className="font-semibold text-foreground text-sm">
                                                    #{String(rc.id).slice(0, 6).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={cn(
                                                        'text-xs font-medium',
                                                        rc.type === 'return'
                                                            ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                                                    )}>
                                                        {rc.type === 'return' ? 'مرتجع' : 'استبدال'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="text-xs font-medium">
                                                        {rc.status === 'new' ? 'جديد' : rc.status === 'pending' ? 'معلق' : rc.status === 'processing' ? 'قيد المعالجة' : rc.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={cn(
                                                        'text-xs font-medium',
                                                        rc.refund_status === 'processed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400' : ''
                                                    )}>
                                                        {rc.refund_status === 'pending' ? 'معلق' : rc.refund_status === 'processed' ? 'تم' : 'غير مطبق'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(rc.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sidebar (1/3 width) ──────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Financial Summary */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-bold text-foreground text-sm">الملخص المالي</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">إجمالي المنتجات</span>
                                <span className="text-foreground">{Number(order.subtotal).toLocaleString('ar-EG')} ج.م</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">الخصم</span>
                                    <span className="text-red-600 dark:text-red-400">- {Number(order.discount).toLocaleString('ar-EG')} ج.م</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">الشحن</span>
                                <span className="text-foreground">{Number(order.shipping).toLocaleString('ar-EG')} ج.م</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-foreground">الإجمالي النهائي</span>
                                <span className="text-green-700 dark:text-green-400">{Number(order.total).toLocaleString('ar-EG')} ج.م</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-bold text-foreground text-sm">بيانات العميل</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-green-200/50 dark:border-green-800/30">
                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                        {(order.customer_name || '?').charAt(0)}
                                    </span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-foreground text-sm truncate">{order.customer_name}</span>
                                    <span className="text-xs text-muted-foreground" dir="ltr">{order.customer_phone}</span>
                                </div>
                            </div>
                            {order.customer_address && (
                                <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground border border-border">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span>{order.customer_address}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => openWhatsApp(order.customer_phone)} variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30">
                                    <MessageCircle className="w-3 h-3" />
                                    واتساب
                                </Button>
                                <Button onClick={() => copyToClipboard(order.customer_phone, 'رقم الهاتف')} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                                    <Phone className="w-3 h-3" />
                                    نسخ الرقم
                                </Button>
                                {order.customer_address && (
                                    <Button onClick={() => copyToClipboard(order.customer_address, 'العنوان')} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                                        <Copy className="w-3 h-3" />
                                        نسخ العنوان
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <StickyNote className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-bold text-foreground text-sm">ملاحظات</h3>
                        </div>
                        {order.notes ? (
                            <div className="bg-muted rounded-xl p-4 text-sm text-foreground leading-relaxed border border-border">
                                {order.notes}
                            </div>
                        ) : (
                            <div className="bg-muted rounded-xl p-6 text-center border border-border">
                                <p className="text-sm text-muted-foreground">لا توجد ملاحظات على هذا الطلب</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Dialogs ──────────────────────────────────────────────────── */}
            <OrderStatusChangeDialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
                orderId={order.id}
                storeId={profile?.store_id || ''}
                currentStatus={order.status}
                orderDisplayId={displayId}
                onSuccess={() => { fetchOrder(); }}
            />

            {isRexDrawerOpen && (
                <CreateRexFromOrderDrawer
                    open={isRexDrawerOpen}
                    onOpenChange={setIsRexDrawerOpen}
                    order={order}
                    type={rexType}
                    onSuccess={() => { fetchRexCases(); }}
                />
            )}
        </div>
    );
}
