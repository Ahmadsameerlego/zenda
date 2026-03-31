import { NavLink } from 'react-router';
import { LayoutDashboard, ShoppingCart, Package, RefreshCw, Users, ChevronLeft, ChevronRight, Tag, Award, UserCheck } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarArabicProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  language: 'ar' | 'en';
}

const navItems = {
  ar: [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/' },
    { icon: ShoppingCart, label: 'الطلبات', path: '/orders' },
    { icon: Package, label: 'المنتجات', path: '/products' },
    { icon: UserCheck, label: 'العملاء', path: '/customers' },
    { icon: Tag, label: 'التصنيفات', path: '/categories' },
    { icon: Award, label: 'البراندات', path: '/brands' },
    { icon: RefreshCw, label: 'المرتجعات والاستبدال', path: '/returns' },
    { icon: Users, label: 'الفريق', path: '/team' },
    { icon: LayoutDashboard, label: 'إعدادات المتجر', path: '/settings' },
  ],
  en: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: UserCheck, label: 'Customers', path: '/customers' },
    { icon: Tag, label: 'Categories', path: '/categories' },
    { icon: Award, label: 'Brands', path: '/brands' },
    { icon: RefreshCw, label: 'Returns / Exchanges', path: '/returns' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: LayoutDashboard, label: 'Store Settings', path: '/settings' },
  ],
};

export function SidebarArabic({ isOpen, onToggle, onClose, language }: SidebarArabicProps) {
  const items = navItems[language];
  const isRTL = language === 'ar';

  return (
    <aside
      className={cn(
        'fixed top-0 h-full bg-background border-border transition-all duration-300 z-30',
        isRTL ? 'right-0 border-l' : 'left-0 border-r',
        isOpen ? 'w-64' : 'w-20'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-border">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="font-semibold text-foreground">Zenda</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-accent rounded-lg transition-colors hidden lg:flex items-center justify-center text-muted-foreground hover:text-accent-foreground"
        >
          {isOpen ? (
            isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          ) : (
            isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-green-600 dark:text-green-500')} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
