import { useMemo, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useAlerts } from '../context/AlertContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';
import { ScrollArea } from './ui/scroll-area';

interface NotificationDropdownProps {
  language: 'ar' | 'en';
}

export function NotificationDropdown({ language }: NotificationDropdownProps) {
  const isRTL = language === 'ar';
  const { alerts, unreadCount, loadMore, hasMore, loading, markAsRead } = useAlerts();
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());
  }, [alerts]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    navigate(`/alerts?id=${id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align={isRTL ? 'start' : 'end'} 
        className="w-80 p-0 rounded-2xl shadow-2xl border-border"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-base">
            {isRTL ? 'التنبيهات' : 'Notifications'}
          </h3>
        </div>

        <ScrollArea className="h-[400px] overflow-y-auto">
          {sortedAlerts.length > 0 ? (
            <div className="flex flex-col">
              {sortedAlerts.map((alert, index) => (
                <div key={alert.id} ref={index === sortedAlerts.length - 1 ? lastElementRef : null}>
                  <DropdownMenuItem
                    onClick={() => handleNotificationClick(alert.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted transition-colors outline-none",
                      !alert.is_read ? "bg-muted/30" : "bg-transparent"
                    )}
                  >
                    <div className={cn(
                      "text-sm",
                      !alert.is_read ? "font-bold text-foreground" : "font-normal text-muted-foreground"
                    )}>
                      {alert.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70">
                      {formatDistanceToNow(new Date(alert.triggered_at), { 
                        addSuffix: true, 
                        locale: isRTL ? ar : enUS 
                      })}
                    </div>
                  </DropdownMenuItem>
                  {index < sortedAlerts.length - 1 && <DropdownMenuSeparator className="m-0 bg-border/50" />}
                </div>
              ))}
              
              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              <p className="text-sm">
                {isRTL ? 'لا يوجد تنبيهات حالياً' : 'No notifications yet'}
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
