import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { cn } from '../../components/ui/utils';

interface TrustSectionProps {
    isArabic: boolean;
}

export function TrustSection({ isArabic }: TrustSectionProps) {
    const items = [
        {
            icon: Truck,
            title: isArabic ? "شحن سريع وآمن" : "Fast & Secure Shipping",
            desc: isArabic ? "توصيل لباب منزلك في أسرع وقت" : "Door-to-door delivery in record time"
        },
        {
            icon: RotateCcw,
            title: isArabic ? "استرجاع مرن" : "Easy Returns",
            desc: isArabic ? "سياسة استبدال واسترجاع سهلة" : "Hassle-free return and exchange policy"
        },
        {
            icon: ShieldCheck,
            title: isArabic ? "جودة مضمونة" : "Guaranteed Quality",
            desc: isArabic ? "نفحص كل قطعة بعناية فائقة" : "We inspect every piece with great care"
        },
        {
            icon: Headphones,
            title: isArabic ? "دعم متواصل" : "Always Supporting",
            desc: isArabic ? "فريقنا معك في كل خطوة" : "Our team is with you every step"
        }
    ];

    return (
        <section className="py-20 border-y border-gray-50 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col items-center text-center space-y-4 group",
                                isArabic ? "font-cairo" : ""
                            )}
                        >
                            <div className="size-16 rounded-[2rem] bg-gray-50 flex items-center justify-center transition-all duration-500 group-hover:bg-gray-900 group-hover:rotate-[10deg] shadow-sm">
                                <item.icon className="size-6 text-gray-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-sm md:text-base text-gray-900 uppercase tracking-wide">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
