import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from './ui/utils';
import { ReactNode } from 'react';

interface StatCardArabicProps {
  title: string;
  value: string | number;
  change?: number; // legacy support if needed
  delta_pct?: number | null; // new delta from RPC
  isPositive?: boolean;
  isMoney?: boolean;
  language: 'ar' | 'en';
  className?: string;
  icon?: ReactNode;
  tooltipText?: string;
}

export function StatCardArabic({
  title,
  value,
  delta_pct,
  isMoney = false,
  language,
  className,
  icon,
  tooltipText
}: StatCardArabicProps) {
  const isRTL = language === 'ar';

  // Calculate positivity for delta
  const isPositiveDelta = delta_pct != null && delta_pct >= 0;
  const absDeltaPct = delta_pct != null ? Math.abs(delta_pct) : null;

  return (
    <div
      className={cn(
        'bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative group/card',
        isMoney && 'border-green-100',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          {tooltipText && (
            <div className="relative group/tooltip inline-block">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-muted-foreground transition-colors" />
              <div className={cn(
                "absolute bottom-full mb-2 hidden group-hover/tooltip:block z-[100] w-56 p-3 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl shadow-2xl leading-relaxed border border-white/10",
                isRTL ? "right-0 text-right" : "left-0 text-left"
              )}>
                {tooltipText}
                <div className={cn(
                  "absolute top-full border-[6px] border-transparent border-t-gray-900/95",
                  isRTL ? "right-3" : "left-3"
                )} />
              </div>
            </div>
          )}
        </div>
        {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
      </div>

      <div className="flex items-end justify-between gap-2 mt-auto">
        <h3 className={cn(
          'font-bold text-foreground truncate',
          isMoney ? 'text-2xl' : 'text-2xl'
        )}>
          {value}
        </h3>

        {delta_pct !== undefined && (
          <div className="flex flex-col items-center shrink-0">
            {delta_pct !== null ? (
              <>
                <div
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold',
                    isPositiveDelta ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  )}
                >
                  {isPositiveDelta ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  <span>
                    {isRTL
                      ? `%${absDeltaPct?.toLocaleString('ar-EG', { maximumFractionDigits: 1 })}`
                      : `${absDeltaPct?.toFixed(1)}%`}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                  {isRTL ? 'مقارنة بالسابقة' : 'vs prev'}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">—</span>
            )}
          </div>
        )}
      </div>

      {isMoney && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/10" />
      )}
    </div>
  );
}

