import { RexCase, RexStatus, RexRefundStatus } from '../../types/rex';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RexActionBarProps {
    rexCase: RexCase;
    language: 'ar' | 'en';
    onUpdateStatus: (caseId: string, status: RexStatus) => Promise<void>;
    onUpdateRefund: (caseId: string, status: RexRefundStatus) => Promise<void>;
    onSuccess: () => void;
}

const translations = {
    ar: {
        startProcessing: 'بدء المعالجة',
        completeCase: 'إغلاق ومكتمل',
        cancelCase: 'إلغاء الحالة',
        markRefundProcessed: 'تم الاسترداد',
    },
    en: {
        startProcessing: 'Start Processing',
        completeCase: 'Complete Case',
        cancelCase: 'Cancel Case',
        markRefundProcessed: 'Mark Refund Processed',
    }
};

export function RexActionBar({ rexCase, language, onUpdateStatus, onUpdateRefund, onSuccess }: RexActionBarProps) {
    const t = translations[language];
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleAction = async (actionId: string, action: () => Promise<void>) => {
        try {
            setLoadingAction(actionId);
            await action();
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(null);
        }
    };

    const isReturn = rexCase.type === 'return';

    return (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
            {rexCase.status === 'new' && (
                <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!!loadingAction}
                    onClick={() => handleAction('start', () => onUpdateStatus(rexCase.id, 'processing'))}
                >
                    {loadingAction === 'start' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.startProcessing}
                </Button>
            )}

            {rexCase.status === 'processing' && (
                <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!!loadingAction}
                    onClick={() => handleAction('complete', () => onUpdateStatus(rexCase.id, 'completed'))}
                >
                    {loadingAction === 'complete' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.completeCase}
                </Button>
            )}

            {isReturn && rexCase.refund_status === 'pending' && (
                <Button
                    variant="outline"
                    disabled={!!loadingAction}
                    onClick={() => handleAction('refund', () => onUpdateRefund(rexCase.id, 'processed'))}
                >
                    {loadingAction === 'refund' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.markRefundProcessed}
                </Button>
            )}

            {(rexCase.status === 'new' || rexCase.status === 'pending') && (
                <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    disabled={!!loadingAction}
                    onClick={() => handleAction('cancel', () => onUpdateStatus(rexCase.id, 'cancelled'))}
                >
                    {loadingAction === 'cancel' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.cancelCase}
                </Button>
            )}
        </div>
    );
}
