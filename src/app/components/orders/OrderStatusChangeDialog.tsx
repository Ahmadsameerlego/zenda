import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { ORDER_STATUSES, getOrderStatusOption, getOrderStatusBadgeClasses } from '../../types/order';
import { OrdersService } from '../../services/orders';
import { toast } from 'sonner';

interface OrderStatusChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    storeId: string;
    currentStatus: string;
    orderDisplayId: string;
    onSuccess: () => void;
}

export function OrderStatusChangeDialog({
    open,
    onOpenChange,
    orderId,
    storeId,
    currentStatus,
    orderDisplayId,
    onSuccess,
}: OrderStatusChangeDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (selectedStatus === currentStatus) {
            onOpenChange(false);
            return;
        }

        try {
            setIsSubmitting(true);
            await OrdersService.updateOrderStatus(orderId, selectedStatus, storeId);
            toast.success(`تم تحديث حالة الطلب ${orderDisplayId} بنجاح`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error updating order status:', err);
            toast.error(err?.message || 'حدث خطأ أثناء تحديث الحالة');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentOption = getOrderStatusOption(currentStatus);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent dir="rtl" className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-right text-lg">
                        تغيير حالة الطلب {orderDisplayId}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                        <span className="flex items-center gap-2 mt-2">
                            الحالة الحالية:
                            <Badge variant="outline" className={getOrderStatusBadgeClasses(currentStatus)}>
                                {currentOption.label}
                            </Badge>
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-2 gap-2 py-4">
                    {ORDER_STATUSES.map((status) => {
                        const isSelected = selectedStatus === status.value;
                        const isCurrent = currentStatus === status.value;
                        return (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                disabled={isCurrent}
                                className={`
                                    flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium
                                    transition-all text-right
                                    ${isSelected
                                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 dark:border-green-700 ring-1 ring-green-500/30'
                                        : isCurrent
                                            ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                            : 'border-border bg-card text-foreground hover:bg-muted hover:border-border'
                                    }
                                `}
                            >
                                <span className="text-base">{status.icon}</span>
                                <span>{status.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
                    <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedStatus === currentStatus}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري التحديث...
                            </>
                        ) : (
                            'تأكيد التغيير'
                        )}
                    </AlertDialogAction>
                    <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
