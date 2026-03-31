import { useNavigate, useParams } from 'react-router';
import { StorefrontHomePublic } from '../../types/storefront';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface HeroProps {
    store: StorefrontHomePublic;
}

export function Hero({ store }: HeroProps) {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const isArabic = store.default_language === 'ar';
    const primaryColor = store.primary_color || '#000000';

    return (
        <section className="relative w-full h-[85vh] min-h-[600px] flex items-center overflow-hidden">
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1445205170230-053b830c6050?auto=format&fit=crop&q=80"
                    alt={store.store_name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-10">
                <div className={isArabic ? "mr-auto text-right max-w-2xl" : "ml-auto text-left max-w-2xl"}>
                    <div className="space-y-8 md:space-y-12">
                        <div className="space-y-4 md:space-y-6">
                            <span className="inline-block text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {isArabic ? 'تشكيلة الموسم الجديد' : 'NEW SEASON COLLECTION'}
                            </span>
                            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                {isArabic ? (
                                    <>
                                        تفرّد <span className="text-white/60 font-medium">بأسلوبك</span><br />
                                        الخاص والمميز
                                    </>
                                ) : (
                                    <>
                                        Define <span className="text-white/60 font-medium">Your</span><br />
                                        Signature Style
                                    </>
                                )}
                            </h1>
                            <p className="text-lg md:text-2xl text-white/70 font-medium max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                {isArabic ? 'اكتشف أرقى القطع المختارة بعناية لتناسب ذوقك الرفيع.' : 'Discover the finest pieces carefully selected to suit your refined taste.'}
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                            <Button
                                className="w-full sm:w-auto px-12 h-16 md:h-20 text-sm font-black gap-3 shadow-2xl transition-all hover:scale-105 rounded-full uppercase tracking-widest"
                                style={{ backgroundColor: primaryColor }}
                                onClick={() => navigate(`/store/${slug}/products`)}
                            >
                                <ShoppingBag className="size-5" />
                                {isArabic ? 'تسوق الآن' : 'SHOP NOW'}
                            </Button>
                            <button
                                className="w-full sm:w-auto text-white/80 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors py-4 px-8 border-b border-white/20 hover:border-white"
                                onClick={() => navigate(`/store/${slug}/products`)}
                            >
                                {isArabic ? 'تصفح الكل' : 'BROWSE ALL'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator or Subtle Brand Edge */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:block animate-bounce opacity-20">
                <div className="w-px h-16 bg-card" />
            </div>
        </section>
    );
}
