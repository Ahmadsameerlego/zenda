import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Target, Eye, Heart, ArrowRight } from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontPage } from '../../types/storefront';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

export default function AboutUs() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [pages, setPages] = useState<StorefrontPage[]>([]);
    const [loading, setLoading] = useState(true);

    const isArabic = true;
    const primaryColor = store?.primary_color || '#000000';

    useEffect(() => {
        if (!slug) return;
        const load = async () => {
            const [storeData, pagesData] = await Promise.all([
                storefrontApi.getStoreHome(slug),
                storefrontApi.getStorePages(slug)
            ]);
            setStore(storeData);
            setPages(pagesData);
            setLoading(false);
        };
        load();
    }, [slug]);

    if (loading) return null;
    if (!store) return <div>Store not found</div>;

    return (
        <StorefrontLayout store={store} pages={pages} isArabic={isArabic}>
            {/* Immersive Hero */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900 border-b border-gray-100">
                <div className="absolute inset-0">
                    <img
                        src={store.cover_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80'}
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />

                <div className="relative z-10 text-center space-y-8 px-6">
                    <span
                        className="text-xs md:text-sm font-black tracking-[0.4em] text-gray-400 uppercase"
                    >
                        {isArabic ? 'قصة علامتنا التجارية' : 'OUR BRAND STORY'}
                    </span>
                    <h1
                        className="text-5xl md:text-8xl font-[1000] text-gray-900 tracking-tighter"
                    >
                        {isArabic ? 'نحن نؤمن بالتميز' : 'We Believe In Excellence'}
                    </h1>
                </div>
            </section>

            {/* Core Story */}
            <section className="py-24 md:py-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 text-right" dir="rtl">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-5xl font-[950] text-gray-900 tracking-tighter leading-tight">
                                    {isArabic ? 'رؤية بدأت بشغف، ونمت بإخلاص.' : 'A vision born from passion, grown with dedication.'}
                                </h2>
                                <p className="text-lg md:text-2xl text-gray-500 leading-relaxed font-medium">
                                    {store.full_description || store.short_description || (isArabic ? 'نحن نسعى لتقديم أفضل المنتجات لعملائنا بكل حب وإخلاص.' : 'We strive to provide the best products to our customers with love and sincerity.')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-100">
                                <div className="space-y-2">
                                    <h4 className="text-4xl font-[1000] text-gray-900">12k+</h4>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{isArabic ? 'عميل سعيد' : 'Happy Customers'}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-4xl font-[1000] text-gray-900">100%</h4>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{isArabic ? 'ضمان جودة' : 'Quality Guarantee'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square rounded-[4rem] overflow-hidden shadow-22">
                                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-10 -right-10 size-48 bg-gray-50 rounded-full flex items-center justify-center p-8 text-center text-[1000] tracking-widest leading-relaxed border border-gray-100 rotate-12">
                                {isArabic ? 'بكل فخر منذ ٢٠٢٤' : 'PROUDLY SINCE 2024'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 md:py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Target, title: isArabic ? 'رسالتنا' : 'Our Mission', text: isArabic ? 'توفير تجربة تسوق فريدة تتخطى التوقعات وتمنح عملاءنا الثقة المطلقة.' : 'Providing a unique shopping experience that exceeds expectations.' },
                            { icon: Eye, title: isArabic ? 'رؤيتنا' : 'Our Vision', text: isArabic ? 'أن نكون العلامة التجارية الرائدة والمفضلة في تقديم المنتجات عالية الجودة.' : 'To be the leading and preferred brand in providing high-quality products.' },
                            { icon: Heart, title: isArabic ? 'قيمنا' : 'Our Values', text: isArabic ? 'الصدق، الجودة، والاهتمام بأدق التفاصيل هو ما يميز كل ما نقدمه.' : 'Honesty, quality, and attention to detail are what distinguish us.' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-12 rounded-[3.5rem] bg-white shadow-xl shadow-gray-200/50 space-y-6 text-center border border-gray-100"
                            >
                                <div className="size-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-gray-900">
                                    <item.icon className="size-8" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{item.title}</h3>
                                <p className="text-gray-500 font-bold leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 md:py-40 text-center space-y-12">
                <h2 className="text-4xl md:text-7xl font-[1000] text-gray-900 tracking-tighter leading-none">
                    {isArabic ? 'اكتشف مجموعتنا الآن' : 'Discover Our Collection'}
                </h2>
                <Button
                    size="lg"
                    className="h-20 px-16 text-xl font-[1000] gap-4 shadow-2xl"
                    style={{ backgroundColor: primaryColor, borderRadius: store.button_radius === 'full' ? '9999px' : '1.5rem' }}
                    onClick={() => navigate(`/store/${slug}/products`)}
                >
                    {isArabic ? 'ابدأ التسوق' : 'START SHOPPING'}
                    <ArrowRight className="size-6" />
                </Button>
            </section>
        </StorefrontLayout>
    );
}
