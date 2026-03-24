import { Star } from 'lucide-react';
import { cn } from '../../components/ui/utils';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
}

interface TestimonialsProps {
    testimonials: Testimonial[];
    isArabic: boolean;
    primaryColor: string;
}

export function Testimonials({ testimonials, isArabic }: TestimonialsProps) {
    return (
        <section className="py-24 md:py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase block">
                        {isArabic ? "ماذا يقولون عنا" : "CLIENT STORIES"}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                        {isArabic ? "ثقة نعتز بها" : "Trusted by Many"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {testimonials.map((t, i) => (
                        <div
                            key={t.id}
                            className={cn(
                                "flex flex-col space-y-8 group animate-in fade-in slide-in-from-bottom-8 duration-700",
                                isArabic ? "text-right items-end" : "text-left items-start"
                            )}
                            style={{ animationDelay: `${i * 200}ms` }}
                        >
                            <div className="flex gap-1 text-amber-400">
                                {[...Array(5)].map((_, star) => (
                                    <Star key={star} className="size-4 fill-current" />
                                ))}
                            </div>

                            <blockquote className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed italic">
                                "{t.content}"
                            </blockquote>

                            <div className="space-y-1">
                                <p className="font-black text-sm text-gray-900 uppercase tracking-widest">
                                    {t.name}
                                </p>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {t.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
