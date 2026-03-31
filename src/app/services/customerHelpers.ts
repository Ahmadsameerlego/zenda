import { CustomerProfile, CustomerListItem, CustomerSegment, RiskLevel } from '../types';

// ─── Segment Labels & Colors ────────────────────────────────────────────────

const segmentLabels: Record<CustomerSegment, string> = {
    new: 'جديد',
    returning: 'متكرر',
    loyal: 'وفي',
    vip: 'VIP',
    prospect: 'غير مكتمل',
    at_risk: 'معرض للفقد',
};

const segmentColors: Record<CustomerSegment, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    returning: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    loyal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    vip: 'bg-amber-50 text-amber-800 border-amber-300',
    prospect: 'bg-muted text-muted-foreground border-border',
    at_risk: 'bg-orange-50 text-orange-700 border-orange-200',
};

const segmentIcons: Record<CustomerSegment, string> = {
    new: '✦',
    returning: '↻',
    loyal: '♛',
    vip: '★',
    prospect: '◇',
    at_risk: '⚠',
};

export function getSegmentLabel(segment: CustomerSegment): string {
    return segmentLabels[segment] || segment;
}

export function getSegmentColor(segment: CustomerSegment): string {
    return segmentColors[segment] || 'bg-muted text-gray-700 border-border';
}

export function getSegmentIcon(segment: CustomerSegment): string {
    return segmentIcons[segment] || '';
}

// ─── Risk Labels & Colors ───────────────────────────────────────────────────

const riskLabels: Record<RiskLevel, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'مرتفع',
};

const riskColors: Record<RiskLevel, string> = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-orange-50 text-orange-700 border-orange-200',
    high: 'bg-red-50 text-red-700 border-red-200',
};

export function getRiskLabel(level: RiskLevel): string {
    return riskLabels[level] || level;
}

export function getRiskColor(level: RiskLevel): string {
    return riskColors[level] || 'bg-muted text-gray-700 border-border';
}

// ─── Score Display ──────────────────────────────────────────────────────────

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score >= 20) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    if (score >= 40) return 'متوسط';
    if (score >= 20) return 'ضعيف';
    return 'ضعيف جدًا';
}

// ─── Formatting ─────────────────────────────────────────────────────────────

export function formatEGP(amount: number): string {
    return `${Number(amount).toLocaleString('ar-EG')} ج.م`;
}

export function formatRelativeDays(days: number | null): string {
    if (days === null || days === undefined) return '—';
    if (days === 0) return 'اليوم';
    if (days === 1) return 'منذ يوم';
    if (days <= 10) return `منذ ${days} أيام`;
    return `منذ ${days} يوم`;
}

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// ─── Insights Generator ─────────────────────────────────────────────────────

interface Insight {
    text: string;
    type: 'positive' | 'warning' | 'info' | 'danger';
    icon: string;
}

export function generateInsights(customer: CustomerProfile): Insight[] {
    const insights: Insight[] = [];

    // Backend-driven segment insights
    if (customer.segment === 'at_risk') {
        insights.push({
            text: 'هذا العميل لم يطلب منذ فترة وقد يكون معرضًا للفقد.',
            type: 'warning',
            icon: '⚠️',
        });
    }

    if (customer.segment === 'prospect') {
        insights.push({
            text: 'هذا العميل لم يكمل أي طلب ناجح بعد.',
            type: 'info',
            icon: '◇',
        });
    }

    // Positive: returning customer
    if (customer.total_orders_count > 1 && (customer.segment === 'returning' || customer.segment === 'loyal' || customer.segment === 'vip')) {
        insights.push({
            text: 'هذا العميل عاد للشراء أكثر من مرة.',
            type: 'positive',
            icon: '🔁',
        });
    }

    // Warning: inactive
    if (customer.days_since_last_delivered !== null && customer.days_since_last_delivered >= 45) {
        insights.push({
            text: `لم يطلب منذ ${customer.days_since_last_delivered} يومًا أو أكثر.`,
            type: 'warning',
            icon: '⏳',
        });
    }

    // Danger: bad orders
    const cancelRate = customer.total_orders_count > 0 ? (customer.cancelled_orders_count / customer.total_orders_count) * 100 : 0;
    if (cancelRate > 30 || customer.bad_orders_count >= 2) {
        insights.push({
            text: 'نسبة الإلغاء أو المرتجع لدى هذا العميل مرتفعة.',
            type: 'danger',
            icon: '🚫',
        });
    }

    // Info: new customer
    if (customer.segment === 'new') {
        insights.push({
            text: 'هذا العميل لا يزال جديدًا ويحتاج تجربة شراء ممتازة.',
            type: 'info',
            icon: '🌟',
        });
    }

    // Positive: VIP
    if (customer.segment === 'vip') {
        insights.push({
            text: 'العميل من الأعلى قيمة في متجرك.',
            type: 'positive',
            icon: '👑',
        });
    }

    // At risk
    if (customer.risk_level === 'high') {
        insights.push({
            text: 'هذا العميل عالي الخطورة ويحتاج متابعة خاصة.',
            type: 'danger',
            icon: '⚠️',
        });
    }

    return insights.slice(0, 5);
}

// ─── Recommendations Generator ──────────────────────────────────────────────

interface Recommendation {
    text: string;
    type: 'reactivation' | 'caution' | 'reward' | 'nurture';
    icon: string;
}

export function generateRecommendations(customer: CustomerProfile): Recommendation[] {
    const recs: Recommendation[] = [];

    if (customer.segment === 'at_risk' || customer.risk_level === 'high') {
        recs.push({
            text: 'فكّر في إرسال عرض لإعادة التفعيل',
            type: 'reactivation',
            icon: '🎯',
        });
    }

    const cancelRate = customer.total_orders_count > 0 ? (customer.cancelled_orders_count / customer.total_orders_count) * 100 : 0;
    const returnRate = customer.total_orders_count > 0 ? (customer.returned_orders_count / customer.total_orders_count) * 100 : 0;

    if (cancelRate > 30 || customer.bad_orders_count >= 2) {
        recs.push({
            text: 'يفضل تأكيد الطلب يدويًا قبل الشحن',
            type: 'caution',
            icon: '📋',
        });
    }

    if (returnRate > 30) {
        recs.push({
            text: 'راجع تفاصيل المنتج أو المقاس معه قبل الشحن',
            type: 'caution',
            icon: '📐',
        });
    }

    if (customer.segment === 'vip') {
        recs.push({
            text: 'قدّم له معاملة مميزة أو عرض خاص',
            type: 'reward',
            icon: '🎁',
        });
    }

    if (customer.segment === 'new') {
        recs.push({
            text: 'ركز على أول تجربة شراء ممتازة',
            type: 'nurture',
            icon: '🌱',
        });
    }

    if (customer.segment === 'returning' || customer.segment === 'loyal') {
        recs.push({
            text: 'هذا العميل مناسب لعروض إعادة الشراء',
            type: 'reward',
            icon: '🔄',
        });
    }

    return recs.slice(0, 4);
}

// ─── Status Helpers (for order status badges) ───────────────────────────────

export const orderStatusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    New: 'جديد',
    Processing: 'قيد المعالجة',
    Shipped: 'تم الشحن',
    Delivered: 'تم التوصيل',
    Cancelled: 'ملغي',
    Returned: 'مرتجع',
};

export const orderStatusColors: Record<string, string> = {
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
    Returned: 'bg-accent text-accent-foreground text-gray-700 border-border',
};
