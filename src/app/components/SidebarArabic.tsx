import { NavLink } from 'react-router';
import { LayoutDashboard, ShoppingCart, Package, RefreshCw, Users, ChevronLeft, ChevronRight, Tag, Award } from 'lucide-react';
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
        'fixed top-0 h-full bg-white border-gray-200 transition-all duration-300 z-30',
        isRTL ? 'right-0 border-l' : 'left-0 border-r',
        isOpen ? 'w-64' : 'w-20'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="font-semibold text-gray-900">Zenda</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:flex items-center justify-center"
        >
          {isOpen ? (
            isRTL ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            isRTL ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />
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
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-green-600')} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
