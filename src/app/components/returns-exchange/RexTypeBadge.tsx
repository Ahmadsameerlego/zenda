import { Badge } from '../ui/badge';
import { RexType } from '../../types/rex';
import { ArrowLeftRight, RotateCcw } from 'lucide-react';

const typeTranslations = {
    ar: {
        return: 'مرتجع',
        exchange: 'استبدال',
    },
    en: {
        return: 'Return',
        exchange: 'Exchange',
    }
};

const typeColors: Record<RexType, string> = {
    return: 'bg-rose-50 text-rose-700 border-rose-200',
    exchange: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function RexTypeBadge({ type, language }: { type: RexType; language: 'ar' | 'en' }) {
    const label = typeTranslations[language][type] || type;
    const colorClass = typeColors[type] || 'bg-muted text-gray-700 border-border';

    return (
        <Badge variant="outline" className={`${colorClass} flex items-center gap-1.5 w-fit`}>
            {type === 'return' ? <RotateCcw className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </Badge>
    );
}
