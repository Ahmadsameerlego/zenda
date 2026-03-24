import { Menu, Bell, ChevronDown, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface TopbarArabicProps {
  onMenuClick: () => void;
  language: 'ar' | 'en';
  onLanguageToggle: () => void;
  storeName?: string;
}

const translations = {
  ar: {
    storeName: 'متجر الأزياء',
    storeDescription: 'إدارة متجرك بكفاءة',
    profile: 'سارة أحمد',
    email: 'sara@fashionhub.eg',
    profileSettings: 'إعدادات الملف الشخصي',
    storeSettings: 'إعدادات المتجر',
    billing: 'الفواتير',
    signOut: 'تسجيل الخروج',
  },
  en: {
    storeName: 'Fashion Hub Store',
    storeDescription: 'Manage your store efficiently',
    profile: 'Sarah Ahmed',
    email: 'sara@fashionhub.eg',
    profileSettings: 'Profile Settings',
    storeSettings: 'Store Settings',
    billing: 'Billing',
    signOut: 'Sign Out',
  },
};

export function TopbarArabic({ onMenuClick, language, onLanguageToggle, storeName }: TopbarArabicProps) {
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <header
      className={cn(
        'fixed top-0 h-16 bg-white border-b border-gray-200 z-20 transition-all',
        isRTL ? 'right-0 left-0 lg:right-64' : 'right-0 left-0 lg:left-64'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left/Right side (store name) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">{storeName || t.storeName}</h1>
            <p className="text-sm text-gray-500 hidden sm:block">{t.storeDescription}</p>
          </div>
        </div>

        {/* Right/Left side (actions) */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLanguageToggle}
            className="gap-2"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </Button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {language === 'ar' ? 'سا' : 'SA'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-sm text-gray-700">{t.profile}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{t.profile}</p>
                  <p className="text-xs text-gray-500">{t.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t.profileSettings}</DropdownMenuItem>
              <DropdownMenuItem>{t.storeSettings}</DropdownMenuItem>
              <DropdownMenuItem>{t.billing}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">{t.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
