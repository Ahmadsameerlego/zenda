import { RexCase, RexStatus, RexRefundStatus } from '../../types/rex';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { RexStatusBadge, RexRefundBadge } from './RexStatusBadge';
import { RexTypeBadge } from './RexTypeBadge';
import { RexItemsList } from './RexItemsList';
import { RexActionBar } from './RexActionBar';
import { MapPin, Phone, CreditCard, CalendarClock } from 'lucide-react';
import { rexService } from '../../services/rexService';
import { toast } from 'sonner';

interface RexDetailsDrawerProps {
    rexCase: RexCase | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    language: 'ar' | 'en';
    onSuccess: () => void;
}

const translations = {
    ar: {
        detailsTitle: 'تفاصيل الحالة',
        linkedOrder: 'الطلب الأصلي',
        customerInfo: 'بيانات العميل',
        caseInfo: 'بيانات الحالة',
        reason: 'السبب الأساسي',
        notes: 'ملاحظات',
        amount: 'المبلغ المسترد / الفرق',
    },
    en: {
        detailsTitle: 'Case Details',
        linkedOrder: 'Linked Order',
        customerInfo: 'Customer Info',
        caseInfo: 'Case Info',
        reason: 'Primary Reason',
        notes: 'Notes',
        amount: 'Refund / Diff Amount',
    }
};

export function RexDetailsDrawer({ rexCase, open, onOpenChange, language, onSuccess }: RexDetailsDrawerProps) {
    const isRTL = language === 'ar';
    const t = translations[language];

    if (!rexCase) return null;

    const handleUpdateStatus = async (caseId: string, status: RexStatus) => {
        try {
            await rexService.updateStatus(caseId, status);
            toast.success(isRTL ? 'تم تحديث حالة الطلب بنجاح' : 'Case status updated successfully');
        } catch (err) {
            toast.error(isRTL ? 'حدث خطأ أثناء تحديث الحالة' : 'Error updating status');
            throw err;
        }
    };

    const handleUpdateRefund = async (caseId: string, status: RexRefundStatus) => {
        try {
            await rexService.updateRefundStatus(caseId, status);
            toast.success(isRTL ? 'تم تحديث حالة الاسترداد بنجاح' : 'Refund status updated successfully');
        } catch (err) {
            toast.error(isRTL ? 'حدث خطأ أثناء تحديث حالة الاسترداد' : 'Error updating refund status');
            throw err;
        }
    };

    const formatCurrency = (amount: number) => {
        return isRTL ? `${amount.toLocaleString('ar-EG')} ج.م` : `EGP ${amount.toLocaleString()}`;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                <SheetHeader className="pb-6 border-b border-border">
                    <SheetTitle className="text-xl">{t.detailsTitle} #{String(rexCase.id).slice(0, 6).toUpperCase()}</SheetTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <RexTypeBadge type={rexCase.type} language={language} />
                        <RexStatusBadge status={rexCase.status} language={language} />
                        <RexRefundBadge status={rexCase.refund_status} language={language} />
                    </div>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Linked Order & Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">{t.customerInfo}</h4>
                        <div className="grid grid-cols-1 gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <span className="font-semibold text-sm">{rexCase.customer_name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">{rexCase.customer_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Phone className="w-4 h-4 shrink-0" />
                                <span dir="ltr">{rexCase.customer_phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">{t.caseInfo}</h4>
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-border">
                                <span className="text-muted-foreground">{t.linkedOrder}</span>
                                <span className="font-medium">#{String(rexCase.order_id).slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border">
                                <span className="text-muted-foreground">{t.reason}</span>
                                <span className="font-medium">{rexCase.reason || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border">
                                <span className="text-muted-foreground">{t.amount}</span>
                                <span className="font-medium">
                                    {rexCase.type === 'return' ? formatCurrency(rexCase.refund_amount) : formatCurrency(rexCase.exchange_diff)}
                                </span>
                            </div>
                        </div>

                        {rexCase.notes && (
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-sm mt-2 border border-amber-200">
                                <strong className="block mb-1 text-xs">{t.notes}:</strong>
                                {rexCase.notes}
                            </div>
                        )}
                    </div>

                    <RexItemsList items={rexCase.items} language={language} />

                    <RexActionBar
                        rexCase={rexCase}
                        language={language}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateRefund={handleUpdateRefund}
                        onSuccess={onSuccess}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
