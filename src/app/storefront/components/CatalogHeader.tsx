import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface CatalogHeaderProps {
    title: string;
    productCount: number;
    isArabic: boolean;
    onSortChange: (value: string) => void;
}

export function CatalogHeader({ title, productCount, isArabic, onSortChange }: CatalogHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 mb-12">
            <div className="space-y-1">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                    {title}
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {productCount} {isArabic ? 'منتج متاح' : 'Products'}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hidden md:block">
                    {isArabic ? 'ترتيب:' : 'SORT:'}
                </span>
                <Select onValueChange={onSortChange} defaultValue="newest">
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-gray-100 font-bold bg-white shadow-sm hover:border-gray-900 transition-all text-xs">
                        <SelectValue placeholder={isArabic ? 'الأحدث' : 'Newest'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                        <SelectItem value="newest" className="font-bold text-xs">{isArabic ? 'الأحدث' : 'Newest'}</SelectItem>
                        <SelectItem value="bestselling" className="font-bold text-xs">{isArabic ? 'الأكثر مبيعاً' : 'Best Selling'}</SelectItem>
                        <SelectItem value="p-low" className="font-bold text-xs">{isArabic ? 'الأقل سعراً' : 'Price: Low'}</SelectItem>
                        <SelectItem value="p-high" className="font-bold text-xs">{isArabic ? 'الأعلى سعراً' : 'Price: High'}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
