import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert, AlertSummary } from '../types/alerts';

interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  markAsRead: (id: string) => void;
  summary: AlertSummary;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Helper to generate mock alerts
const generateMockAlerts = (startId: number, count: number): Alert[] => {
  const categories: Alert['category'][] = ['orders', 'products', 'customers'];
  const types: Alert['type'][] = ['risk', 'opportunity', 'info'];
  const priorities: Alert['priority'][] = ['low', 'medium', 'high', 'critical'];

  return Array.from({ length: count }, (_, i) => {
    const id = (startId + i).toString();
    const type = types[i % 3];
    const category = categories[i % 3];
    const priority = priorities[i % 4];
    
    return {
      id,
      type,
      category,
      title: type === 'risk' ? `مخاطرة في ${category}` : type === 'opportunity' ? `فرصة في ${category}` : `معلومات عن ${category}`,
      description: `وصف مفصل للتنبيه رقم ${id} الذي تم إنشاؤه تلقائياً لغرض العرض.`,
      metric_value: `${Math.floor(Math.random() * 50 + 10)}%`,
      meta: {
        top_product_name: 'منتج تجريبي أ',
        top_city: 'القاهرة',
        top_reason: 'تغير في سلوك الشراء',
        cancel_rate: '12%',
        spike: '+5%'
      },
      is_read: false,
      triggered_at: new Date(Date.now() - i * 3600000).toISOString(),
      priority,
      why_text: 'تم اكتشاف هذا التنبيه بسبب زيادة مفاجئة في معدلات الإلغاء خلال الساعات الماضية.',
      action_text: 'اتخاذ إجراء الآن',
      target_url: `/alerts?id=${id}`
    };
  });
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAlerts = generateMockAlerts(page * 10 + 1, 10);
    setAlerts(prev => [...prev, ...newAlerts]);
    setPage(prev => prev + 1);
    
    if (page >= 5) setHasMore(false); // Stop after 60 alerts
    setLoading(false);
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadMore();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, is_read: true } : alert
    ));
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const summary = {
    risk: alerts.filter(a => a.type === 'risk').length,
    opportunity: alerts.filter(a => a.type === 'opportunity').length,
    info: alerts.filter(a => a.type === 'info').length,
  };

  return (
    <AlertContext.Provider value={{ 
      alerts, 
      unreadCount, 
      loading, 
      hasMore, 
      loadMore, 
      markAsRead, 
      summary 
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used within an AlertProvider');
  return context;
};
