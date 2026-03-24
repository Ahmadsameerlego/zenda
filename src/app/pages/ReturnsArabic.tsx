const translations = {
  ar: {
    returns: 'المرتجعات والاستبدال',
    description: 'إدارة مرتجعات واستبدالات العملاء',
    comingSoon: 'قريباً...',
  },
  en: {
    returns: 'Returns / Exchanges',
    description: 'Handle customer returns and exchanges',
    comingSoon: 'Coming soon...',
  },
};

interface ReturnsArabicProps {
  language: 'ar' | 'en';
}

export function ReturnsArabic({ language }: ReturnsArabicProps) {
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t.returns}</h1>
        <p className="text-gray-500 mt-1">{t.description}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-500">{t.comingSoon}</p>
      </div>
    </div>
  );
}
