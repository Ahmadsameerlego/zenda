import { Badge } from '../ui/badge';
import { RexStatus, RexRefundStatus } from '../../types/rex';

const statusTranslations = {
    ar: {
        new: 'جديد',
        pending: 'قيد الانتظار',
        processing: 'قيد المعالجة',
        completed: 'مكتملة',
        cancelled: 'ملغي',
    },
    en: {
        new: 'New',
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
    }
};

const refundStatusTranslations = {
    ar: {
        pending: 'استرداد معلق',
        processed: 'تم الاسترداد',
        not_applicable: 'لا ينطبق'
    },
    en: {
        pending: 'Refund Pending',
        processed: 'Refund Processed',
        not_applicable: 'N/A'
    }
}

const statusColors: Record<RexStatus, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const refundColors: Record<RexRefundStatus, string> = {
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    processed: 'bg-green-50 text-green-700 border-green-200',
    not_applicable: 'bg-muted text-muted-foreground border-border',
};

export function RexStatusBadge({ status, language }: { status: RexStatus; language: 'ar' | 'en' }) {
    const label = statusTranslations[language][status] || status;
    const colorClass = statusColors[status] || 'bg-muted text-gray-700 border-border';

    return (
        <Badge variant="outline" className={colorClass}>
            {label}
        </Badge>
    );
}

export function RexRefundBadge({ status, language }: { status: RexRefundStatus; language: 'ar' | 'en' }) {
    if (status === 'not_applicable') return null;
    const label = refundStatusTranslations[language][status] || status;
    const colorClass = refundColors[status] || 'bg-muted text-gray-700 border-border';

    return (
        <Badge variant="outline" className={colorClass}>
            {label}
        </Badge>
    );
}
