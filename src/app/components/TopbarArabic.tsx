import { Menu, ChevronDown, Languages } from 'lucide-react';
import { cn } from './ui/utils';
import { NotificationDropdown } from './NotificationDropdown';
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
import { ThemeToggle } from './ThemeToggle';

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
        'fixed top-0 h-16 bg-background border-b border-border z-20 transition-all duration-200',
        isRTL ? 'right-0 left-0 lg:right-64' : 'right-0 left-0 lg:left-64'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left/Right side (store name) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">{storeName || t.storeName}</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">{t.storeDescription}</p>
          </div>
        </div>

        {/* Right/Left side (actions) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

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
          <NotificationDropdown language={language} />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1 transition-colors">
                <Avatar className="w-9 h-9 border border-border">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {language === 'ar' ? 'سا' : 'SA'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-sm text-foreground">{t.profile}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-foreground">{t.profile}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
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


