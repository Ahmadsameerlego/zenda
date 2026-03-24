import { useState } from 'react';
import { X, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';

interface FilterSystemProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    minPrice: string;
    maxPrice: string;
    onPriceChange: (min: string, max: string) => void;
    isArabic: boolean;
    primaryColor: string;
    isOpen: boolean; // For mobile drawer
    onToggle: () => void; // For mobile drawer toggle
}

export function FilterSystem({
    categories,
    selectedCategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    onPriceChange,
    isArabic,
    primaryColor,
    isOpen,
    onToggle
}: FilterSystemProps) {
    const [localMin, setLocalMin] = useState(minPrice);
    const [localMax, setLocalMax] = useState(maxPrice);

    const handleApplyPrice = () => {
        onPriceChange(localMin, localMax);
    };

    const handleReset = () => {
        onCategoryChange(isArabic ? 'الكل' : 'All');
        setLocalMin('');
        setLocalMax('');
        onPriceChange('', '');
    };

    const filterContent = (
        <div className="space-y-12">
            {/* 1. Category Filter */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center justify-between border-b border-gray-50 pb-4">
                    {isArabic ? 'التصنيفات' : 'CATEGORIES'}
                    <ChevronDown className="size-3 text-gray-300" />
                </h4>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={cn(
                                "w-full text-right py-2 px-1 text-sm font-medium transition-all flex items-center justify-between group",
                                isArabic ? "text-right" : "text-left",
                                selectedCategory === cat ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                            )}
                            onClick={() => onCategoryChange(cat)}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && <div className="size-1 rounded-full bg-gray-900" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Price Range Filter */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                    {isArabic ? 'نطاق السعر' : 'PRICE RANGE'}
                </h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{isArabic ? 'من' : 'MIN'}</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={localMin}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalMin(e.target.value)}
                                className="h-10 rounded-xl border-gray-50 font-bold focus:border-gray-900 focus:ring-0 bg-gray-50/30 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{isArabic ? 'إلى' : 'MAX'}</Label>
                            <Input
                                type="number"
                                placeholder="10000"
                                value={localMax}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalMax(e.target.value)}
                                className="h-10 rounded-xl border-gray-50 font-bold focus:border-gray-900 focus:ring-0 bg-gray-50/30 text-xs"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleApplyPrice}
                        variant="outline"
                        className="w-full h-10 rounded-xl font-black border border-gray-100 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-[10px] uppercase tracking-widest transition-all"
                    >
                        {isArabic ? 'تطبيق' : 'APPLY'}
                    </Button>
                </div>
            </div>

            {/* 3. Reset Button */}
            <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full h-10 gap-2 text-gray-300 hover:text-gray-900 hover:bg-gray-50 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
            >
                <RotateCcw className="size-3" />
                {isArabic ? 'إعادة ضبط' : 'RESET'}
            </Button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                    {filterContent}
                </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {isOpen && (
                <>
                    <div
                        onClick={onToggle}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
                    />
                    <div
                        className={cn(
                            "fixed inset-y-0 w-full max-w-[300px] bg-white shadow-2xl z-[151] lg:hidden flex flex-col",
                            isArabic ? "right-0" : "left-0"
                        )}
                        dir={isArabic ? 'rtl' : 'ltr'}
                    >
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                {isArabic ? 'الفلاتر' : 'Filters'}
                            </h3>
                            <button onClick={onToggle} className="size-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors">
                                <X className="size-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {filterContent}
                        </div>
                        <div className="p-6 border-t border-gray-50 bg-white">
                            <Button
                                onClick={onToggle}
                                className="w-full h-14 text-xs font-black rounded-xl shadow-lg transition-all active:scale-95"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isArabic ? 'عرض النتائج' : 'SHOW RESULTS'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
