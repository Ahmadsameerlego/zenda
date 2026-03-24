import { cn } from '../../components/ui/utils';

interface BrandSectionProps {
    isArabic: boolean;
    primaryColor: string;
}

export function BrandSection({ isArabic, primaryColor }: BrandSectionProps) {
    return (
        <section className="py-24 md:py-32 bg-gray-50/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className={cn(
                    "flex flex-col lg:flex-row items-center gap-12 lg:gap-24",
                    isArabic ? "lg:flex-row-reverse" : ""
                )}>
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-right">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
                                {isArabic ? "هويتنا وتاريخنا" : "OUR IDENTITY"}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.2] tracking-tight">
                                {isArabic ? "نصنع الفخامة لكل يوم" : "Crafting Luxury for Every Day"}
                            </h2>
                        </div>

                        <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                            {isArabic
                                ? "ولدت زندا من شغفنا بالجمال والأصالة. نحن نؤمن أن كل قطعة تقتنيها يجب أن تحكي قصة، وتعكس جانباً من شخصيتك المتفردة. نجمع بين الحرفة التقليدية والتصميم العصري لنقدم لك تجربة لا تُنسى."
                                : "Zenda was born from a passion for beauty and authenticity. We believe every piece you own should tell a story and reflect a part of your unique personality. We combine traditional craftsmanship with modern design to offer you an unforgettable experience."}
                        </p>

                        <div className="pt-4">
                            <button
                                className="h-14 px-10 rounded-full font-black text-sm text-white transition-all hover:scale-105 shadow-xl shadow-gray-200"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isArabic ? "تعرف علينا أكثر" : "DISCOVER MORE"}
                            </button>
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 relative">
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"
                                alt="Brand Lifestyle"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/5" />
                        </div>

                        {/* Decorative Elements */}
                        <div
                            className="absolute -top-6 -right-6 size-32 rounded-full opacity-20 blur-3xl"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <div
                            className="absolute -bottom-10 -left-10 size-48 rounded-full opacity-10 blur-3xl"
                            style={{ backgroundColor: primaryColor }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
