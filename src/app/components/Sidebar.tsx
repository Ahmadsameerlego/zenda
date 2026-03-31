import { useState } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, ShoppingCart, Package, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: RefreshCw, label: 'Returns / Exchanges', path: '/returns' },
  { icon: Users, label: 'Team', path: '/team' },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-30',
        isOpen ? 'w-64' : 'w-20'
      )}
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
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors hidden lg:flex items-center justify-center"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
