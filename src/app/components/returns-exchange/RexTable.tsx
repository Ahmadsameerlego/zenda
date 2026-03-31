import { RexCase } from '../../types/rex';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { RexEmptyState } from './RexEmptyState';
import { RexStatusBadge, RexRefundBadge } from './RexStatusBadge';
import { RexTypeBadge } from './RexTypeBadge';

interface RexTableProps {
    cases: RexCase[];
    loading: boolean;
    language: 'ar' | 'en';
    hasFilters: boolean;
    onRowClick: (rexCase: RexCase) => void;
}

const translations = {
    ar: {
        caseId: 'رقم الحالة',
        type: 'النوع',
        customer: 'العميل',
        reason: 'السبب',
        status: 'الحالة',
        refundStatus: 'حالة الاسترداد',
        value: 'القيمة',
        created: 'تاريخ الإنشاء',
    },
    en: {
        caseId: 'Case ID',
        type: 'Type',
        customer: 'Customer',
        reason: 'Reason',
        status: 'Status',
        refundStatus: 'Refund Status',
        value: 'Value',
        created: 'Created',
    }
};

export function RexTable({ cases, loading, language, hasFilters, onRowClick }: RexTableProps) {
    const isRTL = language === 'ar';
    const t = translations[language];

    // Format relative time identical to Orders page
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

    const formatCurrency = (amount: number) => {
        return isRTL ? `${amount.toLocaleString('ar-EG')} ج.م` : `EGP ${amount.toLocaleString()}`;
    };

    if (loading) {
        // Skeletons could go here
        return (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
            </div>
        );
    }

    if (cases.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <RexEmptyState language={language} hasFilters={hasFilters} />
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border">
                            <TableHead className="font-semibold px-4">{t.caseId}</TableHead>
                            <TableHead className="font-semibold">{t.type}</TableHead>
                            <TableHead className="font-semibold">{t.customer}</TableHead>
                            <TableHead className="font-semibold">{t.reason}</TableHead>
                            <TableHead className="font-semibold">{t.status}</TableHead>
                            <TableHead className="font-semibold">{t.refundStatus}</TableHead>
                            <TableHead className="font-semibold">{t.value}</TableHead>
                            <TableHead className="font-semibold px-4">{t.created}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cases.map((c) => (
                            <TableRow
                                key={c.id}
                                className="hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => onRowClick(c)}
                            >
                                <TableCell className="font-semibold text-foreground px-4">
                                    #{String(c.id).slice(0, 6).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <RexTypeBadge type={c.type} language={language} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{c.customer_name}</span>
                                        <span className="text-xs text-muted-foreground" dir="ltr">{c.customer_phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground truncate max-w-[150px]">
                                    {c.reason || '—'}
                                </TableCell>
                                <TableCell>
                                    <RexStatusBadge status={c.status} language={language} />
                                </TableCell>
                                <TableCell>
                                    <RexRefundBadge status={c.refund_status} language={language} />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        {c.type === 'return' && c.refund_amount > 0 && (
                                            <span className="text-amber-600">{formatCurrency(c.refund_amount)}</span>
                                        )}
                                        {c.type === 'exchange' && c.exchange_diff !== 0 && (
                                            <span className={c.exchange_diff > 0 ? "text-green-600" : "text-rose-600"}>
                                                {c.exchange_diff > 0 ? '+' : ''}{formatCurrency(c.exchange_diff)}
                                            </span>
                                        )}
                                        {(c.type === 'exchange' && c.exchange_diff === 0) || (c.type === 'return' && !c.refund_amount) ? (
                                            <span className="text-muted-foreground">—</span>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground px-4">
                                    {formatRelativeTime(c.created_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
