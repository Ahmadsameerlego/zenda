import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Loader2, RotateCcw, ArrowLeftRight, AlertCircle, Package } from 'lucide-react';
import { OrderDetails, OrderItemWithProduct } from '../../types/order';
import { CreateRexPayload, RexType } from '../../types/rex';
import { rexService } from '../../services/rexService';
import { useAuth } from '../../context/AuthProvider';
import { toast } from 'sonner';

interface CreateRexFromOrderDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: OrderDetails;
    type: RexType;
    onSuccess: () => void;
}

interface SelectedItem {
    checked: boolean;
    quantity: number;
}

export function CreateRexFromOrderDrawer({
    open,
    onOpenChange,
    order,
    type,
    onSuccess,
}: CreateRexFromOrderDrawerProps) {
    const { profile } = useAuth();
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Track selected items
    const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>(() => {
        const initial: Record<string, SelectedItem> = {};
        (order.order_items || []).forEach((item) => {
            initial[item.id] = { checked: false, quantity: 1 };
        });
        return initial;
    });

    const isReturn = type === 'return';
    const typeLabel = isReturn ? 'مرتجع' : 'استبدال';
    const displayId = `#${String(order.id).slice(0, 6).toUpperCase()}`;

    const checkedItems = useMemo(() => {
        return (order.order_items || []).filter(item => selectedItems[item.id]?.checked);
    }, [order.order_items, selectedItems]);

    const totalRefund = useMemo(() => {
        return checkedItems.reduce((sum, item) => {
            const qty = selectedItems[item.id]?.quantity || 0;
            return sum + (qty * item.unit_price);
        }, 0);
    }, [checkedItems, selectedItems]);

    const toggleItem = (itemId: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], checked: !prev[itemId]?.checked },
        }));
        // Clear item error
        setErrors(prev => { const next = { ...prev }; delete next[`item_${itemId}`]; return next; });
    };

    const updateQuantity = (itemId: string, qty: number) => {
        const item = order.order_items?.find(i => i.id === itemId);
        const maxQty = item?.quantity || 1;
        const clampedQty = Math.max(1, Math.min(qty, maxQty));
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], quantity: clampedQty },
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (checkedItems.length === 0) {
            newErrors.items = 'يجب اختيار منتج واحد على الأقل';
        }

        checkedItems.forEach(item => {
            const qty = selectedItems[item.id]?.quantity || 0;
            if (qty < 1) {
                newErrors[`item_${item.id}`] = 'الكمية يجب أن تكون 1 على الأقل';
            }
            if (qty > item.quantity) {
                newErrors[`item_${item.id}`] = `الكمية لا يمكن أن تتجاوز ${item.quantity}`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!profile?.store_id) return;

        const payload: CreateRexPayload = {
            store_id: profile.store_id,
            order_id: order.id,
            type,
            reason: reason || null,
            notes: notes || null,
            difference_amount: isReturn ? totalRefund : 0,
            items: checkedItems.map(item => ({
                store_id: profile.store_id,
                old_variant_id: item.variant_id,
                quantity: selectedItems[item.id]?.quantity || 1,
            })),
        };

        try {
            setIsSubmitting(true);
            await rexService.createCase(payload);
            toast.success(`تم إنشاء حالة ${typeLabel} بنجاح`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error creating rex case:', err);
            toast.error(err?.message || `حدث خطأ أثناء إنشاء حالة ${typeLabel}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-2xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden"
                dir="rtl"
                aria-describedby="create-rex-description"
            >
                <div id="create-rex-description" className="sr-only">
                    نموذج إنشاء حالة {typeLabel} من الطلب {displayId}
                </div>

                <DialogHeader className="p-6 border-b shrink-0 text-right space-y-0">
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isReturn ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                            {isReturn ? <RotateCcw className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                        </div>
                        إنشاء {typeLabel} — {displayId}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-muted rounded-xl p-4 border border-border">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">رقم الطلب</span>
                                    <span className="font-semibold text-foreground">{displayId}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">العميل</span>
                                    <span className="font-semibold text-foreground">{order.customer_name}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">الهاتف</span>
                                    <span className="font-semibold text-foreground" dir="ltr">{order.customer_phone}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">الإجمالي</span>
                                    <span className="font-semibold text-foreground">{Number(order.total).toLocaleString('ar-EG')} ج.م</span>
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2 text-right">
                            <Label className="text-foreground text-right block">سبب {typeLabel}</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={`...سبب ${typeLabel}`}
                                className="h-10 text-right"
                                dir="rtl"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 text-right">
                            <Label className="text-foreground text-right block">ملاحظات (اختياري)</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="...ملاحظات إضافية"
                                className="h-20 text-right"
                                dir="rtl"
                            />
                        </div>

                        <Separator />

                        {/* Items Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <Label className="text-foreground font-semibold text-right">المنتجات المتأثرة</Label>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {checkedItems.length} / {order.order_items?.length || 0} منتجات محددة
                                </Badge>
                            </div>

                            {errors.items && (
                                <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.items}
                                </p>
                            )}

                            <div className="space-y-2">
                                {(order.order_items || []).map((item: OrderItemWithProduct) => {
                                    const sel = selectedItems[item.id];
                                    const isChecked = sel?.checked || false;
                                    const qty = sel?.quantity || 1;
                                    const itemError = errors[`item_${item.id}`];

                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-xl border p-4 transition-all ${
                                                isChecked
                                                    ? 'border-green-300 bg-green-50/30 dark:border-green-700 dark:bg-green-950/20'
                                                    : 'border-border bg-card hover:border-border'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => toggleItem(item.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-foreground text-sm">
                                                                {item.product_name || 'منتج'}
                                                            </p>
                                                            {(item.variant_size || item.variant_color) && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {[item.variant_size, item.variant_color].filter(Boolean).join(' - ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-medium text-foreground">{Number(item.unit_price).toLocaleString('ar-EG')} ج.م</p>
                                                            <p className="text-xs text-muted-foreground">الكمية المطلوبة: {item.quantity}</p>
                                                        </div>
                                                    </div>

                                                    {isChecked && (
                                                        <div className="mt-3 flex items-center gap-3">
                                                            <Label className="text-xs text-muted-foreground">كمية {typeLabel}:</Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={item.quantity}
                                                                value={qty}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                className="w-20 h-8 text-center text-sm"
                                                            />
                                                            <span className="text-xs text-muted-foreground">من {item.quantity}</span>
                                                        </div>
                                                    )}

                                                    {itemError && (
                                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {itemError}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Refund Summary (Return only) */}
                        {isReturn && checkedItems.length > 0 && (
                            <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">إجمالي المبلغ المسترد</span>
                                    <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                                        {totalRefund.toLocaleString('ar-EG')} ج.م
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-6 border-t bg-card space-y-3 shrink-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || checkedItems.length === 0}
                        className={`w-full h-11 text-base gap-2 shadow-md ${
                            isReturn
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري الإنشاء...
                            </>
                        ) : (
                            <>
                                {isReturn ? <RotateCcw className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                                إنشاء {typeLabel}
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-11 text-base border-border text-foreground"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
