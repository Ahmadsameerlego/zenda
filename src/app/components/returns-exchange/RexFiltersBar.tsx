import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RexFilters, RexStatus, RexType, RexRefundStatus } from '../../types/rex';

interface RexFiltersBarProps {
    filters: RexFilters;
    updateFilter: <K extends keyof RexFilters>(key: K, value: RexFilters[K]) => void;
    language: 'ar' | 'en';
}

const translations = {
    ar: {
        searchPlaceholder: 'ابحث برقم الطلب أو اسم العميل أو الهاتف',
        type: 'نوع الحالة',
        allTypes: 'كل الأنواع',
        return: 'مرتجع',
        exchange: 'استبدال',
        status: 'الحالة',
        allStatus: 'كل الحالات',
        new: 'جديد',
        pending: 'قيد الانتظار',
        processing: 'قيد المعالجة',
        completed: 'مكتملة',
        cancelled: 'ملغي',
        refundStatus: 'حالة الاسترداد',
        allRefunds: 'كل حالات الاسترداد',
        refundPending: 'معلق',
        refundProcessed: 'تم',
        notApplicable: 'لا ينطبق',
        dateRange: 'الفترة',
        allTime: 'كل الأوقات',
        today: 'اليوم',
        last7Days: 'آخر 7 أيام',
        thisMonth: 'هذا الشهر',
    },
    en: {
        searchPlaceholder: 'Search Order ID, Customer Name, or Phone',
        type: 'Type',
        allTypes: 'All Types',
        return: 'Return',
        exchange: 'Exchange',
        status: 'Status',
        allStatus: 'All Statuses',
        new: 'New',
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        refundStatus: 'Refund Status',
        allRefunds: 'All Refunds',
        refundPending: 'Pending',
        refundProcessed: 'Processed',
        notApplicable: 'N/A',
        dateRange: 'Date Range',
        allTime: 'All Time',
        today: 'Today',
        last7Days: 'Last 7 Days',
        thisMonth: 'This Month',
    }
};

export function RexFiltersBar({ filters, updateFilter, language }: RexFiltersBarProps) {
    const isRTL = language === 'ar';
    const t = translations[language];

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                        placeholder={t.searchPlaceholder}
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className={isRTL ? 'pr-10' : 'pl-10'}
                    />
                </div>

                {/* Type Filter */}
                <Select value={filters.type} onValueChange={(val: RexType | 'all') => updateFilter('type', val)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t.type} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.allTypes}</SelectItem>
                        <SelectItem value="return">{t.return}</SelectItem>
                        <SelectItem value="exchange">{t.exchange}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={filters.status} onValueChange={(val: RexStatus | 'all') => updateFilter('status', val)}>
                    <SelectTrigger>
                        <Filter className="w-4 h-4 mx-2 text-muted-foreground" />
                        <SelectValue placeholder={t.status} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.allStatus}</SelectItem>
                        <SelectItem value="new">{t.new}</SelectItem>
                        <SelectItem value="pending">{t.pending}</SelectItem>
                        <SelectItem value="processing">{t.processing}</SelectItem>
                        <SelectItem value="completed">{t.completed}</SelectItem>
                        <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={filters.date_range} onValueChange={(val: any) => updateFilter('date_range', val)}>
                    <SelectTrigger>
                        <Calendar className="w-4 h-4 mx-2 text-muted-foreground" />
                        <SelectValue placeholder={t.dateRange} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.allTime}</SelectItem>
                        <SelectItem value="today">{t.today}</SelectItem>
                        <SelectItem value="last_7_days">{t.last7Days}</SelectItem>
                        <SelectItem value="this_month">{t.thisMonth}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
