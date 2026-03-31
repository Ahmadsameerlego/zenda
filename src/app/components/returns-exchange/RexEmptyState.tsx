import { RefreshCw } from 'lucide-react';

const translations = {
    ar: {
        noDataTitle: 'لا توجد حالات حتى الآن',
        noDataDescription: 'ستظهر هنا كل حالات المرتجع والاستبدال الخاصة بمتجرك',
    },
    en: {
        noDataTitle: 'No cases yet',
        noDataDescription: 'All return and exchange cases for your store will appear here',
    }
};

export function RexEmptyState({ language, hasFilters }: { language: 'ar' | 'en', hasFilters?: boolean }) {
    const t = translations[language];

    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <RefreshCw className="w-12 h-12 text-muted mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                    {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                </h3>
                <p>
                    {language === 'ar' ? 'جرب تغيير فلاتر البحث للعثور على ما تبحث عنه' : 'Try changing your search filters to find what you are looking for'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <RefreshCw className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">{t.noDataTitle}</h3>
            <p>{t.noDataDescription}</p>
        </div>
    );
}
