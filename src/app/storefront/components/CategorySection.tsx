import { cn } from '../../components/ui/utils';

interface Category {
    name: string;
    image: string;
    count?: number;
}

interface CategorySectionProps {
    categories: Category[];
    isArabic: boolean;
    primaryColor: string;
    cardRadius: string;
    onCategoryClick: (name: string) => void;
}

export function CategorySection({ categories, isArabic, primaryColor, onCategoryClick }: CategorySectionProps) {
    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase block">
                        {isArabic ? 'مجموعاتنا' : 'OUR COLLECTIONS'}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                        {isArabic ? 'اختر بأسلوبك' : 'Choose Your Style'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    {categories.slice(0, 3).map((category, i) => (
                        <div
                            key={i}
                            onClick={() => onCategoryClick(category.name)}
                            className={cn(
                                "group relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-50 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] md:rounded-[3.5rem]"
                            )}
                        >
                            {/* Image with zoom effect */}
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                                    {category.name}
                                </h3>
                                <div className="h-px w-0 group-hover:w-16 bg-white transition-all duration-500" />
                                <span className="text-[10px] font-black text-white/0 group-hover:text-white transition-all duration-500 uppercase tracking-[0.3em]">
                                    {isArabic ? 'تسوق الآن' : 'SHOP NOW'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
