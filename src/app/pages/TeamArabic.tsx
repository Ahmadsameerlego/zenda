const translations = {
  ar: {
    team: 'الفريق',
    description: 'إدارة أعضاء الفريق والصلاحيات',
    comingSoon: 'قريباً...',
  },
  en: {
    team: 'Team',
    description: 'Manage your team members and permissions',
    comingSoon: 'Coming soon...',
  },
};

interface TeamArabicProps {
  language: 'ar' | 'en';
}

export function TeamArabic({ language }: TeamArabicProps) {
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t.team}</h1>
        <p className="text-gray-500 mt-1">{t.description}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-500">{t.comingSoon}</p>
      </div>
    </div>
  );
}
