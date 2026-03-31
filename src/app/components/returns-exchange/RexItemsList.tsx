import { RexItem } from '../../types/rex';
import { Package } from 'lucide-react';

interface RexItemsListProps {
    items?: RexItem[];
    language: 'ar' | 'en';
    parentReason?: string | null;
}

const translations = {
    ar: {
        items: 'المنتجات الخاصة بالحالة',
        noItems: 'لا توجد منتجات مسجلة في التفاصيل.',
        quantity: 'الكمية',
        price: 'السعر',
    },
    en: {
        items: 'Included Items',
        noItems: 'No items recorded for this case.',
        quantity: 'Quantity',
        price: 'Price',
    }
};

export function RexItemsList({ items, language, parentReason }: RexItemsListProps) {
    const t = translations[language];
    const isRTL = language === 'ar';

    const formatCurrency = (amount: number) => {
        return isRTL ? `${amount.toLocaleString('ar-EG')} ج.م` : `EGP ${amount.toLocaleString()}`;
    };

    if (!items || items.length === 0) {
        return (
            <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t.items}</h4>
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-center text-muted-foreground text-sm">
                    {t.noItems}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">{t.items}</h4>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                                {item.old_variant?.product?.name || 'منتج'}
                            </p>
                            {item.old_variant && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {[item.old_variant.size, item.old_variant.color].filter(Boolean).join(' - ') || item.old_variant.sku || ''}
                                </p>
                            )}
                            {parentReason && (
                                <p className="text-xs text-rose-600 mt-1 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                                    {parentReason}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {t.quantity}: {item.quantity}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
