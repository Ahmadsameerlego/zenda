import { RefreshCw, PackageX, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { RexCase } from '../../types/rex';
import { StatCard } from '../StatCard';

interface RexSummaryCardsProps {
    cases: RexCase[];
    language: 'ar' | 'en';
}

export function RexSummaryCards({ cases, language }: RexSummaryCardsProps) {
    const isRTL = language === 'ar';

    const total = cases.length;
    const processing = cases.filter(c => c.status === 'processing').length;
    const completed = cases.filter(c => c.status === 'completed').length;

    // Example complex stat: items needing fast attention
    const newCases = cases.filter(c => c.status === 'new').length;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <StatCard
                title={isRTL ? 'إجمالي الحالات' : 'Total Cases'}
                value={total.toString()}
                icon={<RefreshCw className="w-5 h-5 text-blue-600" />}
                trend={null}
            />
            <StatCard
                title={isRTL ? 'طلبات جديدة' : 'New Requests'}
                value={newCases.toString()}
                icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
                trend={null}
            />
            <StatCard
                title={isRTL ? 'قيد المعالجة' : 'Processing'}
                value={processing.toString()}
                icon={<Activity className="w-5 h-5 text-yellow-600" />}
                trend={null}
            />
            <StatCard
                title={isRTL ? 'المكتملة' : 'Completed'}
                value={completed.toString()}
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                trend={null}
            />
        </div>
    );
}
