import { Menu, Bell, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface TopbarProps {
  onMenuClick: () => void;
  storeName?: string;
}

export function Topbar({ onMenuClick, storeName = "Fashion Hub Store" }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-card border-b border-border z-20 transition-all">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">{storeName}</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Manage your store efficiently</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1 transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                  <AvatarFallback className="bg-green-100 text-green-700">SA</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-sm text-gray-700">Sarah Anderson</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">Sarah Anderson</p>
                  <p className="text-xs text-muted-foreground">sarah@fashionhub.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Store Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
