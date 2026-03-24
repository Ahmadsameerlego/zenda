import { cn } from '../../components/ui/utils';

interface CTASectionProps {
    isArabic: boolean;
    primaryColor: string;
}

export function CTASection({ isArabic, primaryColor }: CTASectionProps) {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-gray-900 flex items-center justify-center">
            {/* Background Subtle texture or pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-12">
                <h2 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter">
                    {isArabic ? "جاهز لتغيير استايلك؟" : "Ready to Elevate Your Style?"}
                </h2>

                <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto font-medium">
                    {isArabic
                        ? "انضم إلى آلاف العملاء الذين يثقون في جودتنا واختياراتنا الفريدة."
                        : "Join thousands of customers who trust our quality and unique selections."}
                </p>

                <div className="pt-4">
                    <button
                        className="h-16 md:h-20 px-16 rounded-full font-black text-sm text-white transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-[0.3em]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {isArabic ? "ابدأ التسوق الآن" : "START SHOPPING NOW"}
                    </button>
                </div>
            </div>
        </section>
    );
}
