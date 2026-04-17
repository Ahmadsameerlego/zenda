import { useEffect, useRef } from 'react';
import { AlertCircle, TrendingUp, Info, ShieldAlert } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert } from '../types/alerts';
import { useAlerts } from '../context/AlertContext';

interface AlertCardProps {
  alert: Alert;
  language: 'ar' | 'en';
  isHighlighted?: boolean;
}

const translations = {
  ar: {
    product: 'المنتج',
    city: 'المدينة',
    reason: 'السبب',
    why: 'لماذا هذا التنبيه؟',
    highImpact: 'تأثير عالي',
    ignore: 'تجاهل',
    metric: 'القيمة الحالية',
    spike: 'التغير',
  },
  en: {
    product: 'Product',
    city: 'City',
    reason: 'Reason',
    why: 'Why this alert?',
    highImpact: 'High Impact',
    ignore: 'Ignore',
    metric: 'Current Value',
    spike: 'Change',
  }
};

export function AlertCard({ alert, language, isHighlighted }: AlertCardProps) {
  const isRTL = language === 'ar';
  const t = translations[language];
  const { markAsRead } = useAlerts();
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Scroll into view if highlighted
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      controls.start({
        backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(255, 255, 255, 0)'],
        transition: { duration: 2, repeat: 1 }
      });
    }
  }, [isHighlighted, controls]);

  const typeStyles = {
    risk: 'border-red-500 bg-red-50/5 text-red-600',
    opportunity: 'border-green-500 bg-green-50/5 text-green-600',
    info: 'border-gray-500 bg-gray-50/5 text-gray-600',
  };

  const priorityStyles = alert.priority === 'critical' 
    ? 'ring-2 ring-red-600 ring-offset-2 shadow-lg scale-[1.01]' 
    : '';

  const Icon = {
    risk: AlertCircle,
    opportunity: TrendingUp,
    info: Info,
  }[alert.type];

  const getSecondaryAction = () => {
    switch (alert.category) {
      case 'orders': return isRTL ? 'عرض المنتجات المتأثرة' : 'View affected products';
      case 'products': return isRTL ? 'تعديل المنتج' : 'Edit product';
      case 'customers': return isRTL ? 'عرض ملف العميل' : 'View customer profile';
      default: return '';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      animate={controls}
      className={cn(
        'group relative border-r-4 p-6 rounded-2xl shadow-sm transition-all',
        alert.is_read ? 'bg-card' : 'bg-muted/30',
        typeStyles[alert.type].split(' ')[0], // only border color class
        priorityStyles,
        isHighlighted && 'ring-2 ring-blue-500'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl bg-muted', typeStyles[alert.type].split(' ').slice(1).join(' '))}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className={cn(
            'text-lg text-foreground',
            !alert.is_read ? 'font-bold' : 'font-medium'
          )}>
            {alert.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {alert.priority === 'critical' && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white animate-pulse">
              <ShieldAlert className="w-3 h-3 ml-1" />
              {isRTL ? 'حرج جداً' : 'CRITICAL'}
            </Badge>
          )}
          {alert.priority === 'high' && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
              {t.highImpact}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Metric Section */}
        <div className="flex gap-10 items-center p-4 bg-muted/20 rounded-xl">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t.metric}</p>
            <p className="text-2xl font-black text-foreground">{alert.metric_value}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t.spike}</p>
            <p className={cn(
              'text-2xl font-black',
              alert.type === 'risk' ? 'text-red-600' : 'text-green-600'
            )}>
              {alert.meta.spike || '—'}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t.product}</p>
            <p className="text-sm font-bold text-foreground truncate">{alert.meta.top_product_name || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t.city}</p>
            <p className="text-sm font-bold text-foreground truncate">{alert.meta.top_city || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t.reason}</p>
            <p className="text-sm font-bold text-foreground truncate">{alert.meta.top_reason || '—'}</p>
          </div>
        </div>
      </div>

      {/* Why Section */}
      <div className="mb-8 p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
        <p className="text-xs font-bold text-blue-700 mb-1">{t.why}</p>
        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
          {alert.why_text}
        </p>
      </div>

      {/* CTA Section */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => markAsRead(alert.id)}
          className={cn(
            'rounded-xl px-8 h-12 font-bold transition-transform active:scale-95',
            alert.type === 'risk' && 'bg-red-600 hover:bg-red-700',
            alert.type === 'opportunity' && 'bg-green-600 hover:bg-green-700',
            alert.type === 'info' && 'bg-primary hover:bg-primary/90'
          )}
        >
          {alert.action_text}
        </Button>
        <Button variant="outline" className="rounded-xl px-8 h-12 border-border bg-transparent hover:bg-muted font-bold">
          {getSecondaryAction()}
        </Button>
        <Button variant="ghost" className="rounded-xl px-6 h-12 text-muted-foreground hover:text-foreground font-medium">
          {t.ignore}
        </Button>
      </div>
    </motion.div>
  );
}
